import { PropertyAccessExpression, Node, SyntaxKind, PropertyAssignment } from "typescript";
import Adapter from "../adapter";
import { NotSupportedError } from "../error";

/**
 * Typescript Adapter
 * @extends Adapter
 */
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

  fileContent(node: Node): string {
    return node.getSourceFile().getFullText();
  }

  /**
   * Get the source range of child node.
   * @param {Node} node - The node.
   * @param {string} childName - The name to find child node.
   * @returns {Object} The range of the child node, e.g. { start: 0, end: 10 }
   * @throws {NotSupportedError} if we can't get the range.
   * @example
   * const node = ts.createSourceFile("code.ts", "function foobar(foo, bar) {}")
   * childNodeRange(node, "name") // { start: "function ".length, end: "function foobar".length }
   *
   * // node array
   * const node = ts.createSourceFile("code.ts", "function foobar(foo, bar) {}")
   * childNodeRange(node, "parameters") // { start: "function foobar".length, end: "function foobar(foo, bar)".length }
   *
   * // index for node array
   * const node = ts.createSourceFile("code.ts", "function foobar(foo, bar) {}")
   * childNodeRange(node, "parameters.1") // { start: "function foobar(foo, ".length, end: "function foobar(foo, bar".length }
   *
   * // semicolon for PropertyAssignment node
   * const node = ts.createSourceFile("code.ts", "{ foo: bar }");
   * childNodeRange(node, "semicolon") // { start: "{ foo", end: "{ foo:".length }
   *
   * // dot for PropertyAccessExpression node
   * const node = ts.createSourceFile("code.ts", "foo.bar")
   * childNodeRange(node, "dot") // { start: "foo".length, end: "foo.".length }
   */
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
        const childNode: Node | Node[] = (node as any)[directChildName];

        if (Array.isArray(childNode)) {
          const [childDirectChildName, ...childNestedChildName] = nestedChildName;

          if (childNestedChildName.length > 0) {
            return this.childNodeRange((childNode as any)[childDirectChildName] as Node, childNestedChildName.join("."));
          }

          if (typeof (childNode as any)[childDirectChildName] === "function") {
            const childChildNode = ((childNode as any)[childDirectChildName] as () => Node)();
            return { start: this.getStart(childChildNode), end: this.getEnd(childChildNode) };
          } else if (!Number.isNaN(childDirectChildName)) {
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
    }

    throw new NotSupportedError(`${childName} is not supported for ${this.getSource(node)}`);
  }

  /**
   * Get the value of child node.
   * @param {Node} node - The node to evaluate.
   * @param {string} childName - The name to find child node.
   * @returns {any} The value of child node, it can be a node, an array, a string or a number.
   * @example
   * const node = ts.createSourceFile("code.ts", "foobar(foo, bar)")
   * childNodeValue(node, "expression.arguments.0") // node["expression"]["arguments"][0]
   *
   * // node array
   * const node = ts.createSourceFile("code.ts", 'foobar("foo", "bar")')
   * childNodeValue(node, "expression.arguments") // node["expression"]["arguments"]
   *
   * // {name}Property for node who has properties
   * const node = ts.createSourceFile("code.ts", "const foobar = { foo: 'foo', bar: 'bar' }")
   * childNodeValue(node, 'declarationList.declarations.0.initializer.fooProperty')) // node["declarationList"]["declarations"][0]["initializer"]["properties"][0]
   *
   * // {name}Initializer for node who has properties
   * const node = ts.createSourceFile("code.ts", "const foobar = { foo: 'foo', bar: 'bar' }")
   * childNodeValue(node, 'declarationList.declarations.0.initializer.fooInitializer')) // node["declarationList"]["declarations"][0]["initializer"]["properties"][0]["initalizer"]
   */
  childNodeValue(node: Node, childName: string): any {
    return this.actualValue(node, childName.split("."));
  }

  getStart(node: Node, childName?: string): number {
    if (childName) {
      node = this.childNodeValue(node, childName);
    }
    return node.getStart();
  }

  getEnd(node: Node, childName?: string): number {
    if (childName) {
      node = this.childNodeValue(node, childName);
    }
    // typescript getText() may contain trailing whitespaces and newlines.
    const trailingLength = node.getText().length - node.getText().trimEnd().length;
    return node.getEnd() - trailingLength;
  }

  getStartLoc(node: Node, childName?: string): { line: number, column: number } {
    if (childName) {
      node = this.childNodeValue(node, childName);
    }
    const { line, character } = node.getSourceFile().getLineAndCharacterOfPosition(this.getStart(node));
    return { line: line + 1, column: character };
  }

  getEndLoc(node: Node, childName?: string): { line: number, column: number } {
    if (childName) {
      node = this.childNodeValue(node, childName);
    }
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
      } else if (Array.isArray(childNode) && /-?\d+/.test(key)) {
        childNode = childNode.at(Number.parseInt(key));
      } else if (childNode.hasOwnProperty("properties") && key.endsWith("Property")) {
        const property = (childNode.properties as PropertyAssignment[]).find(property => this.getSource(property.name) == key.slice(0, -"Property".length))
        childNode = property;
      } else if (childNode.hasOwnProperty("properties") && key.endsWith("Initializer")) {
        const property = (childNode.properties as PropertyAssignment[]).find(property => this.getSource(property.name) == key.slice(0, -"Initializer".length))
        childNode = property?.initializer;
      } else if (typeof childNode[key] === "function") {
        childNode = childNode[key].call(childNode);
      } else {
        throw `${key} is not supported for ${this.getSource(childNode)}`;
      }
    });
    return childNode;
  };
}

export default TypescriptAdapter;