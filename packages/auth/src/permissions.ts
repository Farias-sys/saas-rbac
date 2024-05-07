import { AbilityBuilder } from "@casl/ability"

import { AppAbility } from "."
import { User } from "./models/user"

type Role = 'ADMIN' | 'MEMBER'

type PermissionsByRole = (
    user: User,
    builder: AbilityBuilder<AppAbility>
) => void

export const permissions : Record<Role, PermissionsByRole> = {
    ADMIN: (user, builder) => {
        const {can} = builder;
        can('manage', 'all')
    },
    MEMBER: (user, builder) => {
        const {can} = builder;

        can('invite', 'User')
    }
}