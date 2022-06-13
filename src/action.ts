import { Node } from "typescript";
import { getAdapter } from "./helpers";

const DEFAULT_INDENT = 2;

/**
 * Action does some real actions, e.g. insert / replace / delete code.
 */
abstract class Action {
  public beginPos: number;
  public endPos: number;

  /**
   * Create an Action.
   * @param {Node} node
   * @param {string} code - new code to insert, replace or delete
   */
  constructor(protected node: Node, protected code: string) {
    this.beginPos = -1;
    this.endPos = -1;
  }

  /**
   * Calculate start and begin positions.
   * @abstract
   * @protected
   */
  protected abstract calculatePositions(): void;

  /**
   * Calculate begin and end positions, and return this.
   * @returns {Action} this
   */
  process(): this {
    this.calculatePositions();
    return this;
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  abstract get rewrittenCode(): string;

  /**
   * The rewritten source code.
   * @protected
   * @returns {string} rewritten source code.
   */
  protected rewrittenSource(): string {
    return getAdapter<Node>().rewrittenSource(this.node, this.code);
  }

  /**
   * Get the source code of this node.
   * @protected
   * @returns source code of this node.
   */
  protected source(): string {
    return getAdapter<Node>().fileContent(this.node);
  }

  /**
   * Squeeze spaces from source code.
   * @protected
   */
  protected squeezeSpaces(): void {
    const beforeCharIsSpace = this.source()[this.beginPos - 1] === " ";
    const afterCharIsSpace = this.source()[this.endPos] == " ";
    if (beforeCharIsSpace && afterCharIsSpace) {
      this.beginPos = this.beginPos - 1;
    }
  }

  /**
   * Squeeze empty lines from source code.
   * @protected
   */
  protected squeezeLines(): void {
    const lines = this.source().split("\n");
    const beginLine = getAdapter<Node>().getStartLoc(this.node).line;
    const endLine = getAdapter<Node>().getEndLoc(this.node).line;
    const beforeLineIsBlank = endLine === 1 || lines[beginLine - 2] === "";
    const afterLineIsBlank = lines[endLine] === "";
    if (lines.length > 1 && beforeLineIsBlank && afterLineIsBlank) {
      this.endPos = this.endPos + "\n".length;
    }
  }

  /**
   * Remove unused braces.
   * e.g. `foobar({ foo: bar })`, if we remove `foo: bar`, braces should also be removed.
   * @protected
   */
  protected removeBraces(): void {
    if (this.prevTokenIs("{") && this.nextTokenIs("}")) {
      this.beginPos = this.beginPos - 1;
      this.endPos = this.endPos + 1;
    } else if (this.prevTokenIs("{ ") && this.nextTokenIs(" }")) {
      this.beginPos = this.beginPos - 2;
      this.endPos = this.endPos + 2;
    } else if (this.prevTokenIs("{") && this.nextTokenIs(" }")) {
      this.beginPos = this.beginPos - 1;
      this.endPos = this.endPos + 2;
    } else if (this.prevTokenIs("{ ") && this.nextTokenIs("}")) {
      this.beginPos = this.beginPos - 2;
      this.endPos = this.endPos + 1;
    }
  }

  /**
   * Rmove unused comma.
   * e.g. `foobar(foo, bar)`, if we remove `foo`, the comma should also be removed,
   * the code should be changed to `foobar(bar)`.
   * @protected
   */
  protected removeComma(): void {
    if (this.prevTokenIs(",")) {
      this.beginPos = this.beginPos - 1;
    } else if (this.prevTokenIs(", ")) {
      this.beginPos = this.beginPos - 2;
    } else if (this.nextTokenIs(", ") && !this.startWith(":")) {
      this.endPos = this.endPos + 2;
    } else if (this.nextTokenIs(",") && !this.startWith(":")) {
      this.endPos = this.endPos + 1;
    }
  }

  /**
   * Remove unused space.
   * e.g. `<div foo='bar'>foobar</div>`, if we remove `foo='bar`, the space should also be removed,
   * the code shoulde be changed to `<div>foobar</div>`.
   * @protected
   */
  protected removeSpace(): void {
    // this happens when removing a property in jsx element.
    const beforeCharIsSpace = this.source()[this.beginPos - 1] === " ";
    const afterCharIsGreatThan = this.source()[this.endPos] == ">";
    if (beforeCharIsSpace && afterCharIsGreatThan) {
      this.beginPos = this.beginPos - 1;
    }
  }

  /**
   * Check if next token is substr.
   * @private
   * @param {string} substr
   * @returns {boolean} true if next token is equal to substr
   */
  private nextTokenIs(substr: string): boolean {
    return (
      this.source().slice(this.endPos, this.endPos + substr.length) === substr
    );
  }

  /**
   * Check if previous token is substr.
   * @private
   * @param {string} substr
   * @returns {boolean} true if previous token is equal to substr
   */
  private prevTokenIs(substr: string): boolean {
    return (
      this.source().slice(this.beginPos - substr.length, this.beginPos) ===
      substr
    );
  }

  /**
   * Check if the node source starts with semicolon.
   * @private
   * @param {string} substr
   * @returns {boolean} true if the node source starts with semicolon
   */
  private startWith(substr: string): boolean {
    return (
      this.source().slice(this.beginPos, this.beginPos + substr.length) ===
      substr
    );
  }
}

/**
 * AppendAction to append code to the bottom of node body.
 * @extends Action
 */
class AppendAction extends Action {
  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions() {
    this.beginPos = getAdapter<Node>().getEnd(this.node) - getAdapter<Node>().getIndent(this.node) - "}".length;
    this.endPos = this.beginPos;
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get rewrittenCode() {
    const source = this.rewrittenSource();
    const indent = " ".repeat(getAdapter<Node>().getIndent(this.node) + DEFAULT_INDENT);
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

/**
 * PrependAction to prepend code to the top of node body.
 * @extends Action
 */
class PrependAction extends Action {
  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    this.beginPos = getAdapter<Node>().getSource(this.node).indexOf("{") + "{\n".length;
    this.endPos = this.beginPos;
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get rewrittenCode(): string {
    const source = this.rewrittenSource();
    const indent = " ".repeat(getAdapter<Node>().getIndent(this.node) + DEFAULT_INDENT);
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

interface InsertActionOptions {
  at: string;
  to?: string;
}

/**
 * InsertAction to add code to the node.
 * @extends Action
 */
class InsertAction extends Action {
  private at: string;
  private selector?: string;

  /**
   * Create an InsertAction
   * @param {Node} node
   * @param {string} code - new code to be inserted
   * @param {Object} options - position to insert code
   */
  constructor(node: Node, code: string, options: InsertActionOptions) {
    super(node, code);
    this.at = options.at;
    this.selector = options.to;
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    const range = this.selector
      ? getAdapter<Node>().childNodeRange(this.node, this.selector)
      : { start: this.node.getStart(), end: this.node.getEnd() };
    this.beginPos = this.at === "beginning" ? range.start : range.end;
    this.endPos = this.beginPos;
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get rewrittenCode(): string {
    return this.rewrittenSource();
  }
}

/**
 * DeleteAction to delete child node.
 * @extends Action
 */
class DeleteAction extends Action {
  private selectors: string[];

  /**
   * Create a DeleteAction
   * @param {Node} node
   * @param {string|string[]} selectors - name of child nodes
   */
  constructor(node: Node, selectors: string | string[]) {
    super(node, "");
    this.selectors = Array.isArray(selectors) ? selectors : Array(selectors);
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    this.beginPos = Math.min(
      ...this.selectors.map(
        (selector) => getAdapter<Node>().childNodeRange(this.node, selector).start
      )
    );
    this.endPos = Math.max(
      ...this.selectors.map(
        (selector) => getAdapter<Node>().childNodeRange(this.node, selector).end
      )
    );
    this.squeezeSpaces();
    this.removeBraces();
    this.removeComma();
    this.removeSpace();
  }

  /**
   * The rewritten code, always empty string.
   */
  get rewrittenCode(): string {
    return "";
  }
}

/**
 * RemoveAction to remove current node.
 * @extends Action
 */
class RemoveAction extends Action {
  /**
   * Create a RemoveAction
   * @param {Node} node
   */
  constructor(node: Node) {
    super(node, "");
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    if (this.takeWholeLine()) {
      const lines = this.source().split("\n");
      const beginLine = getAdapter<Node>().getStartLoc(this.node).line;
      const endLine = getAdapter<Node>().getEndLoc(this.node).line;
      this.beginPos =
        lines.slice(0, beginLine - 1).join("\n").length +
        (beginLine === 1 ? 0 : "\n".length);
      this.endPos = lines.slice(0, endLine).join("\n").length;
      if (lines.length > endLine) {
        this.endPos = this.endPos + "\n".length;
      }
      this.squeezeLines();
    } else {
      this.beginPos = getAdapter<Node>().getStart(this.node);
      this.endPos = getAdapter<Node>().getEnd(this.node);
      this.squeezeSpaces();
      this.removeBraces();
      this.removeComma();
      this.removeSpace();
    }
  }

  /**
   * The rewritten code, always empty string.
   */
  get rewrittenCode(): string {
    return "";
  }

  /**
   * Check if the source code of this node takes the whole line.
   * @private
   * @returns {boolean}
   */
  private takeWholeLine(): boolean {
    const sourceFromFile = this.source()
      .split("\n")
      .slice(getAdapter<Node>().getStartLoc(this.node).line - 1, getAdapter<Node>().getEndLoc(this.node).line)
      .join("\n")
      .trim();
    const source = getAdapter<Node>().getSource(this.node);
    return (
      source === sourceFromFile ||
      source + ";" === sourceFromFile ||
      source + "," === sourceFromFile
    );
  }
}

interface ReplaceActionOptions {
  with: string;
}

/**
 * ReplaceAction to replace child node with code.
 * @extends Action
 */
class ReplaceAction extends Action {
  private selectors: string[];

  /**
   * Create a ReplaceAction
   * @param {Node} node
   * @param {string|string[]} selectors - name of child nodes
   * @param {Object} options - { with } new code to be replaced
   */
  constructor(
    node: Node,
    selectors: string | string[],
    options: ReplaceActionOptions
  ) {
    super(node, options.with);
    this.selectors = Array.isArray(selectors) ? selectors : Array(selectors);
  }

  /**
   * Calculate the begin and end positions.
   * @protected
   */
  calculatePositions(): void {
    this.beginPos = Math.min(
      ...this.selectors.map(
        (selector) => getAdapter<Node>().childNodeRange(this.node, selector).start
      )
    );
    this.endPos = Math.max(
      ...this.selectors.map(
        (selector) => getAdapter<Node>().childNodeRange(this.node, selector).end
      )
    );
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  get rewrittenCode(): string {
    return this.rewrittenSource();
  }
}

interface ReplaceWithActionOptions {
  autoIndent: boolean;
}

/**
 * ReplaceWithAction to replace code.
 * @extends Action
 */
class ReplaceWithAction extends Action {
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
    options: ReplaceWithActionOptions = { autoIndent: true }
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
      this.beginPos = getAdapter<Node>().getStart(this.node);
    } else {
      this.beginPos = getAdapter<Node>().getStart(this.node) - getAdapter<Node>().getStartLoc(this.node).column;
    }
    this.endPos = getAdapter<Node>().getEnd(this.node);
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

export {
  InsertActionOptions,
  ReplaceActionOptions,
  ReplaceWithActionOptions,
  Action,
  AppendAction,
  DeleteAction,
  PrependAction,
  InsertAction,
  RemoveAction,
  ReplaceAction,
  ReplaceWithAction,
};
