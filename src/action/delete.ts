import { BaseAction } from "../action";
import { getAdapter } from "../helpers";
import { DeleteOptions } from "../types/action";

/**
 * DeleteAction to delete child node.
 * @extends BaseAction
 */
export class DeleteAction<T> extends BaseAction<T> {
  private selectors: string[];
  private options: DeleteOptions;

  /**
   * Create a DeleteAction
   * @param {T} node
   * @param {string|string[]} selectors - name of child nodes
   * @param {DeleteOptions} options
   */
  constructor(node: T, selectors: string | string[], options: DeleteOptions) {
    super(node, "");
    this.selectors = Array.isArray(selectors) ? selectors : Array(selectors);
    this.type = "delete";
    this.options = options;
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    this.start = Math.min(
      ...this.selectors.map(
        (selector) => getAdapter<T>().childNodeRange(this.node!, selector).start
      )
    );
    this.end = Math.max(
      ...this.selectors.map(
        (selector) => getAdapter<T>().childNodeRange(this.node!, selector).end
      )
    );
    if (this.options.andComma) {
      this.removeComma();
    }
    this.squeezeSpaces();
    this.removeSpace();
    if (this.options.wholeLine) {
      this.removeNewLine();
      this.squeezeLines();
    }
  }

  /**
   * The rewritten code, always empty string.
   */
  get newCode(): string {
    return "";
  }

  /**
   * Remove the whole line.
   * @private
   */
  private removeNewLine(): void {
    const lines = this.source().split("\n");
    const beginLine = this.beginLine();
    const endLine = this.endLiine();
    this.start =
      lines.slice(0, beginLine - 1).join("\n").length +
      (beginLine === 1 ? 0 : "\n".length);
    this.end = lines.slice(0, endLine).join("\n").length;
    if (lines.length > endLine) {
      this.end = this.end + "\n".length;
    }
  }

  private beginLine(): number {
    return getAdapter<T>().fileContent(this.node!).slice(0, this.start).split("\n").length;
  }

  private endLiine(): number {
    return getAdapter<T>().fileContent(this.node!).slice(0, this.end).split("\n").length;
  }
}

export default DeleteAction;