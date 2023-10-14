import type { InsertOptions } from "../types/action";
import { BaseAction } from "../action";
import { getAdapter } from "../helpers";

/**
 * InsertAction to add code to the node.
 * @extends BaseAction
 */
export class InsertAction<T> extends BaseAction<T> {
  private selector?: string;
  private options: InsertOptions;

  /**
   * Create an InsertAction
   * @param {T} node
   * @param {string} code - new code to be inserted
   * @param {InsertOptions} options
   */
  constructor(node: T, code: string, options: InsertOptions) {
    super(node, code);
    this.selector = options.to;
    this.options = options;
    this.type = "insert";
    if (options.conflictPosition) {
      this.conflictPosition = options.conflictPosition;
    }
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    const range = this.selector
      ? getAdapter<T>().childNodeRange(this.node!, this.selector)
      : { start: getAdapter<T>().getStart(this.node!), end: getAdapter<T>().getEnd(this.node!) };
    this.start = this.options.at === "beginning" ? range.start : range.end;
    this.end = this.start;
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get newCode(): string {
    if (this.options.andComma) {
      return this.options.at === "end" ? `, ${this.code}` : `${this.code}, `;
    }
    if (this.options.andSpace) {
      return this.options.at === "end" ? ` ${this.code}` : `${this.code} `;
    }
    return this.rewrittenSource();
  }
}