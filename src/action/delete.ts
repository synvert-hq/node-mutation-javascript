import { Node } from "typescript";
import Action from "../action";
import { getAdapter } from "../helpers";

/**
 * DeleteAction to delete child node.
 * @extends Action
 */
class DeleteAction extends Action {
  private selectors: string[];

  /**
   * Create a DeleteAction
   * @param {Node} node
   * @param {string|string[]} selectors - name of child nodes
   */
  constructor(node: Node, selectors: string | string[]) {
    super(node, "");
    this.selectors = Array.isArray(selectors) ? selectors : Array(selectors);
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    this.beginPos = Math.min(
      ...this.selectors.map(
        (selector) => getAdapter<Node>().childNodeRange(this.node, selector).start
      )
    );
    this.endPos = Math.max(
      ...this.selectors.map(
        (selector) => getAdapter<Node>().childNodeRange(this.node, selector).end
      )
    );
    this.squeezeSpaces();
    this.removeBraces();
    this.removeComma();
    this.removeSpace();
  }

  /**
   * The rewritten code, always empty string.
   */
  get rewrittenCode(): string {
    return "";
  }
}

export default DeleteAction;