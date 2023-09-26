import { iterateActions } from "../helpers";
import { Action } from "../types/action";
import { BaseAction } from "./base";

const DEFAULT_START = 2**30;

/**
 * GroupAction to group actions.
 */
export class GroupAction<T> extends BaseAction<T> {
  protected start: number;
  protected end: number;
  public actions: Action[];

  /**
   * Create a GroupAction
   */
  constructor() {
    super(undefined, "");
    this.actions = [];
    this.type = "group";
    this.start = DEFAULT_START;
    this.end = 0;
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions() {
    iterateActions(this.actions!, (action) => {
      this.start = Math.min(this.start, action.start);
      this.end = Math.max(this.end, action.end);
    });
    if (this.start === DEFAULT_START) {
      this.start = 0;
    }
  }

  get newCode() {
    return undefined;
  }
}
