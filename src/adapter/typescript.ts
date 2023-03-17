import type { TypescriptNodeExt as NodeExt, TypescriptNodeArrayExt as NodeArrayExt } from "../types/adapter";
import { PropertyAccessExpression, Node, SyntaxKind, PropertyAssignment } from "typescript";
import Adapter from "../adapter";
import { NotSupportedError } from "../error";

class TypescriptAdapter implements Adapter<Node> {
  getSource(node: Node, options?: { fixIndent: boolean }): string {
    if (options && options.fixIndent) {
      const column = this.getIndent(node);
      return node.getText().trimEnd()
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
      // typescript getText() may contain trailing whitespaces and newlines.
      return node.getText().trimEnd();
    }
  }

  rewrittenSource(node: Node, code: string): string {
    return code.replace(/{{(.+?)}}/gm, (_string, match, _offset) => {
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
        throw new NotSupportedError(`can not parse "${code}"`);
      }
    });
  }

  fileContent(node: Node): string {
    return node.getSourceFile().getFullText();
  }

  childNodeRange(node: Node, childName: string): { start: number, end: number } {
    if (["arguments", "parameters"].includes(childName)) {
      const elements = (node as any)[childName];
      return { start: this.getStart(elements[0] as Node) - 1, end: this.getEnd(elements[elements.length - 1] as Node) + 1 };
    } else if (node.kind === SyntaxKind.PropertyAssignment && childName === "semicolon") {
      return { start: this.getEnd((node as PropertyAssignment).name), end: this.getEnd((node as PropertyAssignment).name) + 1 };
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
    }

    throw new NotSupportedError(`${childName} is not supported for ${this.getSource(node)}`);
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
    return { line: line + 1, column: character };
  }

  getEndLoc(node: Node): { line: number, column: number } {
    const { line, character } = node.getSourceFile().getLineAndCharacterOfPosition(this.getEnd(node));
    return { line: line + 1, column: character };
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
        throw `${key} is not supported for ${this.getSource(childNode)}`;
      }
    });
    return childNode;
  };
}

export default TypescriptAdapter;