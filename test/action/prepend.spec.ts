import { Node } from "typescript";
import { PrependAction } from "../../src/action";
import { parseCode } from "../helper";
import TypescriptAdapter from "../../src/adapter/typescript";

describe("PrependAction", () => {
  const adapter = new TypescriptAdapter();
  const code = `class FooBar {\n}`;
  const node = parseCode(code);

  describe("single line", () => {
    it("gets range and rewritten code", () => {
      const action = new PrependAction<Node>(node, "foobar() {}", { adapter });
      expect(action.process()).toEqual({
        type: "insert",
        start: "class Foobar {\n".length,
        end: "class Foobar {\n".length,
        newCode: `  foobar() {}\n`,
      });
    });
  });

  describe("multiple lines", () => {
    it("gets range and rewritten code", () => {
      const action = new PrependAction<Node>(node, "foo() {}\n\nbar() {}", { adapter });
      expect(action.process()).toEqual({
        type: "insert",
        start: "class Foobar {\n".length,
        end: "class Foobar {\n".length,
        newCode: `  foo() {}\n\n  bar() {}\n`,
      });
    });
  });
});
