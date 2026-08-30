export type EntityBase = NonNullable<Record<string, unknown>>;

export type ListResponse<T extends EntityBase> = {
  result: T[],
  count: number,
  cacheToken: string,
};

export type ItemResponse<T extends EntityBase> = {
  result: T,
  cacheToken: string,
};

export type User = NonNullable<{
  id: string,
  username: string,
}>;

export type UserId = User["id"];
