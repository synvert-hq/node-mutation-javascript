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

export default Action;