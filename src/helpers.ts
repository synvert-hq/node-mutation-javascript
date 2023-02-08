
import NodeMutation from "./node-mutation";
import Adapter from "./adapter";

/**
 * Get NodeMutation adapter.
 * @returns {Adapter} NodeMutation adapter
 */
export function getAdapter<T>(): Adapter<T> {
  return NodeMutation.getAdapter();
}