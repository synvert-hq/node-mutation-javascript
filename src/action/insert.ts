import type { POSITION, InsertOptions } from "../types/action";
import { BaseAction } from "../action";
import { getAdapter } from "../helpers";

/**
 * InsertAction to add code to the node.
 * @extends BaseAction
 */
export class InsertAction<T> extends BaseAction<T> {
  private at?: POSITION;
  private selector?: string;

  /**
   * Create an InsertAction
   * @param {T} node
   * @param {string} code - new code to be inserted
   * @param {InsertOptions} options
   */
  constructor(node: T, code: string, options: InsertOptions) {
    super(node, code);
    this.at = options.at;
    this.selector = options.to;
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    const range = this.selector
      ? getAdapter<T>().childNodeRange(this.node, this.selector)
      : { start: getAdapter<T>().getStart(this.node), end: getAdapter<T>().getEnd(this.node) };
    this.start = this.at === "beginning" ? range.start : range.end;
    this.end = this.start;
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get newCode(): string {
    return this.rewrittenSource();
  }
}