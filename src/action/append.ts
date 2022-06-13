import { Node } from "typescript";
import Action from "../action";
import { getAdapter } from "../helpers";

const DEFAULT_INDENT = 2;

/**
 * AppendAction to append code to the bottom of node body.
 * @extends Action
 */
class AppendAction extends Action {
  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions() {
    this.beginPos = getAdapter<Node>().getEnd(this.node) - getAdapter<Node>().getIndent(this.node) - "}".length;
    this.endPos = this.beginPos;
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get rewrittenCode() {
    const source = this.rewrittenSource();
    const indent = " ".repeat(getAdapter<Node>().getIndent(this.node) + DEFAULT_INDENT);
    if (source.split("\n").length > 1) {
      return (
        source
          .split("\n")
          .map((line) => indent + line)
          .join("\n") + "\n"
      );
    } else {
      return indent + source + "\n";
    }
  }
}

export default AppendAction;
