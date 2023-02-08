import { BaseAction } from "../action";
import { getAdapter } from "../helpers";
import NodeMutation from "../node-mutation";

/**
 * PrependAction to prepend code to the top of node body.
 * @extends BaseAction
 */
export class PrependAction<T> extends BaseAction<T> {
  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    this.start = getAdapter<T>().getStart(this.node) + getAdapter<T>().getSource(this.node).indexOf("{") + "{\n".length;
    this.end = this.start;
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get newCode(): string {
    const source = this.rewrittenSource();
    const indent = " ".repeat(getAdapter<T>().getIndent(this.node) + NodeMutation.tabWidth);
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