import { Node } from "acorn";
import fs from "fs";
import Adapter from "../adapter";
import { NotSupportedError } from "../error";

/**
 * Espree Adapter
 * @extends Adapter
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
   * Get the source code of current file.
   * @returns {string} source code of current file.
   */
  fileContent(node: Node): string {
    return fs.readFileSync(node.loc!.source!, "utf-8");
  }

  /**
   * Get the source range of child node.
   * @param {Node} node - The node.
   * @param {string} childName - The name to find child node.
   * @returns {Object} The range of the child node, e.g. { start: 0, end: 10 }
   * @throws {NotSupportedError} if we can't get the range.
   * @example
   * const node = espree.parse("function foobar(foo, bar) {}")
   * childNodeRange(node, "id") // { start: "function ".length, end: "function foobar".length }
   *
   * // node array
   * const node = espree.parse("function foobar(foo, bar) {}")
   * childNodeRange(node, "params") // { start: "function foobar".length, end: "function foobar(foo, bar)".length }
   *
   * // index for node array
   * const node = espree.parse("function foobar(foo, bar) {}")
   * childNodeRange(node, "params.1") // { start: "function foobar(foo, ".length, end: "function foobar(foo, bar".length }
   *
   * // async for MethodDefinition node
   * const node = espree.parse("async foobar() {}")
   * childNodeRange(node, "async") // { start: 0, end: "async".length }
   *
   * // dot for MemberExpression node
   * const node = espree.parse("foo.bar")
   * childNodeRange(node, "dot") // { start: "foo".length, end: "foo.".length }
   *
   * // class for ClassDeclaration node
   * const node = espree.parse("class FooBar {}")
   * childNodeRange(node, "class") // { start: 0, end: "class".length }
   *
   * // semicolon for Property node
   * const node = espree.parse("{ foo: bar }");
   * childNodeRange(node, "semicolon") // { start: "{ foo", end: "{ foo:".length }
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
          start: ((node as any).arguments as Node[])[0].start - 1,
          end:
            ((node as any).arguments as Node[])[
              ((node as any).arguments as Node[]).length - 1
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

  /**
   * Get the value of child node.
   * @param {Node} node - The node to evaluate.
   * @param {string} childName - The name to find child node.
   * @returns {any} The value of child node, it can be a node, an array, a string or a number.
   * @example
   * const node = espree.parse("foobar(foo, bar)")
   * childNodeValue(node, "expression.arguments.0") // node["expression"]["arguments"][0]
   *
   * // node array
   * const node = espree.parse("foobar(foo, bar)")
   * childNodeValue(node, "expression.arguments") // node["expression"]["arguments"]
   *
   * // {name}_property for node who has properties
   * const node = espree.parse('const foobar = { foo: "foo", bar: "bar" }')
   * childNodeValue(node, "declarations.0.init.foo_property") // node["declarations"][0]["init"]["properties"][0]
   *
   * // {name}_initializer for node who has properties
   * const node = espree.parse('const foobar = { foo: "foo", bar: "bar" }')
   * childNodeValue(node, 'declarations.0.init.foo_initializer')) // node["declarations"][0]["init"]["properties"][0]["value"]
   */
  childNodeValue(node: Node, childName: string): any {
    return this.actualValue(node, childName.split("."));
  }

  getStart(node: Node, childName?: string): number {
    if (childName) {
      node = this.childNodeValue(node, childName);
    }
    return node.start;
  }

  getEnd(node: Node, childName?: string): number {
    if (childName) {
      node = this.childNodeValue(node, childName);
    }
    return node.end;
  }

  getStartLoc(node: Node, childName?: string): { line: number; column: number } {
    if (childName) {
      node = this.childNodeValue(node, childName);
    }
    const { line, column } = node.loc!.start;
    return { line, column };
  }

  getEndLoc(node: Node, childName?: string): { line: number; column: number } {
    if (childName) {
      node = this.childNodeValue(node, childName);
    }
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
      } else if (Array.isArray(childNode) && /-?\d+/.test(key)) {
        childNode = childNode.at(Number.parseInt(key));
      } else if (childNode.hasOwnProperty("properties") && key.endsWith("_property")) {
        const property = (childNode.properties as Node[]).find(property => this.getSource((property as any).key) == key.slice(0, -"_property".length))
        childNode = property;
      } else if (childNode.hasOwnProperty("properties") && key.endsWith("_value")) {
        const property = (childNode.properties as Node[]).find(property => this.getSource((property as any).key) == key.slice(0, -"_value".length))
        childNode = (property as any)["value"];
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
