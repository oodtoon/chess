import type { ComponentEvents, ComponentProps, SvelteComponent } from "svelte";
import Dialog from "./Dialog.svelte";

interface Closeable<T=any> {
  close: CustomEvent<T>
}

export default async function openDialog<
  CMP extends SvelteComponent<{}, {}, Closeable>,
>(component: CMP, props: {}) {
  return new Promise((resolve, reject) => {
    const Component = component as unknown as typeof SvelteComponent
    const dialog = new Component({ target: document.body });
    dialog.$on("close", (event : ComponentEvents<CMP>) => {
      resolve(event.detail);
      dialog.$destroy();
    });
  });
}
