import type { ComponentEventPayload, GetProps, Scope } from "$lib/type";
import type { ComponentType } from "svelte";

type DialogPayload<CMP extends ComponentType> = ComponentEventPayload<
  CMP,
  "close"
>;

const scope: Scope = {
  controller: null,
};

export function abort(reason: any) {
  console.log(scope.controller)
  scope.controller?.abort(reason);
}

export default async function openDialog<CMP extends ComponentType>(
  component: CMP,
  props?: GetProps<CMP>
): Promise<DialogPayload<CMP>> {
  
  return new Promise((resolve, reject) => {
    scope.controller = new AbortController();

    const dialog = new component({ target: document.body, props });

    scope.controller.signal.addEventListener("abort", () => {
      dialog.$destroy();
    });

    dialog.$on("close", (event) => {
      resolve(event.detail);
      dialog.$destroy();
    });
  });
}
