import { computed, reactive } from "vue";
import type { ApiEntityState, ApiResponse, EntityBase } from "@t/api";
import { CustomEventWrapper, type NetworkEvent } from "@/js/CustomEventWrapper";

function sleep (seconds: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, seconds * 1000);
  });
}

export type UpdatedEventData<EntityType> = NetworkEvent & {
  data: EntityType | undefined,
  dataBefore: EntityType | undefined
};

export type CreatedEventData = NetworkEvent & {
  entityId: number | string
};

/**
 * Wraps an endpoint into a computed ref and loads on demand
 */
export class ApiEntity<EntityType extends EntityBase | EntityBase[], EntityCreate = void> {
  #endpoint = "";
  /**
   * Note: The proxy itself is not reactive!
   * It is only a wrapper to fetch the computed ref on demand and to store the data
   */
  #computedProxy = computed<ApiEntityState<EntityType>>({
    get: this.#handleComputedGet.bind(this),
    set: this.#handleComputedSet.bind(this)
  });

  protected reactiveEntityState: ApiEntityState<EntityType> | undefined;
  protected savedValue: EntityType | undefined;
  protected emptyValue = {} as EntityType;

  created = new CustomEventWrapper<CreatedEventData>("api-entity-created");
  updated = new CustomEventWrapper<UpdatedEventData<EntityType>>("api-entity-updated");
  deleted = new CustomEventWrapper<NetworkEvent>("api-entity-deleted");
  requestFailed = new CustomEventWrapper<NetworkEvent>("api-entity-requestFailed");

  constructor (endpoint: string , emptyValue: EntityType) {
    this.#endpoint = endpoint;
    this.emptyValue = emptyValue;

    // initialize reactive state
    this.initState();
  }

  /**
   * Initialize the reactive state.
   * Can be overridden to set specific initial values.
   */
  protected initState () {
    if (this.emptyValue) {
      this.reactiveEntityState = reactive({
        loaded: false,
        loading: false,
        success: true,
        data: this.emptyValue,
      }) as unknown as ApiEntityState<EntityType>;

      this.savedValue = JSON.parse(JSON.stringify(this.reactiveEntityState.data));
    }
  }

  /**
   * Store the data of the response in the reactive state.
   * Can be overridden to handle specific data structures.
   */
  protected storeDataInState (data: ApiResponse<EntityType>) {
    if (!this.reactiveEntityState) {
      throw new Error("State not initialized");
    }

    Object.assign(this.reactiveEntityState.data, data.result);
  }

  /**
   * Reset the state to the initial values.
   */
  resetState () {
    if (!this.reactiveEntityState) {
      throw new Error("State not initialized");
    }

    this.reactiveEntityState.loaded = false;
    this.reactiveEntityState.loading = false;
    this.reactiveEntityState.success = true;
    this.reactiveEntityState.data = this.emptyValue;

    this.savedValue = JSON.parse(JSON.stringify(this.reactiveEntityState.data));
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
    throw new Error("ComputedRef is readonly!");
  }

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

      if (!response.ok) {
        this.requestFailed.fire({
          message: "Error updating entity",
          response: response
        });

        throw new Error("Error updating entity");
      }

      this.updated.fire({
        message: "Entity updated",
        response: response,
        data: payloadData,
        dataBefore: this.savedValue
      });
      this.savedValue = payloadData;
    }
  }

  async delete () {
    if (!this.reactiveEntityState) {
      throw new Error("State not initialized");
    }

    const response = await fetch(this.#endpoint, {
      method: "DELETE"
    });

    if (!response.ok) {
      this.requestFailed.fire({
        message: "Error deleting entity",
        response: response,
      });

      throw new Error("Error deleting entity");
    }

    this.deleted.fire({
      message: "Entity deleted",
      response: response,
    });
    this.resetState();
  }

  async create (data: EntityCreate) {
    if (!this.reactiveEntityState) {
      throw new Error("State not initialized");
    }

    const payloadData = JSON.parse(JSON.stringify(data));
    const response = await fetch(this.#endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payloadData)
    });

    if (!response.ok) {
      this.requestFailed.fire({
        message: "Error creating entity",
        response: response,
      });

      throw new Error("Error creating entity");
    }

    const entityId = parseInt(response.headers.get("Location")?.split("/").pop() || "0", 10);

    this.created.fire({
      message: "Entity created",
      response: response,
      entityId
    });

    return entityId;
  }

  async #loadData () {
    if (!this.reactiveEntityState) {
      throw new Error("State not initialized");
    }

    if (this.reactiveEntityState.loading) {
      return; // do not trigger again while loading
    }

    this.reactiveEntityState.loading = true;

    const response = await fetch(this.#endpoint, {
      method: "GET"
    });
    await sleep(2); // todo: remove delay

    this.reactiveEntityState.success = response.ok;

    if (response.ok) {
      const data: ApiResponse<EntityType> = await response.json();

      this.storeDataInState(data);
    }
    this.reactiveEntityState.loaded = true;
    this.reactiveEntityState.loading = false;

    // store a copy of the data
    this.savedValue = JSON.parse(JSON.stringify(this.reactiveEntityState.data));
  }

  getComputedRef () {
    return this.#computedProxy;
  }
}
