import DeleteAction  from "../../src/action/delete";
import { parseCode } from "../helper";

describe("Action", () => {
  describe("DeleteAction", () => {
    const code = "this.foo.bind(this)";
    const node = parseCode(code);
    let action: DeleteAction;

    beforeEach(() => {
      action = new DeleteAction(node, [
        "expression.expression.dot",
        "expression.expression.name",
        "expression.arguments",
      ]).process();
    });

    it("gets beginPos", function () {
      expect(action.beginPos).toBe(8);
    });

    it("gets endPos", function () {
      expect(action.endPos).toBe(19);
    });

    it("gets rewrittenCode", function () {
      expect(action.rewrittenCode).toBe("");
    });
  });
});
