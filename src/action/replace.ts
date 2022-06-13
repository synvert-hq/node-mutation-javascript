import { Node } from "typescript";
import type { ReplaceOptions } from "../types";
import ActionObject from "../action";
import { getAdapter } from "../helpers";

/**
 * ReplaceAction to replace child node with code.
 * @extends ActionObject
 */
class ReplaceAction extends ActionObject {
  private selectors: string[];

  /**
   * Create a ReplaceAction
   * @param {Node} node
   * @param {string|string[]} selectors - name of child nodes
   * @param {Object} options - { with } new code to be replaced
   */
  constructor(
    node: Node,
    selectors: string | string[],
    options: ReplaceOptions
  ) {
    super(node, options.with);
    this.selectors = Array.isArray(selectors) ? selectors : Array(selectors);
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    this.start = Math.min(
      ...this.selectors.map(
        (selector) => getAdapter<Node>().childNodeRange(this.node, selector).start
      )
    );
    this.end = Math.max(
      ...this.selectors.map(
        (selector) => getAdapter<Node>().childNodeRange(this.node, selector).end
      )
    );
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get rewrittenCode(): string {
    return this.rewrittenSource();
  }
}

export default ReplaceAction;