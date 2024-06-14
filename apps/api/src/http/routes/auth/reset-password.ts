import { auth } from "../../middlewares/auth";
import { prisma } from "../../../lib/prisma";
import { BadRequestError } from "../_errors/bad-request-error";
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { hash } from "bcryptjs";

export async function resetPassword(app : FastifyInstance){
    app
        .withTypeProvider<ZodTypeProvider>()
        .post(
            '/password/reset',
            {
                schema: {
                    tags: ['auth'],
                    summary: 'Recover user password',
                    body: z.object({
                        code: z.string().email(),
                        password: z.string().min(6)
                    }),
                    response: {
                        204: z.null()
                    }
                }
            },
            async(request, response) => {
                const {code,password} = request.body;

                const tokenFromCode = await prisma.token.findUnique({
                    where: {id:code},
                })

                if(!tokenFromCode){
                    throw new UnauthorizedError;
                }

                const passwordHash = await hash(password, 6);

                await prisma.$transaction([
                    prisma.user.update({
                        where: {
                            id: tokenFromCode.userId,
                        },
                        data : {
                            passwordHash
                        }
                    }),
                    prisma.token.delete({
                        where: {
                            id: code
                        }
                    })
                ]);

                return response.status(204).send()
            }
        )
}