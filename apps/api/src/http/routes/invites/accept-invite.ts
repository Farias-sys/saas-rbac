import {auth} from "../../middlewares/auth"
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { BadRequestError } from "../_errors/bad-request-error";

export async function acceptInvite(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/invites/:inviteId/accept', {
        schema: {
            tags: ['invites'],
            summary: 'Get a Invite details',
            params: z.object({
                inviteId: z.string().uuid()
            }),
            security: [{bearerAuth:[]}],
            response: {
                204: z.null()
            }
        }            
    },
        async (request, response) => {
            const userId = await request.getCurrentUserId();
            const { inviteId } = request.params;

            const invite = await prisma.invite.findUnique({
                where: {
                    id: inviteId
                }
            });

            if(!invite){
                throw new BadRequestError('Invite not found');
            }

            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })
            
            if(!user){
                throw new BadRequestError('User not found');
            }

            if(invite.email != user.email){
                throw new BadRequestError('This invite belongs to another user.');
            }

            await prisma.$transaction([
                prisma.member.create({
                    data: {
                        userId,
                        organizationId: invite.organizationId,
                        role: invite.role
                    }
                }),
                
                prisma.invite.delete({
                    where: {
                        id: inviteId
                    }
                })
            ])

            return response.status(204).send();

        }
    )
}