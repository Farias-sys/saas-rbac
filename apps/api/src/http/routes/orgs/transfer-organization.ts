import {auth} from "../../middlewares/auth"
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { BadRequestError } from "../_errors/bad-request-error";
import { OrganizationSchema } from "@saas/auth";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { getUserPermissions } from "../../../utils/get-user-permissions";

export async function transferOrganization(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch('/organizations/:slug/owner', {
        schema: {
            tags: ['organizations'],
            summary: 'Transfer organization ownership',
            security: [{bearerAuth:[]}],
            body: z.object({
                transferToUserId: z.string().uuid()
            }),
            params: z.object({
                slug: z.string()
            }),
            response: {
                204: z.null()
            }
        }            
    },
        async (request, response) => {
            const { slug } = request.params;
            const { transferToUserId } = request.body;
            

            const userId = await request.getCurrentUserId();
            const {membership, organization} = await request.getUserMembership(slug);

            const authOrganization = OrganizationSchema.parse({
                id: organization.id,
                ownerId: organization.ownerId
            });

            const {cannot} = getUserPermissions(userId, membership.role);

            if(cannot('transfer_ownership', authOrganization)){
                throw new UnauthorizedError('You are not allowed to transfer this organization ownership to another user');
            }

            const transferToMembership = await prisma.member.findUnique({
                where: {
                    organizationId_userId: {
                        organizationId: organization.id,
                        userId: transferToUserId
                    }
                }
            });

            if(!transferToMembership){
                throw new BadRequestError('Target user is not a member of this organization.');
            }

            await prisma.$transaction([
                prisma.member.update({
                    where: {
                        organizationId_userId: {
                            organizationId: organization.id,
                            userId: transferToUserId
                        }
                    },
                    data: {
                        role: 'ADMIN'
                    }
                }),
                prisma.organization.update({
                    where: {id: organization.id},
                    data: {ownerId: transferToUserId}
                })
            ])

            return response.status(204).send()

        }
    )
}