import type { Action } from "../types/action";
import { getAdapter } from "../helpers";
import debug from "debug";
import { NotSupportedError } from "../error";

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
   * Get the new source code after evaluating the node.
   * @returns {string} The new source code.
   * @example
   * this.node = ts.createSourceFile("code.ts", "foo.substring(1, 2)")
   * this.code = "{{expression.name}}"
   * rewrittenSource() // substring
   *
   * // node array
   * const node = ts.createSourceFile("code.ts", "foo.substring(1, 2)")
   * rewrittenSource(node, "{{expression.expression.expression}}.slice({{expression.arguments}})") // foo.slice(1, 2)
   *
   * // index for node array
   * const node = ts.createSourceFile("code.ts", "foo.substring(1, 2)")
   * rewrittenSource(node, "{{expression.arguments.1}}") // 2
   *
   * // {name}_property for node who has properties
   * const node = ts.createSourceFile("code.ts", "const foobar = { foo: 'foo', bar: 'bar' }")
   * rewritten_source(node, '{{declarationList.declarations.0.initializer.foo_property}}')) # foo: 'foo'
   *
   * // {name}_initializer for node who has properties
   * const node = ts.createSourceFile("code.ts", "const foobar = { foo: 'foo', bar: 'bar' }")
   * rewritten_source(node, '{{declarationList.declarations.0.initializer.foo_initializer}}')) # 'foo'
   */
  protected rewrittenSource(): string {
    return this.code.replace(/{{(.+?)}}/gm, (_string, match, _offset) => {
      if (!match) return null;

      const obj = getAdapter<T>().childNodeValue(this.node!, match);
      if (obj) {
        if (Array.isArray(obj)) {
          return getAdapter<T>().fileContent(this.node!).slice(getAdapter<T>().getStart(obj[0]), getAdapter<T>().getEnd(obj[obj.length - 1]));
        }
        if (obj.hasOwnProperty("kind") || obj.hasOwnProperty("type")) {
          return getAdapter<T>().getSource(obj);
        } else {
          return obj;
        }
      } else {
        throw new NotSupportedError(`can not parse "${this.code}"`);
      }
    });
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
}