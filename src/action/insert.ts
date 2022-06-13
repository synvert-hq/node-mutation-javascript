import { Node } from "typescript";
import ActionObject from "../action";
import { getAdapter } from "../helpers";

interface InsertActionOptions {
  at: string;
  to?: string;
}

/**
 * InsertAction to add code to the node.
 * @extends ActionObject
 */
class InsertAction extends ActionObject {
  private at: string;
  private selector?: string;

  /**
   * Create an InsertAction
   * @param {Node} node
   * @param {string} code - new code to be inserted
   * @param {Object} options - position to insert code
   */
  constructor(node: Node, code: string, options: InsertActionOptions) {
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
    this.beginPos = this.at === "beginning" ? range.start : range.end;
    this.endPos = this.beginPos;
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get rewrittenCode(): string {
    return this.rewrittenSource();
  }
}

export default InsertAction;