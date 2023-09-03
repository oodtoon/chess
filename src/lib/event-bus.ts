type CustomEventListener<T> = (event: CustomEvent<T>) => void
export default class EventBus {
  constructor() {
    this.bus = document.createElement("fakeelement");
  }

  bus;

  /**
   * Add an event listener.
   */
  addEventListener<T>(event: string, callback: CustomEventListener<T>) {
    this.bus.addEventListener(event, callback as EventListener);
  }

  /**
   * Remove an event listener.
   */
  removeEventListener<T>(event: string, callback: CustomEventListener<T>) {
    this.bus.removeEventListener(event, callback as EventListener);
  }

  /**
   * Dispatch an event.
   */
  dispatchEvent(event: string, detail = {}) {
    this.bus.dispatchEvent(new CustomEvent(event, { detail }));
  }
}
