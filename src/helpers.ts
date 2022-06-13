
import NodeMutation from "./node-mutation";
import Adapter from "./adapter";

export function getAdapter<T>(): Adapter<T> {
  return NodeMutation.getAdapter();
}