import dedent from "dedent";
import { NotSupportedError } from "../src/error";
import EspreeAdapter from "../src/espree-adapter";
import { parseCodeByEspree } from "./helper";
import mock from "mock-fs";

describe("EspreeAdapter", () => {
  const adapter = new EspreeAdapter();

  afterEach(() => {
    mock.restore();
  });

  describe("getSource", () => {
    it('gets one line code', () => {
      const code = `const synvert = function() {}`;
      mock({ "code.js": code });
      const node = parseCodeByEspree(code);
      expect(adapter.getSource(node)).toEqual(code);
    });

    it('gets multiple lines code', () => {
      const code = `
        const synvert = function() {
          console.log("synvert");
        }
      `;
      mock({ "code.js": code });
      const node = (parseCodeByEspree(code) as any)['declarations'][0]['init'];
      expect(adapter.getSource(node)).toEqual(dedent`
        function() {
                  console.log("synvert");
                }
      `);
    });

    it('fixes multiple lines code', () => {
      const code = `
        const synvert = function() {
          console.log("synvert");
        }
      `;
      mock({ "code.js": code });
      const node = (parseCodeByEspree(code) as any)['declarations'][0]['init'];
      expect(adapter.getSource(node, { fixIndent: true })).toEqual(dedent`
        function() {
          console.log("synvert");
        }
      `);
    });
  });

  describe("rewrittenSource", () => {
    it("rewrites with node known method", () => {
      const code = "class Synvert {}";
      mock({ "code.js": code });
      const node = parseCodeByEspree(code);
      expect(adapter.rewrittenSource(node, "{{id}}")).toEqual("Synvert");
    });

    it("rewrites for arguments", () => {
      const code = "foobar(foo, bar)";
      mock({ "code.js": code });
      const node = parseCodeByEspree(code);
      expect(adapter.rewrittenSource(node, "{{expression.arguments}}")).toEqual("foo, bar");
    });

    it("throws an error for unknown property", () => {
      const code = "class Synvert {}";
      mock({ "code.js": code });
      const node = parseCodeByEspree(code);
      expect(() => {
        adapter.rewrittenSource(node, "{{foobar}}");
      }).toThrow(new NotSupportedError("foobar is not supported for class Synvert {}"));
    });
  });

  describe("getStart", () => {
    it("gets start count", () => {
      const code = "class Synvert {\n}";
      mock({ "code.js": code });
      const node = parseCodeByEspree(code);
      expect(adapter.getStart(node)).toEqual(0);
    });
  });

  describe("getEnd", () => {
    it("gets end count", () => {
      const code = "class Synvert {\n}";
      mock({ "code.js": code });
      const node = parseCodeByEspree(code);
      expect(adapter.getEnd(node)).toEqual(code.length);
    });
  });

  describe("getStartLoc", () => {
    test("gets start location", () => {
      const code = "class Synvert {\n}";
      mock({ "code.js": code });
      const node = parseCodeByEspree(code);
      const startLoc = adapter.getStartLoc(node);
      expect(startLoc.line).toEqual(1);
      expect(startLoc.column).toEqual(0);
    });
  });

  describe("getEndLoc", () => {
    test("gets end location", () => {
      const code = "class Synvert {\n}";
      mock({ "code.js": code });
      const node = parseCodeByEspree(code);
      const startLoc = adapter.getEndLoc(node);
      expect(startLoc.line).toEqual(2);
      expect(startLoc.column).toEqual(1);
    });
  });

  describe("#childNodeRange", () => {
    test("FunctionDeclaration params", () => {
      const code = "function foobar(foo, bar) {}";
      mock({ "code.js": code });
      const node = parseCodeByEspree(code);
      expect(adapter.childNodeRange(node, "params")).toEqual({ start: 15, end: 25 });
    });

    test("MethodDeclaration parameters", () => {
      const code = "class Foobar { foobar(foo, bar) {} }";
      mock({ "code.js": code });
      const node = parseCodeByEspree(code);
      expect(adapter.childNodeRange(node, "body.body.0.value.params")).toEqual({ start: 21, end: 31 });
    });

    test("CallExpression arguments", () => {
      const code = "foobar(foo, bar)";
      mock({ "code.js": code });
      const node = parseCodeByEspree(code);
      expect(adapter.childNodeRange(node, "expression.arguments")).toEqual({ start: 6, end: 16 });
    });

    test("PropertyAssignment semicolon", () => {
      const code = "const obj = { foo: bar }";
      mock({ "code.js": code });
      const node = parseCodeByEspree(code);
      expect(adapter.childNodeRange(node, "declarations.0.init.properties.0.semicolon")).toEqual({ start: 17, end: 18 });
    });

    test("PropertyAccessExpression dot", () => {
      const code = "foo.bar";
      mock({ "code.js": code });
      const node = parseCodeByEspree(code);
      expect(adapter.childNodeRange(node, "expression.dot")).toEqual({ start: 3, end: 4 });
    });

    test("CallExpression unknown", () => {
      const code = "foobar(foo, bar)";
      mock({ "code.js": code });
      const node = parseCodeByEspree(code);
      expect(() => {
        adapter.childNodeRange(node, "expression.unknown");
      }).toThrow(new NotSupportedError("unknown is not supported for foobar(foo, bar)"));
    });
  });
});