import {z} from 'zod'

export const OrganizationSchema = z.object({
    __typename: z.literal('Organization').default('Organization'),
    id: z.string(),
    ownerId: z.string()
})

export type Organization = z.infer<typeof OrganizationSchema>