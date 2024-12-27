import { type WritableComputedRef } from "vue";
import type { ApiEntityState, EntityBase } from "@t/api";
import { ApiEntity, type CreatedEventData } from "./ApiEntity";
import { CustomEventWrapper, type NetworkEvent } from "@/js/CustomEventWrapper";

/**
 * Wraps the EntitySet loads individual Entities only on request
 */
export class ApiEntitySet<EntityType extends EntityBase | EntityBase[]> {
  #entityMap: Record<string, ApiEntity<EntityType>> = {};
  #computedRefsTarget: Record<string, WritableComputedRef<ApiEntityState<EntityType>>> = {};

  #endpoint = "";
  #defaultValue = {} as EntityType;

  created = new CustomEventWrapper<NetworkEvent>("api-entity-set-created");
  updated = new CustomEventWrapper<CreatedEventData<EntityType>>("api-entity-set-updated");
  deleted = new CustomEventWrapper<NetworkEvent>("api-entity-set-deleted");
  requestFailed = new CustomEventWrapper<NetworkEvent>("api-entity-set-requestFailed");

  /**
   * The proxy itself is not reactive!
   * It forwards the computedRef read request to the individual ApiEntity instances
   * The object
   */
  #entityProxy = new Proxy(this.#computedRefsTarget , {
    get: this.#handleProxyGet.bind(this)
  });

  constructor (endpoint: string, defaultValue: EntityType) {
    this.#endpoint = endpoint;
    this.#defaultValue = defaultValue;
  }

  /**
   * Loads specific entities on demand
   */
  #handleProxyGet (target: Record<string, WritableComputedRef<ApiEntityState<EntityType>>>, entityId: string) {
    if (!target[entityId]) { // is the computedRef already set in the proxy target?
      if (!this.#entityMap[entityId]) { // is the entityApi already set?

        // configure entityApi and store it
        const entityEndpoint = `${this.#endpoint}${entityId as string}`;
        const defaultValueCopy = JSON.parse(JSON.stringify(this.#defaultValue));
        const entity = new ApiEntity<EntityType>(entityEndpoint, defaultValueCopy);

        // forward events of individual entities to the set
        entity.created.attach((event) => this.created.fire(event.detail));
        entity.updated.attach((event) => this.updated.fire(event.detail));
        entity.deleted.attach((event) => this.deleted.fire(event.detail));
        entity.requestFailed.attach((event) => this.requestFailed.fire(event.detail));

        this.#entityMap[entityId] = entity;
      }

      // fetch computed ref and store it in the proxy target
      target[entityId] = this.#entityMap[entityId].getComputedRef();
    }
    return target[entityId];
  }

  getComputedRefs () {
    return this.#entityProxy;
  }

  async updateEntity (entityId: string|number) {
    await this.#entityMap[entityId].update();
  }

  async deleteEntity (entityId: string|number) {
    await this.#entityMap[entityId].delete();
    delete this.#computedRefsTarget[entityId];
    delete this.#entityMap[entityId];
  }

  async resetEntityState (entityId: string|number) {
    this.#entityMap[entityId].resetState();
  }
}
