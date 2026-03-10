import React from "react";
import { createRoot, JsReactNode } from "../jsreact";
export type * from "../jsreact";

export function render(node: React.ReactNode, parent: HTMLElement) {
  createRoot(parent).render(node as unknown as JsReactNode);
}
export type VNode<P = {}> = React.ReactElement<P>;