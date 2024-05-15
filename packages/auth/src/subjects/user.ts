import {z} from 'zod';

export const UserSubject = z.tuple([
    z.union([
        z.literal('manage'),
        z.literal('get'),
        z.literal('create'),
        z.literal('update'), 
        z.literal('delete')
    ]),
    z.literal('User')
]);

export type userSubject = z.infer<typeof UserSubject>;