import { computed, reactive } from "vue";
import type { ApiEntityState, ApiResponse } from "@t/api";

function sleep (seconds: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, seconds * 1000);
  });
}

/**
 * Wraps an endpoint into a computed ref and loads on demand
 */
export class ApiEntity<EntityType extends Record<string, unknown> | Array<unknown>> {
  #endpoint = "";
  #reactiveEntityState = reactive({
    loaded: false,
    loading: false,
    success: true,
    data: {} as EntityType
  });
  #computedProxy = computed<ApiEntityState<EntityType>>({
    get: this.#handleComputedGet.bind(this),
    set: this.#handleComputedSet.bind(this)
  });

  constructor (endpoint:string , emptyValue: EntityType) {
    Object.assign(this.#reactiveEntityState.data, emptyValue);
    this.#endpoint = endpoint;
  }

  #handleComputedGet () {
    if (!this.#reactiveEntityState.loaded && !this.#reactiveEntityState.loading) {
      this.#loadData();
    }

    return this.#reactiveEntityState as ApiEntityState<EntityType>;
  }

  #handleComputedSet () {
    throw new Error("Setter not implemented!");
  }

  async #loadData () {
    if (this.#reactiveEntityState.loading) {
      return; // do not trigger again while loading
    }

    this.#reactiveEntityState.loading = true;

    const response = await fetch(this.#endpoint);
    await sleep(2); // todo: remove delay

    this.#reactiveEntityState.success = response.ok;

    if (response.ok) {
      const data: ApiResponse<EntityType> = await response.json();

      Object.assign(this.#reactiveEntityState.data, data.result);
    }
    this.#reactiveEntityState.loaded = true;
    this.#reactiveEntityState.loading = false;
  }

  getComputedRef () {
    return this.#computedProxy;
  }
}
