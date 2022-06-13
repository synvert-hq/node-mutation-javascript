import { Node } from "typescript";
import type { ReplaceWithOptions } from "../types";
import ActionObject from "../action";
import { getAdapter } from "../helpers";

/**
 * ReplaceWithAction to replace code.
 * @extends ActionObject
 */
class ReplaceWithAction extends ActionObject {
  private autoIndent: boolean;

  /**
   * Create a ReplaceWithAction
   * @param {Node} node
   * @param {string} code - new code to be replaced
   * @param {Object} options - default is { autoIndent: true } if auto fix indent
   */
  constructor(
    node: Node,
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
      this.start = getAdapter<Node>().getStart(this.node);
    } else {
      this.start = getAdapter<Node>().getStart(this.node) - getAdapter<Node>().getStartLoc(this.node).column;
    }
    this.end = getAdapter<Node>().getEnd(this.node);
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get rewrittenCode(): string {
    if (this.autoIndent && this.rewrittenSource().includes("\n")) {
      const newCode: string[] = [];
      this.rewrittenSource()
        .split("\n")
        .forEach((line, index) => {
          if (index === 0 || line === "") {
            newCode.push(line);
          } else {
            newCode.push(" ".repeat(getAdapter<Node>().getIndent(this.node)) + line);
          }
        });
      return newCode.join("\n");
    } else {
      return this.rewrittenSource();
    }
  }
}

export default ReplaceWithAction;