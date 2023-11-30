import { Node } from "typescript";
import { InsertAction } from "../../src/action";
import { parseCode, parseJsxCode } from "../helper";
import TypescriptAdapter from "../../src/adapter/typescript";

describe("InsertAction", () => {
  const adapter = new TypescriptAdapter();
  const node = parseCode("this.foo");

  describe("at beginning", () => {
    it("get range and rewritten code", () => {
      const action = new InsertAction<Node>(node, "::", {
        at: "beginning",
        adapter,
      });
      expect(action.process()).toEqual({ type: "insert", start: 0, end: 0, newCode: "::" });
    });
  });

  describe("at end of object", () => {
    it("get range and rewritten code", () => {
      const action = new InsertAction<Node>(node, ".bar", {
        to: "expression.expression",
        adapter,
      });
      expect(action.process()).toEqual({ type: "insert", start: "this".length, end: "this".length, newCode: ".bar" });
    });
  });

  describe("andComma", () => {
    const code = `const foobar = { foo }`;
    const node = parseCode(code);

    describe("at beginning", () => {
      it("gets range and rewritten code", () => {
        const action = new InsertAction<Node>(node, "bar", {
          at: "beginning",
          to: "declarationList.declarations.0.initializer.properties.0",
          andComma: true,
          adapter,
        });
        expect(action.process()).toEqual({
          type: "insert",
          start: "const foobar = { ".length,
          end: "const foobar = { ".length,
          newCode: "bar, ",
        });
      });
    });

    describe("at end", () => {
      it("gets range and rewritten code", () => {
        const action = new InsertAction<Node>(node, "bar", {
          at: "end",
          to: "declarationList.declarations.0.initializer.properties.0",
          andComma: true,
          adapter,
        });
        expect(action.process()).toEqual({
          type: "insert",
          start: "const foobar = { foo".length,
          end: "const foobar = { foo".length,
          newCode: ", bar",
        });
      });
    });
  });

  describe("andSpace", () => {
    const code = `<Field name="email" />`;
    const node = parseJsxCode(code);

    describe("at beginning", () => {
      it("gets range and rewritten code", () => {
        const action = new InsertAction<Node>(node, 'autoComplete="email"', {
          at: "beginning",
          to: "expression.attributes.properties.0",
          andSpace: true,
          adapter,
        });
        expect(action.process()).toEqual({
          type: "insert",
          start: "<Field ".length,
          end: "<Field ".length,
          newCode: 'autoComplete="email" ',
        });
      });
    });

    describe("at end", () => {
      it("gets range and rewritten code", () => {
        const action = new InsertAction<Node>(node, 'autoComplete="email"', {
          at: "end",
          to: "expression.attributes.properties.0",
          andSpace: true,
          adapter,
        });
        expect(action.process()).toEqual({
          type: "insert",
          start: '<Field name="email"'.length,
          end: '<Field name="email"'.length,
          newCode: ' autoComplete="email"',
        });
      });
    });
  });
});
