import type { ReplaceWithOptions } from "../types";
import { BaseAction } from "../action";
import { getAdapter } from "../helpers";

/**
 * ReplaceWithAction to replace code.
 * @extends BaseAction
 */
export class ReplaceWithAction<T> extends BaseAction<T> {
  private autoIndent: boolean;

  /**
   * Create a ReplaceWithAction
   * @param {T} node
   * @param {string} code - new code to be replaced
   * @param {Object} options - default is { autoIndent: true } if auto fix indent
   */
  constructor(
    node: T,
    code: string,
    options: ReplaceWithOptions = { autoIndent: true }
  ) {
    super(node, code);
    this.autoIndent = options.autoIndent;
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    if (this.autoIndent) {
      this.start = getAdapter<T>().getStart(this.node);
    } else {
      this.start = getAdapter<T>().getStart(this.node) - getAdapter<T>().getStartLoc(this.node).column;
    }
    this.end = getAdapter<T>().getEnd(this.node);
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get newCode(): string {
    if (this.autoIndent && this.rewrittenSource().includes("\n")) {
      const newCode: string[] = [];
      this.rewrittenSource()
        .split("\n")
        .forEach((line, index) => {
          if (index === 0 || line === "") {
            newCode.push(line);
          } else {
            newCode.push(" ".repeat(getAdapter<T>().getIndent(this.node)) + line);
          }
        });
      return newCode.join("\n");
    } else {
      return this.rewrittenSource();
    }
  }
}