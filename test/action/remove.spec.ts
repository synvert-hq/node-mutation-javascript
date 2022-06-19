import { Node } from "typescript";
import { RemoveAction } from "../../src/action";
import { parseCode } from "../helper";

describe("RemoveAction", () => {
  describe("single line", () => {
    const code = "this.foo.bind(this);";
    const node = parseCode(code);

    it("gets range and rewritten code", () => {
      const action = new RemoveAction(<Node>node);
      expect(action.process()).toEqual({ start: 0, end: code.length, newCode: "" });
    });
  });

  describe("multiple lines", () => {
    const code = `
      function foo(props) {
        this.bar = this.bar.bind(this);
      }
    `;
    const node = parseCode(code);

    it("gets range and rewritten code", () => {
      const action = new RemoveAction(<Node>(node as any).body.statements[0]);
      expect(action.process()).toEqual({
        start: code.indexOf("{") + "{\n".length,
        end: code.indexOf(";") + ";\n".length,
        newCode: "",
      });
    });
  });
});
