import {z} from 'zod';
import {OrganizationSchema} from '../models/organization'

export const organizationSubject = z.tuple([
    z.union([
        z.literal('manage'),
        z.literal('get'),
        z.literal('create'),
        z.literal('update'), 
        z.literal('delete'),
        z.literal('transfer_ownership')
    ]),
    z.union([z.literal('Organization'), OrganizationSchema])
]);

export type OrganizationSubject = z.infer<typeof organizationSubject>
