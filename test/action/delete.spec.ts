import { Node } from "typescript";
import { DeleteAction } from "../../src/action";
import { parseCode } from "../helper";

describe("DeleteAction", () => {
  const code = "this.foo.bind(this)";
  const node = parseCode(code);

  it("gets range and rewritten code", () => {
    const action = new DeleteAction<Node>(node, [
      "expression.expression.dot",
      "expression.expression.name",
      "expression.arguments",
    ]);
    expect(action.process()).toEqual({
      start: "this.foo".length,
      end: "this.foo.bind(this)".length,
      newCode: "",
    });
  });
});
