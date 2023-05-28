import { Node } from "acorn";
import fs from "fs";
import Adapter from "../adapter";
import { NotSupportedError } from "../error";

/**
 * Implement node-query-typescript adapter
 * @see https://github.com/xinminlabs/node-query-typescript/blob/main/src/adapter.ts
 */
class EspreeAdapter implements Adapter<Node> {
  // get node source
  getSource(node: Node, options?: { fixIndent: boolean }): string {
    const source = this.fileContent(node).slice(node.start, node.end);
    if (options && options.fixIndent) {
      const column = this.getIndent(node);
      return source
        .split("\n")
        .map((line, index) => {
          if (index === 0 || line === "") {
            return line;
          } else {
            const index = line.search(/\S|$/);
            return index < column ? line.slice(index) : line.slice(column);
          }
        })
        .join("\n");
    } else {
      return source;
    }
  }

  /**
   * Get rewritten source code.
   * @example
   * // foo.slice(1, 2)
   * node.rewrittenSource("{{expression.callee.object}}.slice({{expression.arguments}})") #=>
   * @param {string} code - expression code
   * @returns {string} rewritten code.
   */
  rewrittenSource(node: Node, code: string): string {
    return code.replace(/{{([a-zA-z0-9\.]+?)}}/gm, (string, match, _offset) => {
      if (!match) return null;

      const obj = this.actualValue(node, match.split("."));
      if (obj) {
        if (Array.isArray(obj)) {
          return this.fileContent(node).slice(
            (obj[0] as Node).start,
            (obj[obj.length - 1] as Node).end
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
    return fs.readFileSync(node.loc!.source!, "utf-8");
  }

  /**
   * Get the source range of child node.
   * @param {string} childName - name of child node.
   * @returns {Object} child node range, e.g. { start: 0, end: 10 }
   * @throws {NotSupportedError} if we can't get the range.
   */
  childNodeRange(
    node: Node,
    childName: string
  ): { start: number; end: number } {
    if (node.type === "MethodDefinition" && childName === "async") {
      return { start: node.start, end: ((node as any).key as Node).start };
    } else if (node.type === "MemberExpression" && childName === "dot") {
      return {
        start: ((node as any).property as Node).start - 1,
        end: ((node as any).property as Node).start,
      };
    } else if (
      ["MemberExpression", "CallExpression"].includes(node.type) &&
      childName === "arguments"
    ) {
      if ((node as any).arguments && (node as any).arguments.length > 0) {
        return {
          start: ((node as any).arguments as NodeArrayExt)[0].start - 1,
          end:
            ((node as any).arguments as NodeArrayExt)[
              ((node as any).arguments as NodeArrayExt).length - 1
            ].end + 1,
        };
      } else {
        return { start: node.end - 2, end: node.end };
      }
    } else if (node.type === "ClassDeclaration" && childName === "class") {
      return { start: node.start, end: node.start + 5 };
    } else if (["FunctionDeclaration", "FunctionExpression"].includes(node.type) && childName === "params") {
      if ((node as any).params && (node as any).params.length > 0) {
        return {
          start: ((node as any).params as Node[])[0].start - 1,
          end:
            ((node as any).params as Node[])[
              ((node as any).params as Node[]).length - 1
            ].end + 1,
        };
      } else {
        return { start: node.end - 2, end: node.end };
      }
    } else if (
      node.type === "ImportDeclaration" &&
      childName === "specifiers"
    ) {
      return {
        start: node.start + this.getSource(node).indexOf("{"),
        end: node.start + this.getSource(node).indexOf("}") + 1,
      };
    } else if (node.type === "Property" && childName === "semicolon") {
      return {
        start: ((node as any).key as Node).end,
        end: ((node as any).key as Node).end + 1,
      };
    } else {
      const [directChildName, ...nestedChildName] = childName.split(".");
      if ((node as any)[directChildName]) {
        const childNode: Node | Node[] = (node as any)[directChildName];

        if (Array.isArray(childNode)) {
          const [childDirectChildName, ...childNestedChildName] =
            nestedChildName;

          if (childNestedChildName.length > 0) {
            return this.childNodeRange(
              (childNode as any)[childDirectChildName] as Node,
              childNestedChildName.join(".")
            );
          }

          if (typeof (childNode as any)[childDirectChildName] === "function") {
            const childChildNode = (
              (childNode as any)[childDirectChildName] as () => {
                start: number;
                end: number;
              }
            ).bind(childNode);
            return { start: childChildNode().start, end: childChildNode().end };
          } else if (!Number.isNaN(childDirectChildName)) {
            const childChildNode = childNode.at(
              Number.parseInt(childDirectChildName)
            ) as Node;
            if (childChildNode) {
              return { start: childChildNode.start, end: childChildNode.end };
            } else {
              // arguments.0 for func()
              return { start: node.end - 1, end: node.end - 1 };
            }
          } else {
            throw new NotSupportedError(`${childName} is not supported for ${this.getSource(node)}`);
          }
        }

        if (nestedChildName.length > 0) {
          return this.childNodeRange(childNode, nestedChildName.join("."));
        }

        if (childNode) {
          return { start: childNode.start, end: childNode.end };
        }
      }
    }

    throw new NotSupportedError(`${childName} is not supported for ${this.getSource(node)}`);
  }

  getStart(node: Node): number {
    return node.start;
  }

  getEnd(node: Node): number {
    return node.end;
  }

  getStartLoc(node: Node): { line: number; column: number } {
    const { line, column } = node.loc!.start;
    return { line, column };
  }

  getEndLoc(node: Node): { line: number; column: number } {
    const { line, column } = node.loc!.end;
    return { line, column };
  }

  getIndent(node: Node): number {
    return this.fileContent(node)
      .split("\n")
      [this.getStartLoc(node).line - 1].search(/\S|$/);
  }

  private actualValue(node: Node, multiKeys: string[]): any {
    let childNode: any = node;
    multiKeys.forEach((key) => {
      if (!childNode) return;

      if (childNode.hasOwnProperty(key)) {
        childNode = childNode[key];
      } else if (typeof childNode[key] === "function") {
        childNode = childNode[key].call(childNode);
      } else {
        throw `${key} is not supported for ${this.getSource(childNode)}`;
      }
    });
    return childNode;
  }
}

export default EspreeAdapter;
