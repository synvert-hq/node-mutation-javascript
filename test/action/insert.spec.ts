import InsertAction from "../../src/action/insert";
import { parseCode } from "../helper";

describe("Action", () => {
  describe("InsertAction", () => {
    const node = parseCode("this.foo");
    let action: InsertAction;

    describe("at beginning", () => {
      beforeEach(() => {
        action = new InsertAction(node, "::", {
          at: "beginning",
        }).process();
      });

      it("gets beginPos", function () {
        expect(action.beginPos).toBe(0);
      });

      it("gets endPos", function () {
        expect(action.endPos).toBe(0);
      });

      it("gets rewrittenCode", function () {
        expect(action.rewrittenCode).toBe("::");
      });
    });

    describe("at end of object", () => {
      beforeEach(() => {
        action = new InsertAction(node, ".bar", {
          to: "expression.expression",
          at: "end",
        }).process();
      });

      it("gets beginPos", function () {
        expect(action.beginPos).toBe("this".length);
      });

      it("gets endPos", function () {
        expect(action.beginPos).toBe("this".length);
      });

      it("gets rewrittenCode", function () {
        expect(action.rewrittenCode).toBe(".bar");
      });
    });
  });
});
