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
  #reactiveEntityState = null as unknown as ApiEntityState<EntityType>;
  #computedProxy = computed<ApiEntityState<EntityType>>({
    get: this.#handleComputedGet.bind(this),
    set: this.#handleComputedSet.bind(this)
  });

  constructor (endpoint: string , emptyValue: EntityType) {
    this.#endpoint = endpoint;

    if (Array.isArray(emptyValue)) {
      this.#reactiveEntityState = reactive({
        loaded: false,
        loading: false,
        success: true,
        data: emptyValue,
        count: 0,
      }) as unknown as ApiEntityState<EntityType>;
    } else {
      this.#reactiveEntityState = reactive({
        loaded: false,
        loading: false,
        success: true,
        data: emptyValue,
      }) as unknown as ApiEntityState<EntityType>;
    }
  }

  #handleComputedGet () {
    if (!this.#reactiveEntityState.loaded && !this.#reactiveEntityState.loading) {
      this.#loadData();
    }

    return this.#reactiveEntityState;
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

      if ("count" in this.#reactiveEntityState && "count" in data) {
        this.#reactiveEntityState.data.splice(0, this.#reactiveEntityState.data.length, ...data.result);
        this.#reactiveEntityState.count = data.count;
      } else {
        Object.assign(this.#reactiveEntityState.data, data.result);
      }
    }
    this.#reactiveEntityState.loaded = true;
    this.#reactiveEntityState.loading = false;
  }

  getComputedRef () {
    return this.#computedProxy;
  }
}
