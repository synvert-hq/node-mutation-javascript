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
    const indent = this.adapter.getIndent(this.node!) + NodeMutation.tabWidth;
    return this.addIndentToCode(source, indent);
  }
}
