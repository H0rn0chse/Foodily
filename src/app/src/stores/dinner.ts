import { computed, reactive, type ComputedRef } from "vue";
import { defineStore } from "pinia";
import type { DinnerDetails, DinnerList } from "@t/dinner";
import type { ApiResponse } from "@t/api";

class ApiValue<EntityType extends Record<string, any>> {
  #loading = false;
  #loaded = false;
  #ref = reactive({} as Record<string, unknown>);
  #computed = computed(this.#getComputed.bind(this));
  #endpoint = "";

  constructor (endpoint:string , emptyValue: EntityType) {
    this.#ref = reactive<EntityType>(emptyValue);
    this.#endpoint = endpoint;
  }

  #getComputed () {
    if (!this.#loaded && !this.#loading) {
      this.#loadData();
    }

    return this.#ref;
  }

  async #loadData () {
    if (this.#loading) {
      return;
    }

    this.#loading = true;

    const response = await fetch(this.#endpoint);
    const data: ApiResponse<EntityType> = await response.json();
    Object.keys(data.result).forEach((key) => {
      this.#ref[key] = data.result[key];
    });

    this.#loaded = true;
    this.#loading = false;
  }

  getComputedRef (): ComputedRef<EntityType> {
    return this.#computed as ComputedRef<EntityType>;
  }
}

/**
 * Wraps the EntitySet loads individual Entities only on request
 */
class ApiEntitySet<EntityType extends Record<string, unknown>> {
  #entityApiRequests: Record<string, ApiValue<EntityType>> = {};
  #entityComputedRefs: Record<string, ComputedRef<EntityType>> = {};

  #endpoint = "";
  #defaultValue = {} as EntityType;

  // proxy every access to fetch each entity individually
  #proxy = new Proxy(this.#entityComputedRefs , {
    get: this.#getProxyRef.bind(this)
  });

  constructor (endpoint: string, defaultValue: EntityType) {
    this.#endpoint = endpoint;
    this.#defaultValue = defaultValue;
  }

  #getProxyRef (target: Record<string, ComputedRef<EntityType>>, entityId: string) {
    // is the ref already set?
    if (!target[entityId]) {
      // is the entityApi already set?
      if (!this.#entityApiRequests[entityId]) {
        // configure entityApi and store it
        const entityEndpoint = `${this.#endpoint}${entityId as string}`;
        const defaultValueCopy = JSON.parse(JSON.stringify(this.#defaultValue));
        this.#entityApiRequests[entityId] = new ApiValue<EntityType>(entityEndpoint, defaultValueCopy);
      }
      // fetch computed ref
      target[entityId] = this.#entityApiRequests[entityId].getComputedRef() as ComputedRef<EntityType>;
    }
    return target[entityId];
  }

  getProxy () {
    return this.#proxy;
  }
}

export const useDinnerStore = defineStore("dinner", () => {
  const dinnerListApi = new ApiValue<DinnerList>("/api/v1/dinners", []);
  const dinnerList = dinnerListApi.getComputedRef();
  const dinnerDetailsDefaults = {
    id: 0,
    ownerId: 0,
    username: "",
    date: new Date().toUTCString(),
    participants: [],
    courses: []
  };
  const dinnerDetailsApi = new ApiEntitySet<DinnerDetails>("/api/v1/dinners/", dinnerDetailsDefaults);
  const dinnerDetails = dinnerDetailsApi.getProxy();

  return {
    dinnerList,
    dinnerDetails,
    // todo: check
    // reload: loadDinners,
  };
});
