import { computed, reactive, type UnwrapNestedRefs } from "vue";
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
      this.#ref.value[key] = data.result[key];
    });

    this.#loaded = true;
    this.#loading = false;
  }

  getRef (): UnwrapNestedRefs<EntityType> {
    return this.#computed as unknown as EntityType;
  }
}

class ApiEntitySet<EntityType extends Record<string, any>> {
  #entities: Record<string|symbol, ApiValue<EntityType>> = {};
  #entityRefs: Record<string|symbol, EntityType> = {};
  #endpoint = "";
  #defaultValue = {} as EntityType;
  #proxy = new Proxy(this.#entityRefs , {
    get: this.#getProxyRef.bind(this)
  });

  constructor (endpoint: string, defaultValue: EntityType) {
    this.#endpoint = endpoint;
    this.#defaultValue = defaultValue;
  }

  #getProxyRef (target: Record<string|symbol, EntityType>, entityId: string|symbol) {
    if (!target[entityId]) {
      if (!this.#entities[entityId]) {
        const entityEndpoint = `${this.#endpoint}${entityId as string}`;
        const defaultValueCopy = JSON.parse(JSON.stringify(this.#defaultValue));
        this.#entities[entityId] = new ApiValue<EntityType>(entityEndpoint, defaultValueCopy);
      }
      target[entityId] = this.#entities[entityId].getRef();
    }
    return target[entityId];
  }

  getProxy () {
    return this.#proxy;
  }
}

export const useDinnerStore = defineStore("dinner", () => {
  const dinnerListApi = new ApiValue<DinnerList>("/api/v1/dinners", []);
  const dinnerList = dinnerListApi.getRef();
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
