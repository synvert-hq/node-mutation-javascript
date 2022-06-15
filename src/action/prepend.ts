import { Node } from "typescript";
import ActionObject from "../action";
import { getAdapter, DEFAULT_INDENT } from "../helpers";

/**
 * PrependAction to prepend code to the top of node body.
 * @extends ActionObject
 */
class PrependAction extends ActionObject {
  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    this.start = getAdapter<Node>().getSource(this.node).indexOf("{") + "{\n".length;
    this.end = this.start;
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get newCode(): string {
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

export default PrependAction;