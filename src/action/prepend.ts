import { BaseAction } from "../action";
import Adapter from "../adapter";
import NodeMutation from "../node-mutation";

/**
 * PrependAction to prepend code to the top of node body.
 * @extends BaseAction
 */
export class PrependAction<T> extends BaseAction<T> {
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
  calculatePositions(): void {
    this.start = this.adapter.getStart(this.node!) + this.adapter.getSource(this.node!).indexOf("{") + "{\n".length;
    this.end = this.start;
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get newCode(): string {
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