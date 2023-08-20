import type {
  ComponentEvents,
  ComponentProps,
  ComponentType,
  SvelteComponent,
} from "svelte";

export type Color = "White" | "Black";

export type EndGameTitle =
  | "Draw!"
  | "White wins!"
  | "Black wins!"
  | "Stalemate!";

// Utility Types
/**
 * get the class Type for a svelteComponent
 */
export type SvelteClassType<CMP> = CMP extends ComponentType<infer T>
  ? T
  : never;

export type GetProps<CMP> = CMP extends ComponentType
  ? ComponentProps<SvelteClassType<CMP>>
  : CMP extends SvelteComponent
  ? ComponentProps<CMP>
  : never;

export type GetEvents<CMP> = CMP extends ComponentType
  ? ComponentEvents<SvelteClassType<CMP>>
  : CMP extends SvelteComponent
  ? ComponentEvents<CMP>
  : never;

export type CustomEventPayload<T> = T extends CustomEvent<infer U> ? U : never;

export type ComponentEventPayload<
  CMP,
  EventType extends keyof GetEvents<CMP>,
> = CustomEventPayload<GetEvents<CMP>[EventType]>;
