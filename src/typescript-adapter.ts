import type { NodeExt, NodeArrayExt } from "./types";
import { PropertyAccessExpression, Node, SyntaxKind } from "typescript";
import Adapter from "./adapter";
import { NotSupportedError } from "./error";

class TypescriptAdapter implements Adapter<Node> {
  getSource(node: Node): string {
    return node.getFullText().trim();
  }

  rewrittenSource(node: Node, code: string): string {
    return code.replace(/{{([a-zA-z0-9\.]+?)}}/gm, (_string, match, _offset) => {
      if (!match) return null;

      const obj = this.actualValue(node, match.split("."));
      if (obj) {
        if (Array.isArray(obj)) {
          return this.fileContent(node).slice(obj[0].start, obj[obj.length - 1].end);
        }
        const result = obj.hasOwnProperty("name") ? obj.name : obj;
        if (result.hasOwnProperty("kind")) {
          return this.getSource(result);
        } else {
          return result;
        }
      } else {
        return code;
      }
    });
  }

  fileContent(node: Node): string {
    return node.getSourceFile().getFullText();
  }

  childNodeRange(node: Node, childName: string): { start: number, end: number } {
    if (["arguments", "parameters"].includes(childName)) {
      return { start: ((node as any)[childName][0] as Node).getStart() - 1, end: ((node as any)[childName][0] as Node).getEnd() + 1 };
    } else if (node.kind === SyntaxKind.PropertyAccessExpression && childName === "dot") {
      return { start: (node as PropertyAccessExpression).name.getStart() - 1, end: (node as PropertyAccessExpression).name.getStart() };
    } else {
      const [directChildName, ...nestedChildName] = childName.split(".");
      if ((node as any)[directChildName]) {
        const childNode: NodeExt | NodeArrayExt = (node as any)[directChildName];

        if (Array.isArray(childNode)) {
          const [childDirectChildName, ...childNestedChildName] = nestedChildName;

          if (childNestedChildName.length > 0) {
            return this.childNodeRange(childNode[childDirectChildName] as NodeExt, childNestedChildName.join("."));
          }

          if (typeof childNode[childDirectChildName] === "function") {
            const childChildNode = (childNode[childDirectChildName] as () => NodeExt)();
            return { start: childChildNode.getStart(), end: childChildNode.getEnd() };
          } else if (!Number.isNaN(childDirectChildName)) {
            const childChildNode = childNode.at(
              Number.parseInt(childDirectChildName)
            ) as NodeExt;
            if (childChildNode) {
              return { start: childChildNode.getStart(), end: childChildNode.getEnd() };
            } else {
              return { start: node.getEnd() - 1, end: node.getEnd() - 1 };
            }
          } else {
            throw new NotSupportedError(
              `childNodeRange is not handled for ${this.getSource(node)}, child name: ${childName}`
            );
          }
        }

        if (nestedChildName.length > 0) {
          return this.childNodeRange(childNode, nestedChildName.join("."));
        }

        if (childNode) {
          return { start: childNode.getStart(), end: childNode.getEnd() };
        }
      }
    }

    throw new NotSupportedError(
      `childNodeRange is not handled for ${this.getSource(node)}, child name: ${childName}`
    );
  }

  getStart(node: Node): number {
    return node.getStart();
  }

  getEnd(node: Node): number {
    return node.getEnd();
  }

  getStartLoc(node: Node): { line: number, column: number } {
    const { line, character } = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
    return { line: line + 1, column: character + 1 };
  }

  getEndLoc(node: Node): { line: number, column: number } {
    const { line, character } = node.getSourceFile().getLineAndCharacterOfPosition(node.getEnd());
    return { line: line + 1, column: character + 1 };
  }

  getIndent(node: Node): number {
    return this.fileContent(node).split("\n")[this.getStartLoc(node).line - 1].search(/\S|$/);
  }

  private actualValue(node: Node, multiKeys: string[]): any {
    let childNode: any = node;
    multiKeys.forEach((key) => {
      if (!childNode) return;

      const child: any = childNode;
      if (childNode.hasOwnProperty(key)) {
        childNode = child[key];
      } else if (typeof child[key] === "function") {
        childNode = child[key].call(childNode);
      } else {
        childNode = null;
      }
    });
    return childNode;
  };
}

module.exports = TypescriptAdapter;
export default TypescriptAdapter;