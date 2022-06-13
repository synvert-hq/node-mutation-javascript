import PrependAction from "../../src/action/prepend";
import { parseCode } from "../helper";

describe("Action", () => {
  describe("PrependAction", () => {
    const code = `class FooBar {\n}`;
    const node = parseCode(code);

    describe("single line", () => {
      let action: PrependAction;

      beforeEach(() => {
        action = new PrependAction(node, "foobar() {}").process();
      });

      it("gets beginPos", function () {
        expect(action.beginPos).toBe(15);
      });

      it("gets endPos", function () {
        expect(action.endPos).toBe(15);
      });

      it("gets rewrittenCode", function () {
        expect(action.rewrittenCode).toBe(`  foobar() {}\n`);
      });
    });

    describe("multiple lines", () => {
      let action: PrependAction;

      beforeEach(() => {
        action = new PrependAction(node, "foo() {}\nbar() {}").process();
      });

      it("gets beginPos", function () {
        expect(action.beginPos).toBe(15);
      });

      it("gets endPos", function () {
        expect(action.endPos).toBe(15);
      });

      it("gets rewrittenCode", function () {
        expect(action.rewrittenCode).toBe(`  foo() {}\n  bar() {}\n`);
      });
    });
  });
});
