import type { ReplaceOptions } from "../types/action";
import { BaseAction } from "../action";
import Adapter from "../adapter";

/**
 * ReplaceAction to replace child node with code.
 * @extends BaseAction
 */
export class ReplaceAction<T> extends BaseAction<T> {
  private selectors: string[];

  /**
   * Create a ReplaceAction
   * @param {T} node
   * @param {string|string[]} selectors - name of child nodes
   * @param {ReplaceOptions} options
   */
  constructor(
    node: T,
    selectors: string | string[],
    options: ReplaceOptions & { adapter: Adapter<T> },
  ) {
    super(node, options.with, { adapter: options.adapter });
    this.selectors = Array.isArray(selectors) ? selectors : Array(selectors);
    this.type = "replace";
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    this.start = Math.min(
      ...this.selectors.map(
        (selector) => this.adapter.childNodeRange(this.node!, selector).start
      )
    );
    this.end = Math.max(
      ...this.selectors.map(
        (selector) => this.adapter.childNodeRange(this.node!, selector).end
      )
    );
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get newCode(): string {
    return this.rewrittenSource();
  }
}