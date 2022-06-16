import { AppendAction } from "../../src/action";
import { parseCode } from "../helper";

describe("AppendAction", () => {
  const code = `class FooBar {\n}`;
  const node = parseCode(code);

  describe("single line", () => {
    it("gets range and rewritten code", () => {
      const action = new AppendAction(node, "foobar() {}");
      expect(action.process()).toEqual({
        start: "class FooBar {\n".length,
        end: "class FooBar {\n".length,
        newCode: `  foobar() {}\n`,
      });
    });
  });

  describe("multiple lines", () => {
    it("gets range and rewritten code", () => {
      const action = new AppendAction(node, "foo() {}\nbar() {}");
      expect(action.process()).toEqual({
        start: "class FooBar {\n".length,
        end: "class FooBar {\n".length,
        newCode: `  foo() {}\n  bar() {}\n`,
      });
    });
  });
});
