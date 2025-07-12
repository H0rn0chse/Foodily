interface CustomEventListener<Target> {
  (evt: CustomEvent<Target>): void;
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

  attach (listener: CustomEventListener<EventData>, options?: AddEventListenerOptions | boolean): void {
    this.addEventListener(this.#name, listener as EventListenerOrEventListenerObject , options);
  }

  detach (listener: CustomEventListener<EventData>, options?: AddEventListenerOptions | boolean): void {
    this.removeEventListener(this.#name, listener as EventListenerOrEventListenerObject, options);
  }

  fire (data: EventData): void {
    this.dispatchEvent(new CustomEvent(this.#name, {
      detail: data
    }) as unknown as Event);
  }
}
