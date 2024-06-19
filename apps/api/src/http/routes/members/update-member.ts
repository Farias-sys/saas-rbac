import {auth} from "../../middlewares/auth"
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { RoleSchema } from "@saas/auth";

export async function updateMember(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put('/organizations/:orgSlug/members/:memberId', {
        schema: {
            tags: ['members'],
            summary: 'Update a member',
            security: [{bearerAuth:[]}],
            params: z.object({
                orgSlug: z.string(),
                memberId: z.string().uuid()
            }),
            body: z.object({
                role: RoleSchema
            }),
            response: {
                204: z.null()
                    
            }
        }            
    },
        async (request, response) => {
            const { orgSlug, memberId } = request.params;
            const { role } = request.body;

            const userId = await request.getCurrentUserId();
            const { organization, membership } = await request.getUserMembership(orgSlug);

            const {cannot} = getUserPermissions(userId, membership.role);

            if(cannot('update', 'User')){
                throw new UnauthorizedError('You are not allowed to update this member');
            }

            await prisma.member.update({
                where: {
                    id: memberId,
                    organizationId: organization.id
                },
                data:{
                    role
                }
            });

            return response.status(204).send();

        }
    )
}