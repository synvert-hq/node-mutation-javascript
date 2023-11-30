import type { InsertOptions } from "../types/action";
import { BaseAction } from "../action";
import Adapter from "../adapter";

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
   * @param options.adapter - adapter to parse the node
   */
  constructor(node: T, code: string, options: InsertOptions & { adapter: Adapter<T> }) {
    super(node, code, { adapter: options.adapter });
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
      ? this.adapter.childNodeRange(this.node!, this.selector)
      : { start: this.adapter.getStart(this.node!), end: this.adapter.getEnd(this.node!) };
    this.start = this.options.at === "beginning" ? range.start : range.end;
    this.end = this.start;
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get newCode(): string {
    if (this.options.andComma) {
      return this.options.at === "end" ? `, ${this.rewrittenSource()}` : `${this.rewrittenSource()}, `;
    }
    if (this.options.andSpace) {
      return this.options.at === "end" ? ` ${this.rewrittenSource()}` : `${this.rewrittenSource()} `;
    }
    return this.rewrittenSource();
  }
}