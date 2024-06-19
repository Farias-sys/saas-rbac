import { defineAbilityFor, Role } from "@saas/auth";
import { UserSchema } from "../../../../packages/auth/src/models/user";

export function getUserPermissions(userId: string, role: Role){
    const authUser = UserSchema.parse({
        id: userId,
        role: role
    });

    const ability = defineAbilityFor(authUser);

    return ability;
}