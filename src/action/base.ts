import type { Action } from "../types/action";
import { getAdapter } from "../helpers";
import debug from "debug";

/**
 * Action does some real actions, e.g. insert / replace / delete code.
 */
export abstract class BaseAction<T> {
  protected type: string;
  protected start: number;
  protected end: number;
  protected conflictPosition?: number;
  protected actions?: Action[];

  /**
   * Create an Action.
   * @param {T} node
   * @param {string} code - new code to insert, replace or delete
   */
  constructor(protected node: T | undefined, protected code: string) {
    this.start = -1;
    this.end = -1;
    this.type = "";
  }

  /**
   * Calculate start and begin positions.
   * @abstract
   * @protected
   */
  protected abstract calculatePositions(): void;

  /**
   * Calculate begin and end positions, and return an action.
   * @returns {Action} action
   */
  process(): Action {
    this.calculatePositions();

    debug("node-mutation")(`${this.constructor.name}[${this.start}-${this.end}]:${this.newCode}`);
    const result: Action = {
      type: this.type,
      start: this.start,
      end: this.end,
      newCode: this.newCode,
      actions: this.actions,
    };
    if (this.conflictPosition) {
      result.conflictPosition = this.conflictPosition;
    }
    return result;
  }

  /**
   * The rewritten source code.
   * @returns {string | undefined} rewritten code.
   */
  abstract get newCode(): string | undefined;

  /**
   * The rewritten source code.
   * @protected
   * @returns {string} rewritten source code.
   */
  protected rewrittenSource(): string {
    return getAdapter<T>().rewrittenSource(this.node!, this.code);
  }

  /**
   * Get the source code of this node.
   * @protected
   * @returns source code of this node.
   */
  protected source(): string {
    return getAdapter<T>().fileContent(this.node!);
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
    const beginLine = getAdapter<T>().getStartLoc(this.node!).line;
    const endLine = getAdapter<T>().getEndLoc(this.node!).line;
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
    let leadingCount = 1;
    while (true) {
      if (this.source()[this.start - leadingCount] === ',') {
        this.start -= leadingCount;
        return;
      } else if (['\n', '\r', '\t', ' '].includes(this.source()[this.start - leadingCount])) {
        leadingCount += 1;
      } else {
        break;
      }
    }

    let trailingCount = 0;
    while (true) {
      if (this.source()[this.end + trailingCount] === ',') {
        this.end += trailingCount + 1;
        return;
      } else if (this.source()[this.end + trailingCount] === ' ') {
        trailingCount += 1;
      } else {
        break;
      }
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
    if (this.prevTokenIs(" ") && this.nextTokenIs(">")) {
      this.start = this.start - 1;
    }
    if (this.prevTokenIs(" ") && this.nextTokenIs("\n")) {
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