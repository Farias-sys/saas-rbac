import {auth} from "../../middlewares/auth"
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { ProjectSchema } from "../../../../../../packages/auth/src/models/project";
import { BadRequestError } from "../_errors/bad-request-error";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function updateProject(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete('/organizations/:slug/projects/:projectId', {
        schema: {
            tags: ['projects'],
            summary: 'Update a Project',
            security: [{bearerAuth:[]}],
            params: z.object({
                slug: z.string(),
                projectId: z.string().uuid()
            }),
            body: z.object({
                name: z.string(),
                description: z.string()
            }),
            response: {
                204: z.null()
            }
        }            
    },
        async (request, response) => {
            const { slug, projectId } = request.params;
            const { name, description } = request.body;

            const { userId } = await request.getCurrentUserId();
            const { organization, membership } = await request.getUserMembership(slug);


            const project = await prisma.project.findUnique({
                where: {
                    id: projectId,
                    organizationId: organization.id
                }
            });

            if(!project){
                throw new BadRequestError('Project not found')
            }
            
            
            const { cannot } = getUserPermissions(userId, membership.role);
            const authProject = ProjectSchema.parse(project);
            
            if(cannot('update', authProject)){
                throw new UnauthorizedError('You are not allowed to update this project.');
            }
        
            await prisma.project.update({
                where:{
                    id: projectId
                },
                data: {
                    name,
                    description
                }
            });

            return response.status(204).send();
        }
    )
}