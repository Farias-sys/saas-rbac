import {auth} from "../../middlewares/auth"
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { RoleSchema } from "../../../../../../packages/auth/src";
import { BadRequestError } from "../_errors/bad-request-error";

export async function getInvite(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .get('/invites/:inviteId', {
        schema: {
            tags: ['invites'],
            summary: 'Get a Invite details',
            params: z.object({
                inviteId: z.string().uuid()
            }),
            body: z.object({
                email: z.string().email(),
                role: RoleSchema
            }),
            response: {
                200: z.object({
                    invite: z.object({
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
                })
            }
        }            
    },
        async (request, response) => {
            const { inviteId } = request.params;

            const invite = await prisma.invite.findUnique({
                where: {
                    id: inviteId
                },
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
                }
            });

            if(!invite){
                throw new BadRequestError('Invite not found');
            }

            return response.status(200).send({ invite});
        }
    )
}