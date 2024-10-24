export type EntityBase = NonNullable<Record<string, unknown>>;

export type ApiResponse<Type extends EntityBase | EntityBase[]> = 
Type extends EntityBase[] ? {
  result: Type,
  count: number,
} : 
{
  result: Type,
};

export type ApiEntityState<EntityType extends EntityBase | EntityBase[]> = 
EntityType extends EntityBase[] ? {
  loaded: boolean,
  loading: boolean,
  success: boolean,
  data: EntityType,
  count: number,
} :
{
  loaded: boolean,
  loading: boolean,
  success: boolean,
  data: EntityType,
};

export type User = NonNullable<{
  id: number,
  username: string,
}>;