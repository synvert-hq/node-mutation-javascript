import { Node } from "typescript";
import { BaseAction } from "../../src/action";
import { parseCode } from "../helper";

class DummyAction<Node> extends BaseAction<Node> {
  calculatePositions(): void {
  }

  get newCode() {
    return this.rewrittenSource();
  }
};

describe("DummyAction", () => {
  describe("rewrittenSource", () => {
    const code = "foo.substring(1, 2)";
    const node = parseCode(code);

    it("gets rewritten source", () => {
      const action = new DummyAction<Node>(node, "{{expression.expression.expression}}.slice({{expression.arguments.0}}, {{expression.arguments.1}})");
      expect(action.newCode).toEqual("foo.slice(1, 2)");
    });
  });
});
