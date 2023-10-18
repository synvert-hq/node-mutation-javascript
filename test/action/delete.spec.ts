import dedent from "dedent";
import { Node } from "typescript";
import { DeleteAction } from "../../src/action";
import { parseCode, parseJsxCode } from "../helper";

describe("DeleteAction", () => {
  describe("no wholeLine", () => {
    const code = "this.foo.bind(this)";
    const node = parseCode(code);

    it("gets range and rewritten code", () => {
      const action = new DeleteAction<Node>(node, [
        "expression.expression.dot",
        "expression.expression.name",
        "expression.arguments",
      ], {});
      expect(action.process()).toEqual({
        type: "delete",
        start: "this.foo".length,
        end: "this.foo.bind(this)".length,
        newCode: "",
      });
    });
  });

  describe("wholeLine", () => {
    const code = dedent`
      class Synvert {
        constructor() {
        }
      }
    `;
    const node = parseCode(code);

    it("gets range and rewritten code", () => {
      const action = new DeleteAction<Node>(node, ["members.0"], { wholeLine: true });
      expect(action.process()).toEqual({
        type: "delete",
        start: "class Synvert {\n".length,
        end: code.length - 1,
        newCode: "",
      });
    });
  });

  describe("andComma", () => {
    const code = "const foobar = { foo, bar };";
    const node = parseCode(code);

    it("gets range and rewritten code for first property", () => {
      const action = new DeleteAction<Node>(node, ["declarationList.declarations.0.initializer.properties.0"], { andComma: true });
      expect(action.process()).toEqual({
        type: "delete",
        start: "const foobar = {".length,
        end: "const foobar = { foo,".length,
        newCode: "",
      });
    });

    it("gets range and rewritten code for last property", () => {
      const action = new DeleteAction<Node>(node, ["declarationList.declarations.0.initializer.properties.-1"], { andComma: true });
      expect(action.process()).toEqual({
        type: "delete",
        start: "const foobar = { foo".length,
        end: "const foobar = { foo, bar".length,
        newCode: "",
      });
    });
  });

  describe("squeezeSpace", () => {
    const code = `<Field name="email" autoComplete="email" />`;
    const node = parseJsxCode(code);

    it("gets range and rewritten code for first property", () => {
      const action = new DeleteAction<Node>(node, ["expression.attributes.properties.0"], {});
      expect(action.process()).toEqual({
        type: "delete",
        start: "<Field".length,
        end: '<Field name="email"'.length,
        newCode: "",
      });
    });

    it("gets range and rewritten code for last property", () => {
      const action = new DeleteAction<Node>(node, ["expression.attributes.properties.-1"], {});
      expect(action.process()).toEqual({
        type: "delete",
        start: '<Field name="email"'.length,
        end: '<Field name="email" autoComplete="email"'.length,
        newCode: "",
      });
    });
  });
});
