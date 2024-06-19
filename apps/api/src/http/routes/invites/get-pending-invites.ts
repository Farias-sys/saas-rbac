import {auth} from "../../middlewares/auth"
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { BadRequestError } from "../_errors/bad-request-error";
import { RoleSchema } from "@saas/auth";

export async function getPendingInvites(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/pending-invites', {
        schema: {
            tags: ['invites'],
            summary: 'Get all user pending invites',
            security: [{bearerAuth:[]}],
            response: {
                200: z.object({
                    invites: z.array(
                        z.object({
                            id: z.string().uuid(),
                            email: z.string().email(),
                            role: RoleSchema,
                            createdAt: z.date(),
                            author: z.object({
                                id: z.string().uuid(),
                                name: z.string().nullable(),
                                avatarUrl: z.string().nullable()
                            }).nullable(),
                            organization: z.object({
                                name: z.string(),
                            })
                        })
                    )
                })
            }
        }            
    },
        async (request, response) => {
            const userId = await request.getCurrentUserId();
            
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })

            if(!user){
                throw new BadRequestError('User not found')
            }

            const invites = await prisma.invite.findMany({
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true
                        }
                    },
                    organization: {
                        select: {
                            name: true
                        }
                    }
                },
                where: {
                    email: user.email
                }
            })

            return response.status(200).send({invites})
        }
    )
}