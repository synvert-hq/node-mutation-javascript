import { InsertAction } from "../../src/action";
import { parseCode } from "../helper";

describe("InsertAction", () => {
  const node = parseCode("this.foo");
  let action: InsertAction;

  describe("at beginning", () => {
    it("get range and rewritten code", () => {
      const action = new InsertAction(node, "::", {
        at: "beginning",
      });
      expect(action.process()).toEqual({ start: 0, end: 0, newCode: "::" });
    });
  });

  describe("at end of object", () => {
    it("get range and rewritten code", () => {
      const action = new InsertAction(node, ".bar", {
        to: "expression.expression",
        at: "end",
      });
      expect(action.process()).toEqual({ start: "this".length, end: "this".length, newCode: ".bar" });
    });
  });
});
