import {auth} from "../../middlewares/auth"
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function removeMember(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete('/organizations/:slug/members/:memberId', {
        schema: {
            tags: ['members'],
            summary: 'Remove a member from an organization',
            security: [{bearerAuth:[]}],
            params: z.object({
                slug: z.string(),
                memberId: z.string().uuid()
            }),
            response: {
                204: z.null()
            }
        }            
    },
        async (request, response) => {
            const { slug, memberId } = request.params;
            const { userId } = await request.getCurrentUserId();
            const { organization, membership } = await request.getUserMembership(slug);           
            
            const { cannot } = getUserPermissions(userId, membership.role);
            
            if(cannot('delete', 'User')){
                throw new UnauthorizedError('You are not allowed to remove this user from organization.');
            }
        
            await prisma.member.delete({
                where:{
                    id: memberId,
                    organizationId: organization.id
                }
            });

            return response.status(204).send();
        }
    )
}