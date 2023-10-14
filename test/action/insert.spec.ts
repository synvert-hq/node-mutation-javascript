import { Node } from "typescript";
import { InsertAction } from "../../src/action";
import { parseCode } from "../helper";

describe("InsertAction", () => {
  const node = parseCode("this.foo");

  describe("at beginning", () => {
    it("get range and rewritten code", () => {
      const action = new InsertAction<Node>(node, "::", {
        at: "beginning",
      });
      expect(action.process()).toEqual({ type: "insert", start: 0, end: 0, newCode: "::" });
    });
  });

  describe("at end of object", () => {
    it("get range and rewritten code", () => {
      const action = new InsertAction<Node>(node, ".bar", {
        to: "expression.expression"
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
});
