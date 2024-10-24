import { computed, reactive } from "vue";
import type { ApiEntityState, ApiResponse, EntityBase } from "@t/api";

function sleep (seconds: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, seconds * 1000);
  });
}

/**
 * Wraps an endpoint into a computed ref and loads on demand
 */
export class ApiEntity<EntityType extends EntityBase | EntityBase[]> {
  #endpoint = "";
  // #reactiveEntityState = null as unknown as ApiEntityState<EntityType>;
  protected reactiveEntityState: ApiEntityState<EntityType> | undefined;
  protected savedValue: EntityType | undefined;
  #computedProxy = computed<ApiEntityState<EntityType>>({
    get: this.#handleComputedGet.bind(this),
    set: this.#handleComputedSet.bind(this)
  });

  constructor (endpoint: string , emptyValue: EntityType) {
    this.#endpoint = endpoint;

    if (emptyValue) {
      this.reactiveEntityState = reactive({
        loaded: false,
        loading: false,
        success: true,
        data: emptyValue,
      }) as unknown as ApiEntityState<EntityType>;

      this.savedValue = JSON.parse(JSON.stringify(this.reactiveEntityState.data));
    }

    // watch<ApiEntityState<EntityType>>(this.#reactiveEntityState, this.#handleUpdate.bind(this), { deep: true });
  }

  #handleComputedGet () {
    if (!this.reactiveEntityState) {
      throw new Error("State not initialized");
    }

    if (!this.reactiveEntityState.loaded && !this.reactiveEntityState.loading) {
      this.#loadData();
    }

    return this.reactiveEntityState;
  }

  #handleComputedSet () {
    throw new Error("Setter not implemented!");
  }

  // #handleUpdate (newValue: ApiEntityState<EntityType>, oldValue: ApiEntityState<EntityType>) {
  //   console.error("Update not implemented!");
  //   debugger;
  // }

  async update () {
    if (!this.reactiveEntityState) {
      throw new Error("State not initialized");
    }

    // todo: handle concurrent changes
    if (JSON.stringify(this.reactiveEntityState.data) !== JSON.stringify(this.savedValue)) {
      const payloadData = JSON.parse(JSON.stringify(this.reactiveEntityState.data));
      const response = await fetch(this.#endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payloadData)
      });

      if (response.ok) {
        this.savedValue = payloadData;
      } else {
        // todo: error handling
      }
    }
  }

  async #loadData () {
    if (!this.reactiveEntityState) {
      throw new Error("State not initialized");
    }

    if (this.reactiveEntityState.loading) {
      return; // do not trigger again while loading
    }

    this.reactiveEntityState.loading = true;

    const response = await fetch(this.#endpoint);
    await sleep(2); // todo: remove delay

    this.reactiveEntityState.success = response.ok;

    if (response.ok) {
      const data: ApiResponse<EntityType> = await response.json();

      this.storeData(data);
    }
    this.reactiveEntityState.loaded = true;
    this.reactiveEntityState.loading = false;

    // store a copy of the data
    this.savedValue = JSON.parse(JSON.stringify(this.reactiveEntityState.data));
  }

  protected storeData (data: ApiResponse<EntityType>) {
    if (!this.reactiveEntityState) {
      throw new Error("State not initialized");
    }

    Object.assign(this.reactiveEntityState.data, data.result);
  }

  getComputedRef () {
    return this.#computedProxy;
  }
}
