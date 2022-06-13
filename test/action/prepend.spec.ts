import PrependAction from "../../src/action/prepend";
import { parseCode } from "../helper";

describe("PrependAction", () => {
  const code = `class FooBar {\n}`;
  const node = parseCode(code);

  describe("single line", () => {
    it("gets range and rewritten code", () => {
      const action = new PrependAction(node, "foobar() {}");
      expect(action.process()).toEqual({
        start: "class Foobar {\n".length,
        end: "class Foobar {\n".length,
        rewrittenCode: `  foobar() {}\n`,
      });
    });
  });

  describe("multiple lines", () => {
    it("gets range and rewritten code", () => {
      const action = new PrependAction(node, "foo() {}\nbar() {}");
      expect(action.process()).toEqual({
        start: "class Foobar {\n".length,
        end: "class Foobar {\n".length,
        rewrittenCode: `  foo() {}\n  bar() {}\n`,
      });
    });
  });
});
