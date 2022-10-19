import { NotSupportedError } from "../src/error";
import TypescriptAdapter from "../src/typescript-adapter";
import { parseCode } from "./helper";

describe("TypescriptAdapter", () => {
  const adapter = new TypescriptAdapter();

  describe("rewrittenSource", () => {
    it("rewrites with node known method", () => {
      const code = "class Synvert {}";
      const node = parseCode(code);
      expect(adapter.rewrittenSource(node, "{{name}}")).toEqual("Synvert");
    });

    it("rewrites for arguments", () => {
      const code = "foobar(foo, bar)";
      const node = parseCode(code);
      expect(adapter.rewrittenSource(node, "{{expression.arguments}}")).toEqual("foo, bar");
    });

    it("throws an error for unknown property", () => {
      const code = "class Synvert {}";
      const node = parseCode(code);
      expect(() => {
        adapter.rewrittenSource(node, "{{foobar}}");
      }).toThrow(new NotSupportedError('can not parse "{{foobar}}"'));
    });
  });

  describe("getStart", () => {
    it("gets start count", () => {
      const node = parseCode("class Synvert {\n}");
      expect(adapter.getStart(node)).toEqual(0);
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

  describe("#childNodeRange", () => {
    test("FunctionDeclaration parameters", () => {
      const node = parseCode("function foobar(foo, bar) {}");
      expect(adapter.childNodeRange(node, "parameters")).toEqual({ start: 15, end: 25 });
    });

    test("MethodDeclaration parameters", () => {
      const node = parseCode("class Foobar { foobar(foo, bar) {} }");
      expect(adapter.childNodeRange(node, "members.0.parameters")).toEqual({ start: 21, end: 31 });
    });

    test("CallExpression arguments", () => {
      const node = parseCode("foobar(foo, bar)");
      expect(adapter.childNodeRange(node, "expression.arguments")).toEqual({ start: 6, end: 16 });
    });

    test("PropertyAssignment semicolon", () => {
      const node = parseCode("const obj = { foo: bar }");
      expect(adapter.childNodeRange(node, "declarationList.declarations.0.initializer.properties.0.semicolon")).toEqual({ start: 17, end: 18 });
    });

    test("PropertyAccessExpression dot", () => {
      const node = parseCode("foo.bar");
      expect(adapter.childNodeRange(node, "expression.dot")).toEqual({ start: 3, end: 4 });
    });

    test("CallExpression unknown", () => {
      const node = parseCode("foobar(foo, bar)");
      expect(() => {
        adapter.childNodeRange(node, "expression.unknown");
      }).toThrow(new NotSupportedError("unknown is not supported for foobar(foo, bar)"));
    });
  });
});