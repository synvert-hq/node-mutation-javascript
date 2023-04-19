import { Node } from "typescript";
import { PrependAction } from "../../src/action";
import { parseCode } from "../helper";

describe("PrependAction", () => {
  const code = `class FooBar {\n}`;
  const node = parseCode(code);

  describe("single line", () => {
    it("gets range and rewritten code", () => {
      const action = new PrependAction<Node>(node, "foobar() {}");
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
      const action = new PrependAction<Node>(node, "foo() {}\nbar() {}");
      expect(action.process()).toEqual({
        type: "insert",
        start: "class Foobar {\n".length,
        end: "class Foobar {\n".length,
        newCode: `  foo() {}\n  bar() {}\n`,
      });
    });
  });
});
