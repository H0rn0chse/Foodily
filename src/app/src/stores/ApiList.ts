import { reactive } from "vue";
import type { EntityBase, ListResponse } from "@t/api";
import { csrfHeaders } from "@/js/csrf";

export type ListLoadParams = {
  page?: number,
  limit?: number,
  search?: string,
};

export class ApiList<TItem extends EntityBase, TCreate extends EntityBase = EntityBase> {
  // TypeScript-only private (not JS private fields) so Vue's reactive proxy can
  // access them when this instance is nested inside a Pinia store.
  private endpoint: string;
  private cacheToken: string | null = null;
  private cachedParams: string | null = null;
  private stateObj: { items: TItem[]; count: number; loading: boolean; error: boolean };

  get items(): TItem[] { return this.stateObj.items; }
  get count(): number { return this.stateObj.count; }
  get loading(): boolean { return this.stateObj.loading; }
  get error(): boolean { return this.stateObj.error; }

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.stateObj = reactive({
      items: [] as TItem[],
      count: 0,
      loading: false,
      error: false,
    }) as { items: TItem[]; count: number; loading: boolean; error: boolean };
  }

  async load(params?: ListLoadParams): Promise<void> {
    if (this.stateObj.loading) {
      return;
    }

    this.stateObj.loading = true;
    this.stateObj.error = false;

    try {
      const url = new URL(this.endpoint, window.location.origin);
      if (params?.page !== undefined) url.searchParams.set("page", String(params.page));
      if (params?.limit !== undefined) url.searchParams.set("limit", String(params.limit));
      if (params?.search) url.searchParams.set("search", params.search);

      const headers: Record<string, string> = {};
      const paramsKey = url.search;
      if (this.cacheToken && this.cachedParams === paramsKey) {
        headers["If-None-Match"] = this.cacheToken;
      }

      const response = await fetch(url.pathname + url.search, { headers });

      if (response.status === 304) {
        return;
      }

      if (!response.ok) {
        this.stateObj.error = true;
        return;
      }

      const data: ListResponse<TItem> = await response.json();
      this.stateObj.items.splice(0, this.stateObj.items.length, ...data.result);
      this.stateObj.count = data.count;
      this.cacheToken = data.cacheToken;
      this.cachedParams = paramsKey;
    } catch {
      this.stateObj.error = true;
    } finally {
      this.stateObj.loading = false;
    }
  }

  async create(data: TCreate): Promise<string> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: csrfHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error creating entity");
    }

    // Invalidate cache so the next load() fetches fresh data
    this.cacheToken = null;
    this.cachedParams = null;

    return response.headers.get("Location")?.split("/").pop() ?? "0";
  }
}
