import {Prisma} from '@prisma/client';

export function applyOwnershipFilter<T extends Prisma.UserWhereInput>(
    baseWhere: T,
    user: any,
    scope: string,
    relationField?: string, // e.g. "ownerId"
): T {
    // console.log('=== OWNERSHIP FILTER DEBUG ===');
    // console.log('User:', user);
    // console.log('Scope:', scope);
    // console.log('RelationField:', relationField);
    // console.log('User ID:', user?.id);
    // console.log('================================');

    if (scope.endsWith(':any')) {
        return baseWhere;
    }

    if (scope.endsWith(':own')) {
        if (!relationField) {
            // fallback: only user himself
            return {...baseWhere, id: user.id} as T;
        } else {
            // For 'read:own', users should see themselves AND users they own
            return {
                ...baseWhere,
                OR: [
                    {id: user.id}, // The user themselves
                    {[relationField]: user.id} // Users they own
                ]
            } as T;
        }
    }

    return baseWhere;
}
