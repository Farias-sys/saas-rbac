import { auth } from "../../middlewares/auth";
import { prisma } from "../../../lib/prisma";
import { BadRequestError } from "../_errors/bad-request-error";
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export async function requestPasswordRecover(app : FastifyInstance){
    app
        .withTypeProvider<ZodTypeProvider>()
        .post(
            '/password/recover',
            {
                schema: {
                    tags: ['auth'],
                    summary: 'Recover user password',
                    body: z.object({
                        email: z.string().email(),
                    }),
                    response: {
                        201: z.null()
                    }
                }
            },
            async(request, response) => {
                const { email } = request.body;

                const userFromEmail = await prisma.user.findUnique({
                    where: {email}
                })
                
                if(!userFromEmail){
                    return response.status(201).send();
                }

                const {id:code} =  await prisma.token.create({ data: {
                    type: 'PASSWORD_RECOVER',
                    userId: userFromEmail.id
                }})

                return response.status(200).send()

            }
        )
}