import { BaseAction } from "../action";
import Adapter from "../adapter";

/**
 * NoopAction to do no operation.
 * @extends BaseAction
 */
export class NoopAction<T> extends BaseAction<T> {
  /**
   * Create a NoopAction
   * @param {T} node
   * @param {object} options
   * @param {Adapter<T>} options.adapter - adapter to parse the node
   */
  constructor(node: T, { adapter }: { adapter: Adapter<T> }) {
    super(node, "", { adapter });
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    this.start = this.adapter.getStart(this.node!);
    this.end = this.adapter.getEnd(this.node!);
  }

  get newCode() {
    return undefined;
  }
}