
import NodeMutation from "./node-mutation";
import Adapter from "./adapter";

export const DEFAULT_INDENT = 2;

export function getAdapter<T>(): Adapter<T> {
  return NodeMutation.getAdapter();
}