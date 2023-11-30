import { BaseAction } from "../action";
import Adapter from "../adapter";
import NodeMutation from "../node-mutation";

/**
 * AppendAction to append code to the bottom of node body.
 * @extends BaseAction
 */
export class AppendAction<T> extends BaseAction<T> {
  /**
   * Create an AppendAction
   * @param {T} node
   * @param {string} code
   */
  constructor(node: T, code: string, { adapter }: { adapter: Adapter<T> }) {
    super(node, code, { adapter });
    this.type = "insert";
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions() {
    this.start = this.adapter.getEnd(this.node!) - this.adapter.getIndent(this.node!) - "}".length;
    this.end = this.start;
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get newCode() {
    const source = this.rewrittenSource();
    const indent = " ".repeat(this.adapter.getIndent(this.node!) + NodeMutation.tabWidth);
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
