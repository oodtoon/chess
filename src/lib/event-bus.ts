export default class EventBus {
  constructor() {
    this.bus = document.createElement("fakeelement");
  }

  bus;

  /**
   * Add an event listener.
   */
  addEventListener(event: string, callback: () => void) {
    console.log({ callback });
    this.bus.addEventListener(event, callback);
  }

  /**
   * Remove an event listener.
   */
  removeEventListener(event: string, callback: () => void) {
    console.log("ramove", { callback });
    this.bus.removeEventListener(event, callback);
  }

  /**
   * Dispatch an event.
   */
  dispatchEvent(event: string, detail = {}) {
    this.bus.dispatchEvent(new CustomEvent(event, { detail }));
  }
}
