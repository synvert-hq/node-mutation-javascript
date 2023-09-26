import { BaseAction } from "../action";
import { getAdapter } from "../helpers";

/**
 * NoopAction to do no operation.
 * @extends BaseAction
 */
export class NoopAction<T> extends BaseAction<T> {
  /**
   * Create a NoopAction
   * @param {T} node
   */
  constructor(node: T) {
    super(node, "");
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    this.start = getAdapter<T>().getStart(this.node!);
    this.end = getAdapter<T>().getEnd(this.node!);
  }

  get newCode() {
    return undefined;
  }
}