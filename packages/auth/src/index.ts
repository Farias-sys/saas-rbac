import {
    AbilityBuilder,
    CreateAbility,
    createMongoAbility,
    ForcedSubject,
    MongoAbility
} from '@casl/ability'
import { User } from './models/user'
import { permissions } from './permissions'
import { UserSubject } from './subjects/user'
import { ProjectSubject } from './subjects/project'
import { OrganizationSubject } from './subjects/organization'
import {InviteSubject} from './subjects/invite'
import {BillingSubject} from './subjects/billing'
import {z} from 'zod'

export * from './roles';

const AppAbilitiesSchema = z.union([
    ProjectSubject,
    UserSubject,
    OrganizationSubject,
    InviteSubject,
    BillingSubject,
    z.tuple([
        z.literal('manage'),
        z.literal('all')
    ])
])

type AppAbilities = z.infer<typeof AppAbilitiesSchema> 

export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilityFor(user: User){
    const builder = new AbilityBuilder(createAppAbility)

    if(typeof permissions[user.role] !== 'function'){
        throw new Error(`Permissions for role ${user.role} not found.`)
    }

    permissions[user.role](user, builder);
    const ability = builder.build()

    ability.can = ability.can.bind(ability);
    ability.cannot = ability.cannot.bind(ability);

    return ability;
}