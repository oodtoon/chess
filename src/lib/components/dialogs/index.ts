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


