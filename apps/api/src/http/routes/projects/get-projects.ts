import {auth} from "../../middlewares/auth"
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function getProjects(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/organizations/:orgSlug/projects', {
        schema: {
            tags: ['projects'],
            summary: 'Create a new Project',
            security: [{bearerAuth:[]}],
            params: z.object({
                orgSlug: z.string()
            }),
            response: {
                200: z.object({
                    projects: z.array(z.object({
                        id: z.string().uuid(),
                        name: z.string(),
                        description: z.string(),
                        slug: z.string(),
                        ownerId: z.string().uuid(),
                        avatarUrl: z.string().nullable(),
                        organizationId: z.string().uuid(),
                        owner: z.object({
                            id: z.string().uuid(),
                            name: z.string().nullable(),
                            avatarUrl: z.string().nullable()
                        })
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

            if(cannot('get', 'Project')){
                throw new UnauthorizedError('You are not allowed to see the projects of this organization');
            }

            const projects = await prisma.project.findMany({
                select: {
                    id: true,
                    name: true,
                    description: true,
                    slug: true,
                    ownerId: true,
                    avatarUrl: true,
                    organizationId: true,
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true
                        }
                    },
                    createdAt: true
                },
                where: {
                    organizationId: organization.id
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })

            return response.status(200).send({projects : projects})

        }
    )
}