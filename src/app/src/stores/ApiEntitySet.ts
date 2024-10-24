import { type WritableComputedRef } from "vue";
import type { ApiEntityState, EntityBase } from "@t/api";
import { ApiEntity } from "./ApiEntity";

/**
 * Wraps the EntitySet loads individual Entities only on request
 */
export class ApiEntitySet<EntityType extends EntityBase | EntityBase[]> {
  #entityApiRequests: Record<string, ApiEntity<EntityType>> = {};
  #entityComputedRefs: Record<string, WritableComputedRef<ApiEntityState<EntityType>>> = {};

  #endpoint = "";
  #defaultValue = {} as EntityType;

  // proxy every access to fetch each entity individually
  #proxy = new Proxy(this.#entityComputedRefs , {
    get: this.#handleProxyGet.bind(this)
  });

  constructor (endpoint: string, defaultValue: EntityType) {
    this.#endpoint = endpoint;
    this.#defaultValue = defaultValue;
  }

  /**
   * Loads specific entities on demand
   * @param target 
   * @param entityId 
   * @returns 
   */
  #handleProxyGet (target: Record<string, WritableComputedRef<ApiEntityState<EntityType>>>, entityId: string) {
    if (!target[entityId]) { // is the ref already set?
      if (!this.#entityApiRequests[entityId]) { // is the entityApi already set?

        // configure entityApi and store it
        const entityEndpoint = `${this.#endpoint}${entityId as string}`;
        const defaultValueCopy = JSON.parse(JSON.stringify(this.#defaultValue));
        this.#entityApiRequests[entityId] = new ApiEntity<EntityType>(entityEndpoint, defaultValueCopy);
      }

      // fetch computed ref
      target[entityId] = this.#entityApiRequests[entityId].getComputedRef();
    }
    return target[entityId];
  }

  /**
   * Note: The proxy itself is not reactive!
   */
  getProxiedRefs () {
    return this.#proxy;
  }

  updateEntity (entityId: string) {
    this.#entityApiRequests[entityId].update();
  }
}
