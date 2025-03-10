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
   * @param {object} options
   * @param {Adapter<T>} options.adapter - adapter to parse the node
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
    const indent = this.adapter.getIndent(this.node!) + NodeMutation.tabWidth;
    return this.addIndentToCode(source, indent);
  }
}