import {auth} from "../../middlewares/auth"
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { BadRequestError } from "../_errors/bad-request-error";

export async function revokeInvite(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/organizations/:slug/invites/:inviteId', {
        schema: {
            tags: ['invites'],
            summary: 'Revoke an invite',
            security: [{bearerAuth:[]}],
            params: z.object({
                slug: z.string(),
                inviteId: z.string().uuid()
            }),
            response: {
                204: z.null()
            }
        }            
    },
        async (request, response) => {
            const { slug, inviteId } = request.params;

            const userId = await request.getCurrentUserId();
            const { organization, membership } = await request.getUserMembership(slug);

            const {cannot} = getUserPermissions(userId, membership.role);

            if(cannot('revoke', 'Invite')){
                throw new UnauthorizedError('You are not allowed to revoke an invite');
            }

            const invite = await prisma.invite.findUnique({
                where: {
                    id: inviteId,
                    organizationId: organization.id
                }
            });

            if(!invite){
                throw new BadRequestError('Invite not found');
            }

            await prisma.invite.delete({
                where: {
                    id: inviteId,
                    organizationId: organization.id
                }
            })

            return response.status(204).send()

        }
    )
}