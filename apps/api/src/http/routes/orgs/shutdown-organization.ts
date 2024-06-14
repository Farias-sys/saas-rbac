import {auth} from "../../middlewares/auth"
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { BadRequestError } from "../_errors/bad-request-error";
import { OrganizationSchema } from "../../../../../../packages/auth/src/models/organization";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { getUserPermissions } from "../../../utils/get-user-permissions";

export async function shutdownOrganization(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/organizations/:slug', {
        schema: {
            tags: ['organizations'],
            summary: 'Shutdown a organization',
            security: [{bearerAuth:[]}],
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
            

            const userId = await request.getCurrentUserId();
            const {membership, organization} = await request.getUserMembership(slug);

            const authOrganization = OrganizationSchema.parse({
                id: organization.id,
                ownerId: organization.ownerId
            });

            const {cannot} = getUserPermissions(userId, membership.role);

            if(cannot('delete', authOrganization)){
                throw new UnauthorizedError('You are not allowed to shutdown this organization');
            }

            await prisma.organization.delete({
                where: {
                    id: organization.id
                }
            })

            return response.status(204).send()

        }
    )
}