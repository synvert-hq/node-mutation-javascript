import fs from "fs";

import type { Node } from "@xinminlabs/gonzales-pe";

import Adapter from "../adapter";
import { NotSupportedError } from "../error";

/**
 * GonzalesPe Adapter
 * @extends Adapter
 */
class GonzalesPeAdapter implements Adapter<Node> {
  // get node source
  getSource(node: Node, options?: { fixIndent: boolean }): string {
    const column = this.getIndent(node);
    return " ".repeat(column) + node.toString();
  }

  /**
   * Get the new source code after evaluating the node.
   * @param {Node} node - The node to evaluate.
   * @param {string} code - The code to evaluate.
   * @returns {string} The new source code.
   * @example
   * node = gonzales.parse("a { color: red; }", { syntax: "css" })
   * rewrittenSource(node, "{{block.declaration.value}})") // red
   */
  rewrittenSource(node: Node, code: string): string {
    return code.replace(/{{([a-zA-z0-9\.]+?)}}/gm, (string, match, _offset) => {
      if (!match) return null;

      const obj = this.actualValue(node, match.split("."));
      if (obj) {
        if (Array.isArray(obj)) {
          return this.fileContent(node).slice(
            this.getStart(node),
            this.getEnd(node)
          );
        }
        if (obj.hasOwnProperty("type")) {
          return this.getSource(obj);
        } else {
          return obj;
        }
      } else {
        throw new NotSupportedError(`can not parse "${code}"`);
      }
    });
  }

  /**
   * Get the source code of current file.
   * @returns {string} source code of current file.
   */
  fileContent(node: Node): string {
    return fs.readFileSync(node.sourceFile, "utf-8");
  }

  /**
   * Get the source range of child node.
   * @param {Node} node - The node.
   * @param {string} childName - The name to find child node.
   * @returns {Object} The range of the child node, e.g. { start: 0, end: 10 }
   * @throws {NotSupportedError} if we can't get the range.
   * @example
   * node = gonzales.parse("a { color: red }")
   * childNodeRange(node, "{{block.declaration.value}}") // { start: "a { color:  ".length, end: "a { color: red".length }
   */
  childNodeRange(
    node: Node,
    childName: string
  ): { start: number; end: number } {
    if (node.type === "block" && childName === "leftCurlyBracket") {
      return { start: this.getStart(node), end: this.getStart(node) + 1 };
    }
    if (node.type === "block" && childName === "rightCurlyBracket") {
      return { start: this.getEnd(node) - 1, end: this.getEnd(node) };
    }

    const [directChildName, ...nestedChildName] = childName.split(".");
    const childNode = (node as any)[directChildName];
    if (childNode) {
      if (Array.isArray(childNode)) {
        const [childDirectChildName, ...childNestedChildName] =
          nestedChildName;

        if (childNestedChildName.length > 0) {
          return this.childNodeRange(
            (childNode as any)[childDirectChildName] as Node,
            childNestedChildName.join(".")
          );
        }

        if (!Number.isNaN(childDirectChildName)) {
          const childChildNode = childNode.at(
            Number.parseInt(childDirectChildName)
          ) as Node;
          if (childChildNode) {
            return { start: this.getStart(childChildNode), end: this.getEnd(childChildNode) };
          } else {
            return { start: this.getEnd(node) - 1, end: this.getEnd(node) - 1 };
          }
        } else {
          throw new NotSupportedError(`${childName} is not supported for ${this.getSource(node)}`);
        }
      }

      if (nestedChildName.length > 0) {
        return this.childNodeRange(childNode, nestedChildName.join("."));
      }

      if (childNode) {
        return { start: this.getStart(childNode), end: this.getEnd(childNode) };
      }
    }

    throw new NotSupportedError(`${childName} is not supported for ${this.getSource(node)}`);
  }

  getStart(node: Node): number {
    if (node.start.line === 1) {
      return node.start.column - 1;
    }
    return this.lineCharsCount(this.fileContent(node), node.start.line - 1) + node.start.column - 1;
  }

  getEnd(node: Node): number {
    if (node.end.line === 1) {
      return node.end.column;
    }
    return this.lineCharsCount(this.fileContent(node), node.end.line - 1) + node.end.column;
  }

  getStartLoc(node: Node): { line: number; column: number } {
    return { line: node.start.line, column: node.start.column - 1 };
  }

  getEndLoc(node: Node): { line: number; column: number } {
    return { line: node.end.line, column: node.end.column };
  }

  getIndent(node: Node): number {
    return node.start.column - 1;
  }

  private actualValue(node: Node, multiKeys: string[]): any {
    let childNode: any = node;
    multiKeys.forEach((key) => {
      if (!childNode) return;

      if ((childNode as any)[key]) {
        childNode = (childNode as any)[key];
      } else {
        throw `${key} is not supported for ${this.getSource(childNode)}`;
      }
    });
    return childNode;
  }

  // Get the char count of lines of code.
  // @param code {String} source code.
  // @param lines {Number} lines of code.
  // @return {Number} char count of lines of code.
  private lineCharsCount(code: string, lines: number): number {
    return code.split("\n").slice(0, lines).join("\n").length + 1;
  }
}

export default GonzalesPeAdapter;
