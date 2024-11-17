import type { ApiEntityState, ApiResponse, EntityBase } from "@t/api";
import { ApiEntity } from "./ApiEntity";
import { reactive } from "vue";

export class ApiEntityList<EntityType extends EntityBase[], EntityCreate> extends ApiEntity<EntityType, EntityCreate> {
  protected initState(): void {
    this.reactiveEntityState = reactive({
      loaded: false,
      loading: false,
      success: true,
      data: this.emptyValue,
      count: 0,
    }) as unknown as ApiEntityState<EntityType>;

    this.savedValue = JSON.parse(JSON.stringify(this.reactiveEntityState.data));
  }

  protected storeDataInState(data: ApiResponse<EntityType>): void {
    if (!this.reactiveEntityState) {
      throw new Error("State not initialized");
    }

    this.reactiveEntityState.data.splice(0, this.reactiveEntityState.data.length, ...data.result);
    this.reactiveEntityState.count = data.count;
  }

  resetState() {
    if (!this.reactiveEntityState) {
      throw new Error("State not initialized");
    }

    this.reactiveEntityState.loaded = false;
    this.reactiveEntityState.loading = false;
    this.reactiveEntityState.success = true;
    this.reactiveEntityState.data.splice(0, this.reactiveEntityState.data.length, ...this.emptyValue);
    this.reactiveEntityState.count = 0;

    this.savedValue = JSON.parse(JSON.stringify(this.reactiveEntityState.data));
  }

}
