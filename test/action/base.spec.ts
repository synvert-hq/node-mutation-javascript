import { Node } from "typescript";
import { BaseAction } from "../../src/action";
import { parseCode } from "../helper";
import TypescriptAdapter from "../../src/adapter/typescript";

class DummyAction<Node> extends BaseAction<Node> {
  calculatePositions(): void {
  }

  get newCode() {
    return this.rewrittenSource();
  }
};

describe("DummyAction", () => {
  const adapter = new TypescriptAdapter();

  describe("rewrittenSource", () => {
    const code = "foo.substring(1, 2)";
    const node = parseCode(code);

    it("gets rewritten source", () => {
      const action = new DummyAction<Node>(node, "{{expression.expression.expression}}.slice({{expression.arguments.0}}, {{expression.arguments.1}})", { adapter });
      expect(action.newCode).toEqual("foo.slice(1, 2)");
    });
  });
});
