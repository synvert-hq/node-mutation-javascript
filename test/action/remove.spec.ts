import dedent from "dedent";
import { Node } from "typescript";
import { RemoveAction } from "../../src/action";
import { parseCode } from "../helper";

describe("RemoveAction", () => {
  describe("single line", () => {
    const code = "this.foo.bind(this);";
    const node = parseCode(code);

    it("gets range and rewritten code", () => {
      const action = new RemoveAction<Node>(node);
      expect(action.process()).toEqual({ type: "delete", start: 0, end: code.length, newCode: "" });
    });
  });

  describe("multiple lines", () => {
    const code = dedent`
      function foo(props) {
        this.bar = this.bar.bind(this);
      }
    `;
    const node = parseCode(code);

    it("gets range and rewritten code", () => {
      const action = new RemoveAction<Node>((node as any).body.statements[0]);
      expect(action.process()).toEqual({
        type: "delete",
        start: code.indexOf("{") + "{\n".length,
        end: code.indexOf(";") + ";\n".length,
        newCode: "",
      });
    });
  });

  describe("andComma", () => {
    const code = dedent`
      const foobar = {
        foo,
        bar,
      }
    `
    const node = parseCode(code);

    it("gets range and rewritten code for first property", () => {
      const action = new RemoveAction<Node>((node as any).declarationList.declarations[0].initializer.properties[0], { andComma: true });
      expect(action.process()).toEqual({
        type: "delete",
        start: code.indexOf("{") + "{\n".length,
        end: code.indexOf(",") + ",\n".length,
        newCode: "",
      });
    });

    it("gets range and rewritten code for last property", () => {
      const action = new RemoveAction<Node>((node as any).declarationList.declarations[0].initializer.properties[1], { andComma: true });
      expect(action.process()).toEqual({
        type: "delete",
        start: code.indexOf(",") + ",\n".length,
        end: code.lastIndexOf(",") + ",\n".length,
        newCode: "",
      });
    });
  });
});
