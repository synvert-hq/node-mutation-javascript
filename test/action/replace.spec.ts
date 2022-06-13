import ReplaceAction from "../../src/action/replace";
import { parseCode } from "../helper";

describe("Action", () => {
  describe("ReplaceAction", () => {
    const node = parseCode("class FooBar {}");
    let action: ReplaceAction;

    beforeEach(() => {
      action = new ReplaceAction(node, "name", { with: "Synvert" }).process();
    });

    it("gets beginPos", function () {
      expect(action.beginPos).toBe(6);
    });

    it("gets endPos", function () {
      expect(action.endPos).toBe(12);
    });

    it("gets rewrittenCode", function () {
      expect(action.rewrittenCode).toBe("Synvert");
    });
  });
});
