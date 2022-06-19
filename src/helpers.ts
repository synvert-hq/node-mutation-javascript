
import NodeMutation from "./node-mutation";
import Adapter from "./adapter";

export const DEFAULT_INDENT = 2;

/**
 * Get NodeMutation adapter.
 * @returns {Adapter} NodeMutation adapter
 */
export function getAdapter<T>(): Adapter<T> {
  return NodeMutation.getAdapter();
}