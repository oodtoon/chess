import type { ComponentEventPayload, GetProps } from "$lib/type";
import type { ComponentType } from "svelte";

type DialogPayload<CMP extends ComponentType> = ComponentEventPayload<
  CMP,
  "close"
>;

export default async function openDialog<CMP extends ComponentType>(
  component: CMP,
  props?: GetProps<CMP>
): Promise<DialogPayload<CMP>> {
  return new Promise((resolve, reject) => {
    const dialog = new component({ target: document.body, props });
    dialog.$on("close", (event) => {
      resolve(event.detail);
      dialog.$destroy();
    });
  });
}
