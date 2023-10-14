import { BaseAction } from "../action";
import { getAdapter } from "../helpers";
import { RemoveOptions } from "../types/action";

/**
 * RemoveAction to remove current node.
 * @extends BaseAction
 */
export class RemoveAction<T> extends BaseAction<T> {
  private options: RemoveOptions;

  /**
   * Create a RemoveAction
   * @param {T} node
   * @param {DeleteOptions} options
   */
  constructor(node: T, options: RemoveOptions = {}) {
    super(node, "");
    this.type = "delete";
    this.options = options;
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    if (this.takeWholeLine()) {
      this.removeNewLine();
      this.squeezeLines();
    } else {
      this.start = getAdapter<T>().getStart(this.node!);
      this.end = getAdapter<T>().getEnd(this.node!);
      this.squeezeSpaces();
      this.removeBraces();
      if (this.options.andComma) {
        this.removeComma();
      }
      this.removeSpace();
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
    const beginLine = getAdapter<T>().getStartLoc(this.node!).line;
    const endLine = getAdapter<T>().getEndLoc(this.node!).line;
    this.start =
      lines.slice(0, beginLine - 1).join("\n").length +
      (beginLine === 1 ? 0 : "\n".length);
    this.end = lines.slice(0, endLine).join("\n").length;
    if (lines.length > endLine) {
      this.end = this.end + "\n".length;
    }
  }

  /**
   * Check if the source code of this node takes the whole line.
   * @private
   * @returns {boolean}
   */
  private takeWholeLine(): boolean {
    const beginLine = getAdapter<T>().getStartLoc(this.node!).line;
    const endLine = getAdapter<T>().getEndLoc(this.node!).line;
    const sourceFromFile = this.source()
      .split("\n")
      .slice(beginLine - 1, endLine)
      .join("\n")
      .trim();
    const source = getAdapter<T>().getSource(this.node!);
    return (
      source === sourceFromFile ||
      source + ";" === sourceFromFile ||
      source + "," === sourceFromFile
    );
  }
}