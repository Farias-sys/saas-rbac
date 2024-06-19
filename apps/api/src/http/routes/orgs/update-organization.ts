import {auth} from "../../middlewares/auth"
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { BadRequestError } from "../_errors/bad-request-error";
import { OrganizationSchema } from "@saas/auth";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { getUserPermissions } from "../../../utils/get-user-permissions";

export async function updateOrganization(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/organizations/:slug', {
        schema: {
            tags: ['organizations'],
            summary: 'Update a organization',
            security: [{bearerAuth:[]}],
            body: z.object({
                name: z.string(),
                domain: z.string().nullish(),
                shouldAttachUsersByDomain: z.boolean().optional()  
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
            

            const userId = await request.getCurrentUserId();
            const {membership, organization} = await request.getUserMembership(slug);

            const {name, domain, shouldAttachUsersByDomain} = request.body;

            const authOrganization = OrganizationSchema.parse({
                id: organization.id,
                ownerId: organization.ownerId
            });

            const {cannot} = getUserPermissions(userId, membership.role);

            if(cannot('update', authOrganization)){
                throw new UnauthorizedError('You are not allowed to update this organization');
            }

            if(domain) {
                const organizationByDomain = await prisma.organization.findFirst({
                    where: {
                        domain,
                        id: {
                            not: organization.id
                        }
                    }
                })

                if(organizationByDomain){
                    throw new BadRequestError('Another organization with same domain already exists.');
                }
            }

            await prisma.organization.update({
                where: {
                    id: organization.id
                },
                data: {
                    name,
                    domain,
                    shouldAttachUsersByDomain,
                }
            })

            return response.status(204).send()

        }
    )
}