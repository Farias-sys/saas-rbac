import {auth} from "../../middlewares/auth"
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { RoleSchema } from "../../../../../../packages/auth/src";

export async function getInvites(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/organizations/:slug/invites', {
        schema: {
            tags: ['invites'],
            summary: 'Get a list of invites of an organization',
            security: [{bearerAuth:[]}],
            params: z.object({
                slug: z.string()
            }),
            body: z.object({
                email: z.string().email(),
                role: RoleSchema
            }),
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
            const { slug } = request.params;

            const userId = await request.getCurrentUserId();
            const { organization, membership } = await request.getUserMembership(slug);

            const {cannot} = getUserPermissions(userId, membership.role);

            if(cannot('get', 'Invite')){
                throw new UnauthorizedError('You are not allowed to see the invites of this organization');
            }

            const invites = await prisma.invite.findMany({
                where: {
                    organizationId: organization.id
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
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })

            return response.status(200).send({invites});

        }
    )
}