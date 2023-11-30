import type { Action } from './types/action';


export function iterateActions(actions: Action[], callback: (action: Action) => void) {
  actions.forEach((action) => {
    if (action.type === 'group') {
      iterateActions(action.actions!, callback);
    } else {
      callback(action);
    }
  });
}