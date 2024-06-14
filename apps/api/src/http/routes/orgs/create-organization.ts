import {auth} from "../../middlewares/auth"
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { BadRequestError } from "../_errors/bad-request-error";
import generateSlug from "../../../utils/create-slug";

export async function createOrganization(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/organizations', {
        schema: {
            tags: ['organizations'],
            summary: 'Create a new Organization',
            security: [{bearerAuth:[]}],
            body: z.object({
                name: z.string(),
                domain: z.string().nullish(),
                shouldAttachUsersByDomain: z.boolean().optional()  
            }),
            response: {
                201: z.object({
                    organizationId: z.string().uuid()
                })
            }
        }            
    },
        async (request, response) => {
            const userId = await request.getCurrentUserId();
            const {name, domain, shouldAttachUsersByDomain} = request.body;

            if(domain) {
                const organizationByDomain = await prisma.organization.findUnique({
                    where: {domain}
                })

                if(organizationByDomain){
                    throw new BadRequestError('Another organization with same domain already exists.');
                }
            }

            const organization = await prisma.organization.create({
                data: {
                    name,
                    slug: generateSlug(name),
                    domain,
                    shouldAttachUsersByDomain,
                    ownerId: userId,
                    members: {
                        create: {
                            userId,
                            role: 'ADMIN'
                        }
                    }
                }
            });

            return response.status(201).send({organizationId: organization.id});
        }
    )
}