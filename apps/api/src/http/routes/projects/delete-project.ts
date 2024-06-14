import {auth} from "../../middlewares/auth"
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { ProjectSchema } from "../../../../../../packages/auth/src/models/project";
import { BadRequestError } from "../_errors/bad-request-error";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function deleteProject(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete('/organizations/:slug/projects/:projectId', {
        schema: {
            tags: ['projects'],
            summary: 'Delete a Project',
            security: [{bearerAuth:[]}],
            params: z.object({
                slug: z.string(),
                projectId: z.string().uuid()
            }),
            response: {
                204: z.null()
            }
        }            
    },
        async (request, response) => {
            const { slug, projectId } = request.params;
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
            
            if(cannot('delete', authProject)){
                throw new UnauthorizedError('You are not allowed to delete this project.');
            }
        
            await prisma.project.delete({
                where:{
                    id: projectId
                }
            });

            return response.status(204).send();
        }
    )
}