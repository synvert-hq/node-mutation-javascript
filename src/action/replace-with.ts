import { BaseAction } from "../action";
import Adapter from "../adapter";

/**
 * ReplaceWithAction to replace code.
 * @extends BaseAction
 */
export class ReplaceWithAction<T> extends BaseAction<T> {
  /**
   * Create an ReplaceAction
   * @param {T} node
   * @param {string} code
   */
  constructor(node: T, code: string, { adapter }: { adapter: Adapter<T> }) {
    super(node, code, { adapter });
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
    return this.rewrittenSource();
  }
}