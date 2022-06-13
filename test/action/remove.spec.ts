import RemoveAction from "../../src/action/remove";
import { parseCode } from "../helper";

describe("Action", () => {
  describe("RemoveAction", () => {
    describe("single line", () => {
      const code = "this.foo.bind(this);";
      const node = parseCode(code);
      let action: RemoveAction;

      beforeEach(() => {
        action = new RemoveAction(node).process();
      });

      it("gets beginPos", function () {
        expect(action.beginPos).toBe(0);
      });

      it("gets endPos", function () {
        expect(action.endPos).toBe(code.length);
      });

      it("gets rewrittenCode", function () {
        expect(action.rewrittenCode).toBe("");
      });
    });

    describe("multiple lines", () => {
      const code = `
        function foo(props) {
          this.bar = this.bar.bind(this);
        }
      `;
      const node = parseCode(code);
      let action: RemoveAction;

      beforeEach(() => {
        action = new RemoveAction((node as any).body.statements[0]).process();
      });

      it("gets beginPos", function () {
        expect(action.beginPos).toBe(code.indexOf("{") + "{\n".length);
      });

      it("gets endPos", function () {
        expect(action.endPos).toBe(code.indexOf(";") + ";\n".length);
      });

      it("gets rewrittenCode", function () {
        expect(action.rewrittenCode).toBe("");
      });
    });
  });
});
