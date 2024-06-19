import {auth} from "../../middlewares/auth"
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { RoleSchema } from "@saas/auth";

export async function getMembers(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/organizations/:orgSlug/members', {
        schema: {
            tags: ['members'],
            summary: 'Get the members of an organization',
            security: [{bearerAuth:[]}],
            params: z.object({
                orgSlug: z.string()
            }),
            response: {
                200: z.object({
                    members: z.array(z.object({
                        userId: z.string().uuid(),
                        id: z.string().uuid(),
                        role: RoleSchema,
                        name: z.string().nullable(),
                        email: z.string().email(),
                        avatarUrl: z.string().nullable()
                }))
            })
                    
            }
        }            
    },
        async (request, response) => {
            const { orgSlug } = request.params;

            const userId = await request.getCurrentUserId();
            const { organization, membership } = await request.getUserMembership(orgSlug);

            const {cannot} = getUserPermissions(userId, membership.role);

            if(cannot('get', 'User')){
                throw new UnauthorizedError('You are not allowed to see the members of this organization');
            }

            const members = await prisma.member.findMany({
                select: {
                    id: true,
                    role: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatarUrl: true
                        }
                    }
                },
                where: {
                    organizationId: organization.id
                },
                orderBy: {
                    role: 'asc'
                }
            })

            const membersWithRoles = members.map(({ user: { id: userId, ...user }, ...member }) => {
                return {
                    ...user,
                    ...member,
                    userId
                }
            })

            return response.status(200).send({members : membersWithRoles})

        }
    )
}