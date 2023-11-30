import { Node } from "typescript";
import { AppendAction } from "../../src/action";
import { parseCode } from "../helper";
import TypescriptAdapter from "../../src/adapter/typescript";

describe("AppendAction", () => {
  const adapter = new TypescriptAdapter();
  const code = `class FooBar {\n}`;
  const node = parseCode(code);

  describe("single line", () => {
    it("gets range and rewritten code", () => {
      const action = new AppendAction<Node>(node, "foobar() {}", { adapter });
      expect(action.process()).toEqual({
        type: "insert",
        start: "class FooBar {\n".length,
        end: "class FooBar {\n".length,
        newCode: `  foobar() {}\n`,
      });
    });
  });

  describe("multiple lines", () => {
    it("gets range and rewritten code", () => {
      const action = new AppendAction<Node>(node, "foo() {}\nbar() {}", { adapter });
      expect(action.process()).toEqual({
        type: "insert",
        start: "class FooBar {\n".length,
        end: "class FooBar {\n".length,
        newCode: `  foo() {}\n  bar() {}\n`,
      });
    });
  });
});
