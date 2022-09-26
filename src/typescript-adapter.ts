import type { NodeExt, NodeArrayExt } from "./types";
import { PropertyAccessExpression, Node, SyntaxKind } from "typescript";
import Adapter from "./adapter";
import { NotSupportedError } from "./error";

class TypescriptAdapter implements Adapter<Node> {
  getSource(node: Node): string {
    // typescript getText() may contain trailing whitespaces and newlines.
    return node.getText().trimEnd();
  }

  rewrittenSource(node: Node, code: string): string {
    return code.replace(/{{(.+?)}}/gm, (string, match, _offset) => {
      if (!match) return null;

      const obj = this.actualValue(node, match.split("."));
      if (obj) {
        if (Array.isArray(obj)) {
          return this.fileContent(node).slice(this.getStart(obj[0]), this.getEnd(obj[obj.length - 1]));
        }
        if (obj.hasOwnProperty("kind")) {
          return this.getSource(obj);
        } else {
          return obj;
        }
      } else {
        return string;
      }
    });
  }

  fileContent(node: Node): string {
    return node.getSourceFile().getFullText();
  }

  childNodeRange(node: Node, childName: string): { start: number, end: number } {
    if (["arguments", "parameters"].includes(childName)) {
      return { start: this.getStart((node as any)[childName][0] as Node) - 1, end: this.getEnd((node as any)[childName][0] as Node) + 1 };
    } else if (node.kind === SyntaxKind.PropertyAccessExpression && childName === "dot") {
      return { start: this.getStart((node as PropertyAccessExpression).name) - 1, end: this.getStart((node as PropertyAccessExpression).name) };
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
            return { start: this.getStart(childChildNode), end: this.getEnd(childChildNode) };
          } else if (!Number.isNaN(childDirectChildName)) {
            const childChildNode = childNode.at(
              Number.parseInt(childDirectChildName)
            ) as NodeExt;
            if (childChildNode) {
              return { start: this.getStart(childChildNode), end: this.getEnd(childChildNode) };
            } else {
              return { start: this.getEnd(node) - 1, end: this.getEnd(node) - 1 };
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
          return { start: this.getStart(childNode), end: this.getEnd(childNode) };
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
    // typescript getText() may contain trailing whitespaces and newlines.
    const trailingLength = node.getText().length - node.getText().trimEnd().length;
    return node.getEnd() - trailingLength;
  }

  getStartLoc(node: Node): { line: number, column: number } {
    const { line, character } = node.getSourceFile().getLineAndCharacterOfPosition(this.getStart(node));
    return { line: line + 1, column: character + 1 };
  }

  getEndLoc(node: Node): { line: number, column: number } {
    const { line, character } = node.getSourceFile().getLineAndCharacterOfPosition(this.getEnd(node));
    return { line: line + 1, column: character + 1 };
  }

  getIndent(node: Node): number {
    return this.fileContent(node).split("\n")[this.getStartLoc(node).line - 1].search(/\S|$/);
  }

  private actualValue(node: Node, multiKeys: string[]): any {
    let childNode: any = node;
    multiKeys.forEach((key) => {
      if (!childNode) return;

      if (childNode.hasOwnProperty(key)) {
        childNode = childNode[key];
      } else if (typeof childNode[key] === "function") {
        childNode = childNode[key].call(childNode);
      } else if (key.includes("(") && key.includes(")")) {
        childNode = eval(`childNode.${key}`);
      } else {
        childNode = null;
      }
    });
    return childNode;
  };
}

export default TypescriptAdapter;