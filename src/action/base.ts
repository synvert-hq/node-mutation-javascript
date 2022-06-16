import { Node } from "typescript";
import type { Action } from "../types";
import { getAdapter } from "../helpers";

/**
 * Action does some real actions, e.g. insert / replace / delete code.
 */
export abstract class BaseAction {
  protected start: number;
  protected end: number;

  /**
   * Create an Action.
   * @param {Node} node
   * @param {string} code - new code to insert, replace or delete
   */
  constructor(protected node: Node, protected code: string) {
    this.start = -1;
    this.end = -1;
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
  process(): Action {
    this.calculatePositions();

    return {
      start: this.start,
      end: this.end,
      newCode: this.newCode,
    };
  }

  /**
   * The rewritten source code.
   * @returns {string} rewritten code.
   */
  abstract get newCode(): string;

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
    const source = this.source();
    const beforeCharIsSpace = source[this.start - 1] === " ";
    const afterCharIsSpace = source[this.end] == " ";
    if (beforeCharIsSpace && afterCharIsSpace) {
      this.start = this.start - 1;
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
      this.end = this.end + "\n".length;
    }
  }

  /**
   * Remove unused braces.
   * e.g. `foobar({ foo: bar })`, if we remove `foo: bar`, braces should also be removed.
   * @protected
   */
  protected removeBraces(): void {
    if (this.prevTokenIs("{") && this.nextTokenIs("}")) {
      this.start = this.start - 1;
      this.end = this.end + 1;
    } else if (this.prevTokenIs("{ ") && this.nextTokenIs(" }")) {
      this.start = this.start - 2;
      this.end = this.end + 2;
    } else if (this.prevTokenIs("{") && this.nextTokenIs(" }")) {
      this.start = this.start - 1;
      this.end = this.end + 2;
    } else if (this.prevTokenIs("{ ") && this.nextTokenIs("}")) {
      this.start = this.start - 2;
      this.end = this.end + 1;
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
      this.start = this.start - 1;
    } else if (this.prevTokenIs(", ")) {
      this.start = this.start - 2;
    } else if (this.nextTokenIs(", ") && !this.startWith(":")) {
      this.end = this.end + 2;
    } else if (this.nextTokenIs(",") && !this.startWith(":")) {
      this.end = this.end + 1;
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
    const source = this.source();
    const beforeCharIsSpace = source[this.start - 1] === " ";
    const afterCharIsGreatThan = source[this.end] == ">";
    if (beforeCharIsSpace && afterCharIsGreatThan) {
      this.start = this.start - 1;
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
      this.source().slice(this.end, this.end + substr.length) === substr
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
      this.source().slice(this.start - substr.length, this.start) ===
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
      this.source().slice(this.start, this.start + substr.length) ===
      substr
    );
  }
}