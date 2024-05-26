export type ApiResponse<Type extends Record<string, unknown> | Array<unknown>> = 
Type extends Array<unknown> ? {
  result: Type,
  count: number,
} : 
{
  result: Type,
};

export type ApiEntityState<EntityType extends Record<string, unknown> | Array<unknown>> = 
EntityType extends Array<unknown> ? {
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

export type User = {
  id: number,
  username: string,
}