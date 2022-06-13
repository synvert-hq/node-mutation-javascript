import AppendAction  from "../../src/action/append";
import { parseCode } from "../helper";

describe("Action", () => {
  describe("AppendAction", () => {
    const code = `class FooBar {\n}`;
    const node = parseCode(code);

    describe("single line", () => {
      let action: AppendAction;

      beforeEach(() => {
        action = new AppendAction(node, "foobar() {}").process();
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
      let action: AppendAction;

      beforeEach(() => {
        action = new AppendAction(node, "foo() {}\nbar() {}").process();
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
