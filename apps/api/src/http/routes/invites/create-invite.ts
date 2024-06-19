import {auth} from "../../middlewares/auth"
import { FastifyInstance } from "fastify/types/instance";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { getUserPermissions } from "../../../utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { RoleSchema } from "@saas/auth";
import { BadRequestError } from "../_errors/bad-request-error";

export async function createInvite(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/organizations/:slug/invites', {
        schema: {
            tags: ['invites'],
            summary: 'Create a new Invite',
            security: [{bearerAuth:[]}],
            params: z.object({
                slug: z.string()
            }),
            body: z.object({
                email: z.string().email(),
                role: RoleSchema
            }),
            response: {
                201: z.object({
                    inviteId: z.string().uuid()
                })
            }
        }            
    },
        async (request, response) => {
            const { slug } = request.params;
            const { email, role } = request.body;

            const userId = await request.getCurrentUserId();
            const { organization, membership } = await request.getUserMembership(slug);

            const {cannot} = getUserPermissions(userId, membership.role);

            if(cannot('create', 'Invite')){
                throw new UnauthorizedError('You are not allowed to invite an user for this organization');
            }

            const [, domain] = email;

            if(organization.shouldAttachUsersByDomain && organization.domain == domain){
                throw new BadRequestError(`Users with ${domain} domain will join in this organization automatically on login.`);
            }

            const inviteWithSameEmail = await prisma.invite.findUnique({
                where: {
                    email_organizationId: {
                        email,
                        organizationId: organization.id
                    }
                }
            });

            if(inviteWithSameEmail){
                throw new BadRequestError('Another invite with same e-mail already exists');
            }

            const memberWithSameEmail = await prisma.member.findFirst({
                where: {
                    organizationId: organization.id,
                    user: {
                        email
                    }
                }
            })

            if(memberWithSameEmail){
                throw new BadRequestError('A member with this e-mail already belongs to this organization');
            }

            const invite = await prisma.invite.create({
                data: {
                    organizationId: organization.id,
                    email,
                    role,
                    authorId: userId
                }}
            );

            return response.status(201).send({
                inviteId: invite.id
            });

        }
    )
}