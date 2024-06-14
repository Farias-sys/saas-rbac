import {auth} from "../../middlewares/auth"
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import generateSlug from "../../../utils/create-slug";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function createProject(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/organizations/:slug/projects', {
        schema: {
            tags: ['projects'],
            summary: 'Create a new Project',
            security: [{bearerAuth:[]}],
            params: z.object({
                slug: z.string()
            }),
            body: z.object({
                name: z.string(),
                description: z.string()
            }),
            response: {
                201: z.object({
                    projectId: z.string().uuid()
                })
            }
        }            
    },
        async (request, response) => {
            const { slug } = request.params;
            const { name, description } = request.body;

            const userId = await request.getCurrentUserId();
            const { organization, membership } = await request.getUserMembership(slug);

            const {cannot} = getUserPermissions(userId, membership.role);

            if(cannot('create', 'Project')){
                throw new UnauthorizedError('You are not allowed to create a new Project');
            }

            const project = await prisma.project.create({
                data: {
                    name, 
                    slug: generateSlug(name),
                    description,
                    organizationId: organization.id,
                    ownerId: userId
                }
            })

            return response.status(201).send({
                projectId: project.id
            })

        }
    )
}