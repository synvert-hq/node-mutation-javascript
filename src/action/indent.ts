import type { IndentOptions } from "../types/action";
import { BaseAction } from "../action";
import Adapter from "../adapter";
import NodeMutation from "../node-mutation";

/**
 * IndentAction to indent the node.
 * @extends BaseAction
 */
export class IndentAction<T> extends BaseAction<T> {
  private tabSize: number;

  /**
   * Create an IndentAction
   * @param {T} node
   * @param {IndentOptions} options
   * @param options.adapter - adapter to parse the node
   */
  constructor(node: T, { tabSize, adapter }: IndentOptions & { adapter: Adapter<T> }) {
    super(node, "", { adapter });
    this.tabSize = tabSize || 1;
    this.type = "replace";
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    this.start = this.adapter.getStart(this.node!);
    this.end = this.adapter.getEnd(this.node!);
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get newCode(): string {
    const source = this.adapter.getSource(this.node!);
    return source.split("\n").map(line => ' '.repeat(NodeMutation.tabWidth * this.tabSize) + line).join("\n");
  }
}