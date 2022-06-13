import ReplaceWithAction from "../../src/action/replace-with";
import { parseCode } from "../helper";

describe("Action", () => {
  describe("ReplaceWithAction", () => {
    const node = parseCode("!!foobar");
    let action: ReplaceWithAction;

    beforeEach(() => {
      action = new ReplaceWithAction(
        node,
        "Boolean({{expression.operand.operand}})"
      ).process();
    });

    it("gets beginPos", function () {
      expect(action.beginPos).toBe(0);
    });

    it("gets endPos", function () {
      expect(action.endPos).toBe(8);
    });

    it("gets rewrittenCode", function () {
      expect(action.rewrittenCode).toBe("Boolean(foobar)");
    });
  });
});
