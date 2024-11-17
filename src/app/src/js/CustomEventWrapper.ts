interface CustomEventListener {
  (evt: CustomEvent): void;
}

export type NetworkEvent = {
  message: string;
  response: Response;
};

export class CustomEventWrapper<EventData> extends EventTarget {
  #name: string;

  constructor (name: string) {
    super();
    this.#name = name;
  }

  // eslint-disable-next-line no-undef
  attach (listener: CustomEventListener, options?: AddEventListenerOptions | boolean): void {
    // eslint-disable-next-line no-undef
    this.addEventListener(this.#name, listener as EventListenerOrEventListenerObject , options);
  }

  // eslint-disable-next-line no-undef
  detach (listener: CustomEventListener, options?: AddEventListenerOptions | boolean): void {
    // eslint-disable-next-line no-undef
    this.removeEventListener(this.#name, listener as EventListenerOrEventListenerObject, options);
  }

  fire (data: EventData): void {
    this.dispatchEvent(new CustomEvent(this.#name, {
      detail: data
    }) as unknown as Event);
  }
}
