import 'fastify'

declare module 'fastify' {
    export interface FastifyRequest{
        getCurrentUserId(): Promise<any>
        getUserMembership(organizationSlug : string): Promise<any>
    }
}