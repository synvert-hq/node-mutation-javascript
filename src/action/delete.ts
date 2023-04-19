import { BaseAction } from "../action";
import { getAdapter } from "../helpers";

/**
 * DeleteAction to delete child node.
 * @extends BaseAction
 */
export class DeleteAction<T> extends BaseAction<T> {
  private selectors: string[];

  /**
   * Create a DeleteAction
   * @param {T} node
   * @param {string|string[]} selectors - name of child nodes
   */
  constructor(node: T, selectors: string | string[]) {
    super(node, "");
    this.selectors = Array.isArray(selectors) ? selectors : Array(selectors);
    this.type = "delete";
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    this.start = Math.min(
      ...this.selectors.map(
        (selector) => getAdapter<T>().childNodeRange(this.node, selector).start
      )
    );
    this.end = Math.max(
      ...this.selectors.map(
        (selector) => getAdapter<T>().childNodeRange(this.node, selector).end
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
  get newCode(): string {
    return "";
  }
}

export default DeleteAction;