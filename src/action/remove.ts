import { Node } from "typescript";
import { BaseAction } from "../action";
import { getAdapter } from "../helpers";

/**
 * RemoveAction to remove current node.
 * @extends BaseAction
 */
export class RemoveAction extends BaseAction {
  /**
   * Create a RemoveAction
   * @param {Node} node
   */
  constructor(node: Node) {
    super(node, "");
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    if (this.takeWholeLine()) {
      const lines = this.source().split("\n");
      const beginLine = getAdapter<Node>().getStartLoc(this.node).line;
      const endLine = getAdapter<Node>().getEndLoc(this.node).line;
      this.start =
        lines.slice(0, beginLine - 1).join("\n").length +
        (beginLine === 1 ? 0 : "\n".length);
      this.end = lines.slice(0, endLine).join("\n").length;
      if (lines.length > endLine) {
        this.end = this.end + "\n".length;
      }
      this.squeezeLines();
    } else {
      this.start = getAdapter<Node>().getStart(this.node);
      this.end = getAdapter<Node>().getEnd(this.node);
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
      .slice(getAdapter<Node>().getStartLoc(this.node).line - 1, getAdapter<Node>().getEndLoc(this.node).line)
      .join("\n")
      .trim();
    const source = getAdapter<Node>().getSource(this.node);
    return (
      source === sourceFromFile ||
      source + ";" === sourceFromFile ||
      source + "," === sourceFromFile
    );
  }
}