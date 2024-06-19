import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../../middlewares/auth";
import { z } from "zod";
import { RoleSchema } from "@saas/auth";

export async function getMembership(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/organizations/:slug/membership', {
        schema: {
            tags: ['organizations'],
            summary: 'Get user membership on organization',
            security: [{bearerAuth: []}],
            params: z.object({
                slug: z.string()
            }),
            response: {
                200: 
                    {
                        membership: z.object({
                            id: z.string().uuid(),
                            role: RoleSchema,
                            organizationId: z.string().uuid()
                        })
                }
            }
        }
    }, 
        async (request) => {
            const { slug } = request.params;
            const { membership } = await request.getUserMembership(slug);

            return {membership : {
                id: membership.id,
                role: membership.role,
                organizationId: membership.organizationId
            }};
            
        }

    )
}