import type { EntityBase } from "@t/api";
import { ApiItem } from "./ApiItem";

export class ApiItemMap<TData extends EntityBase> {
  // TypeScript-only private (not JS private fields) so Vue's reactive proxy can
  // access them when this instance is nested inside a Pinia store.
  private baseEndpoint: string;
  private defaultValue: TData;
  private map: Map<string, ApiItem<TData>> = new Map();

  constructor(baseEndpoint: string, defaultValue: TData) {
    this.baseEndpoint = baseEndpoint;
    this.defaultValue = defaultValue;
  }

  get(id: string): ApiItem<TData> {
    if (!this.map.has(id)) {
      const endpoint = `${this.baseEndpoint}${id}`;
      const defaultCopy = JSON.parse(JSON.stringify(this.defaultValue));
      this.map.set(id, new ApiItem<TData>(endpoint, defaultCopy));
    }
    return this.map.get(id)!;
  }

  remove(id: string): void {
    this.map.delete(id);
  }
}
