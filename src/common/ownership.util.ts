import { FindOptionsWhere } from "typeorm";

type StringField<T> = {
  [K in keyof T]-?: T[K] extends string | null | undefined ? K : never;
}[keyof T] &
  string;

export function applyOwnershipFilter<
  T extends { id: string },
  K extends StringField<T>,
>(
  baseWhere: FindOptionsWhere<T>,
  user: { id: string },
  scope: string,
  relationField?: K // e.g. "ownerId"
): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
  if (scope.endsWith(":any")) {
    return baseWhere;
  }

  if (scope.endsWith(":own")) {
    if (!relationField) {
      return {
        ...baseWhere,
        id: user.id,
      };
    }

    return [
      {
        ...baseWhere,
        id: user.id,
      },
      {
        ...baseWhere,
        [relationField]: user.id,
      },
    ];
  }

  return baseWhere;
}
