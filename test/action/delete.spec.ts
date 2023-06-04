import dedent from "dedent";
import { Node } from "typescript";
import { DeleteAction } from "../../src/action";
import { parseCode } from "../helper";

describe("DeleteAction", () => {
  describe("no wholeLine", () => {
    const code = "this.foo.bind(this)";
    const node = parseCode(code);

    it("gets range and rewritten code", () => {
      const action = new DeleteAction<Node>(node, [
        "expression.expression.dot",
        "expression.expression.name",
        "expression.arguments",
      ], {});
      expect(action.process()).toEqual({
        type: "delete",
        start: "this.foo".length,
        end: "this.foo.bind(this)".length,
        newCode: "",
      });
    });
  });

  describe("wholeLine", () => {
    const code = dedent`
      class Synvert {
        constructor() {
        }
      }
    `;
    const node = parseCode(code);

    it("gets range and rewritten code", () => {
      const action = new DeleteAction<Node>(node, ["members.0"], { wholeLine: true });
      expect(action.process()).toEqual({
        type: "delete",
        start: "class Synvert {\n".length,
        end: code.length - 1,
        newCode: "",
      });
    });
  });
});
