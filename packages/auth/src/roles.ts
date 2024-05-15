import {z} from 'zod'

export const RoleSchema = z.union([
    z.literal('ADMIN'),
    z.literal('MEMBER'),
    z.literal('BILLING')
])

export type Role = z.infer<typeof RoleSchema>;