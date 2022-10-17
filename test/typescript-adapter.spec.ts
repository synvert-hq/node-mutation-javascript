import TypescriptAdapter from "../src/typescript-adapter";
import { parseCode } from "./helper";

describe("TypescriptAdapter", () => {
  const adapter = new TypescriptAdapter();

  describe("getStart", () => {
    it("gets start count", () => {
      const node = parseCode("class Synvert {\n}");
      expect(adapter.getStart(node)).toEqual(0)
    });
  });

  describe("getEnd", () => {
    it("gets end count", () => {
      const code = "class Synvert {\n}";
      const node = parseCode(code);
      expect(adapter.getEnd(node)).toEqual(code.length);
    });
  });

  describe("getStartLoc", () => {
    test("gets start location", () => {
      const node = parseCode("class Synvert {\n}");
      const startLoc = adapter.getStartLoc(node);
      expect(startLoc.line).toEqual(1);
      expect(startLoc.column).toEqual(0);
    });
  });

  describe("getEndLoc", () => {
    test("gets end location", () => {
      const node = parseCode("class Synvert {\n}");
      const startLoc = adapter.getEndLoc(node);
      expect(startLoc.line).toEqual(2);
      expect(startLoc.column).toEqual(1);
    });
  });
});