import { reactive } from "vue";
import type { EntityBase, ItemResponse } from "@t/api";
import { csrfHeaders } from "@/js/csrf";

export class ApiItem<TData extends EntityBase> {
  // TypeScript-only private (not JS private fields) so Vue's reactive proxy can
  // access them when this instance is nested inside a Pinia store.
  private endpoint: string;
  private cacheToken: string | null = null;
  private defaultData: TData;
  private stateObj: { data: TData; loading: boolean; error: boolean };

  get data(): TData { return this.stateObj.data; }
  get loading(): boolean { return this.stateObj.loading; }
  get error(): boolean { return this.stateObj.error; }

  constructor(endpoint: string, defaultData: TData) {
    this.endpoint = endpoint;
    this.defaultData = defaultData;
    this.stateObj = reactive({
      data: JSON.parse(JSON.stringify(defaultData)) as TData,
      loading: false,
      error: false,
    }) as { data: TData; loading: boolean; error: boolean };
  }

  async load(): Promise<void> {
    if (this.stateObj.loading) {
      return;
    }

    this.stateObj.loading = true;
    this.stateObj.error = false;

    try {
      const headers: Record<string, string> = {};
      if (this.cacheToken) {
        headers["If-None-Match"] = this.cacheToken;
      }

      const response = await fetch(this.endpoint, { headers });

      if (response.status === 304) {
        return;
      }

      if (!response.ok) {
        this.stateObj.error = true;
        return;
      }

      const body: ItemResponse<TData> = await response.json();
      // Use Object.assign to keep the same reactive object reference
      Object.assign(this.stateObj.data, body.result);
      this.cacheToken = body.cacheToken;
    } catch {
      this.stateObj.error = true;
    } finally {
      this.stateObj.loading = false;
    }
  }

  async save(update: Partial<TData>): Promise<void> {
    const response = await fetch(this.endpoint, {
      method: "PUT",
      headers: csrfHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(update),
    });

    if (!response.ok) {
      throw new Error("Error saving entity");
    }

    this.cacheToken = null;
  }

  async delete(): Promise<void> {
    const response = await fetch(this.endpoint, {
      method: "DELETE",
      headers: csrfHeaders(),
    });

    if (!response.ok) {
      throw new Error("Error deleting entity");
    }

    this.cacheToken = null;
    Object.assign(this.stateObj.data, JSON.parse(JSON.stringify(this.defaultData)));
  }
}
