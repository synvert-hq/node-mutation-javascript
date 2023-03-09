import { BaseAction } from "../action";
import { getAdapter } from "../helpers";

/**
 * ReplaceWithAction to replace code.
 * @extends BaseAction
 */
export class ReplaceWithAction<T> extends BaseAction<T> {
  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    this.start = getAdapter<T>().getStart(this.node);
    this.end = getAdapter<T>().getEnd(this.node);
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get newCode(): string {
    return this.rewrittenSource();
  }
}