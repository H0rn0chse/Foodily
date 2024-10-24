import type { ApiEntityState, ApiResponse, EntityBase } from "@t/api";
import { ApiEntity } from "./ApiEntity";
import { reactive } from "vue";

export class ApiEntityList<EntityType extends EntityBase[]> extends ApiEntity<EntityType> {
  constructor (endpoint: string, emptyValue: EntityType) {
    super(endpoint, emptyValue);

    this.reactiveEntityState = reactive({
      loaded: false,
      loading: false,
      success: true,
      data: emptyValue,
      count: 0,
    }) as unknown as ApiEntityState<EntityType>;

    this.savedValue = JSON.parse(JSON.stringify(this.reactiveEntityState.data));
  }

  protected storeData(data: ApiResponse<EntityType>): void {
    if (!this.reactiveEntityState) {
      throw new Error("State not initialized");
    }

    this.reactiveEntityState.data.splice(0, this.reactiveEntityState.data.length, ...data.result);
    this.reactiveEntityState.count = data.count;
  }
}
