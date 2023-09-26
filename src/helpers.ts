import type { Action } from './types/action';

import NodeMutation from "./node-mutation";
import Adapter from "./adapter";

/**
 * Get NodeMutation adapter.
 * @returns {Adapter} NodeMutation adapter
 */
export function getAdapter<T>(): Adapter<T> {
  return NodeMutation.getAdapter();
}

export function iterateActions(actions: Action[], callback: (action: Action) => void) {
  actions.forEach((action) => {
    if (action.type === 'group') {
      iterateActions(action.actions!, callback);
    } else {
      callback(action);
    }
  });
}