import { BaseAction } from "../action";
import { getAdapter } from "../helpers";

/**
 * RemoveAction to remove current node.
 * @extends BaseAction
 */
export class RemoveAction<T> extends BaseAction<T> {
  /**
   * Create a RemoveAction
   * @param {T} node
   */
  constructor(node: T) {
    super(node, "");
    this.type = "delete";
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    if (this.takeWholeLine()) {
      const lines = this.source().split("\n");
      const beginLine = getAdapter<T>().getStartLoc(this.node).line;
      const endLine = getAdapter<T>().getEndLoc(this.node).line;
      this.start =
        lines.slice(0, beginLine - 1).join("\n").length +
        (beginLine === 1 ? 0 : "\n".length);
      this.end = lines.slice(0, endLine).join("\n").length;
      if (lines.length > endLine) {
        this.end = this.end + "\n".length;
      }
      this.squeezeLines();
    } else {
      this.start = getAdapter<T>().getStart(this.node);
      this.end = getAdapter<T>().getEnd(this.node);
      this.squeezeSpaces();
      this.removeBraces();
      this.removeComma();
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
   * Check if the source code of this node takes the whole line.
   * @private
   * @returns {boolean}
   */
  private takeWholeLine(): boolean {
    const sourceFromFile = this.source()
      .split("\n")
      .slice(getAdapter<T>().getStartLoc(this.node).line - 1, getAdapter<T>().getEndLoc(this.node).line)
      .join("\n")
      .trim();
    const source = getAdapter<T>().getSource(this.node);
    return (
      source === sourceFromFile ||
      source + ";" === sourceFromFile ||
      source + "," === sourceFromFile
    );
  }
}