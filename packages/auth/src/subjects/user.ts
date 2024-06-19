import {z} from 'zod';
import { UserSchema } from '../models/user';

export const userSubject = z.tuple([
    z.union([
        z.literal('manage'),
        z.literal('get'),
        z.literal('create'),
        z.literal('update'), 
        z.literal('delete')
    ]),
    z.union([z.literal('User'), UserSchema])
]);

export type UserSubject = z.infer<typeof userSubject>;