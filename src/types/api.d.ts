export type ApiResponse<Type> = {
  result: Type,
}

export type ApiEntityState<EntityType extends Record<string, unknown> | Array<unknown>> = {
  loaded: boolean,
  loading: boolean,
  success: boolean,
  data: EntityType
};

export type User = {
  id: number,
  username: string,
}