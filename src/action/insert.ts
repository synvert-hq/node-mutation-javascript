import { Node } from "typescript";
import type { InsertOptions } from "../types";
import { BaseAction } from "../action";
import { getAdapter } from "../helpers";

/**
 * InsertAction to add code to the node.
 * @extends BaseAction
 */
export class InsertAction extends BaseAction {
  private at: string;
  private selector?: string;

  /**
   * Create an InsertAction
   * @param {Node} node
   * @param {string} code - new code to be inserted
   * @param {Object} options - position to insert code
   */
  constructor(node: Node, code: string, options: InsertOptions) {
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
      ? getAdapter<Node>().childNodeRange(this.node, this.selector)
      : { start: this.node.getStart(), end: this.node.getEnd() };
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