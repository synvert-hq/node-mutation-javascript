import { Node } from "typescript";
import { InsertAction } from "../../src/action";
import { parseCode } from "../helper";

describe("InsertAction", () => {
  const node = parseCode("this.foo");

  describe("at beginning", () => {
    it("get range and rewritten code", () => {
      const action = new InsertAction<Node>(node, "::", {
        at: "beginning",
      });
      expect(action.process()).toEqual({ type: "insert", start: 0, end: 0, newCode: "::" });
    });
  });

  describe("at end of object", () => {
    it("get range and rewritten code", () => {
      const action = new InsertAction<Node>(node, ".bar", {
        to: "expression.expression"
      });
      expect(action.process()).toEqual({ type: "insert", start: "this".length, end: "this".length, newCode: ".bar" });
    });
  });
});
