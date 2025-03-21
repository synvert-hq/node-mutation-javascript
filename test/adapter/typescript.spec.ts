import dedent from "dedent";
import { NotSupportedError } from "../../src/error";
import TypescriptAdapter from "../../src/adapter/typescript";
import { parseCode, parseJsxCode } from "../helper";

describe("TypescriptAdapter", () => {
  const adapter = new TypescriptAdapter();

  describe("getSource", () => {
    it('gets one line code', () => {
      const code = `const synvert = function() {}`;
      const node = parseCode(code);
      expect(adapter.getSource(node)).toEqual(code);
    });

    it('gets multiple lines code', () => {
      const code = `
        const synvert = function() {
          console.log("synvert");
        }
      `;
      const node = (parseCode(code) as any)['declarationList']['declarations'][0]['initializer'];
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
      const node = (parseCode(code) as any)['declarationList']['declarations'][0]['initializer'];
      expect(adapter.getSource(node, { fixIndent: true })).toEqual(dedent`
        function() {
          console.log("synvert");
        }
      `);
    });
  });

  describe("getStart", () => {
    it("gets start count", () => {
      const node = parseCode("class Synvert {\n}");
      expect(adapter.getStart(node)).toEqual(0);
    });

    it("gets start count with childName", () => {
      const node = parseCode("class Synvert {\n}");
      expect(adapter.getStart(node, "name")).toEqual("class ".length);
    });
  });

  describe("getEnd", () => {
    it("gets end count", () => {
      const code = "class Synvert {\n}";
      const node = parseCode(code);
      expect(adapter.getEnd(node)).toEqual(code.length);
    });

    it("gets end count with childName", () => {
      const node = parseCode("class Synvert {\n}");
      expect(adapter.getEnd(node, "name")).toEqual("class Synvert".length);
    });
  });

  describe("getStartLoc", () => {
    test("gets start location", () => {
      const node = parseCode("class Synvert {\n}");
      const startLoc = adapter.getStartLoc(node);
      expect(startLoc.line).toEqual(1);
      expect(startLoc.column).toEqual(0);
    });

    test("gets start location with childName", () => {
      const node = parseCode("class Synvert {\n}");
      const startLoc = adapter.getStartLoc(node, "name");
      expect(startLoc.line).toEqual(1);
      expect(startLoc.column).toEqual("class ".length);
    });
  });

  describe("getEndLoc", () => {
    test("gets end location", () => {
      const node = parseCode("class Synvert {\n}");
      const startLoc = adapter.getEndLoc(node);
      expect(startLoc.line).toEqual(2);
      expect(startLoc.column).toEqual(1);
    });

    test("gets end location with childName", () => {
      const node = parseCode("class Synvert {\n}");
      const startLoc = adapter.getEndLoc(node, "name");
      expect(startLoc.line).toEqual(1);
      expect(startLoc.column).toEqual("class Synvert".length);
    });
  });

  describe("#childNodeRange", () => {
    test("ArrowFunction parameters", () => {
      const node = (parseCode("const foobar = () => {}") as any)['declarationList']['declarations'][0]['initializer'];
      expect(adapter.childNodeRange(node, "parameters")).toEqual({ start: 15, end: 17 });
    });

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

    test("xxxProperty", () => {
      const node = parseCode('const obj = { foo: "foo", bar: "bar" }');
      expect(adapter.childNodeRange(node, "declarationList.declarations.0.initializer.fooProperty")).toEqual({ start: "const obj = { ".length, end: 'const obj = { foo: "foo"'.length });
    });

    test("xxxAttribute", () => {
      const node = parseJsxCode('<Field name="email" autoComplete="email" />');
      expect(adapter.childNodeRange(node, "expression.attributes.autoCompleteAttribute")).toEqual({ start: '<Field name="email" '.length, end: '<Field name="email" autoComplete="email"'.length });
    });

    test("xxxInitializer", () => {
      const node = parseCode('const obj = { foo: "foo", bar: "bar" }');
      expect(adapter.childNodeRange(node, "declarationList.declarations.0.initializer.fooInitializer")).toEqual({ start: "const obj = { foo: ".length, end: 'const obj = { foo: "foo"'.length});
    });

    test("CallExpression unknown", () => {
      const node = parseCode("foobar(foo, bar)");
      expect(() => {
        adapter.childNodeRange(node, "expression.unknown");
      }).toThrow(new NotSupportedError("unknown is not supported for foobar(foo, bar)"));
    });
  });

  describe("#childNodeValue", () => {
    test("gets child node", () => {
      const node = parseCode("foobar(foo, bar)");
      expect(adapter.childNodeValue(node, "expression.arguments.0")).toEqual((node as any)["expression"]["arguments"][0]);
    });

    test("gets child node by negative index", () => {
      const node = parseCode("foobar(foo, bar)");
      expect(adapter.childNodeValue(node, "expression.arguments.-1")).toEqual((node as any)["expression"]["arguments"][1]);
    });

    test("gets child string value", () => {
      const node = parseCode('foobar("foo", "bar")');
      expect(adapter.childNodeValue(node, "expression.arguments.0.text")).toEqual("foo");
    });

    test("gets xxxProperty child node", () => {
      const node = parseCode('const obj = { foo: "foo", bar: "bar" }');
      expect(adapter.childNodeValue(node, "declarationList.declarations.0.initializer.fooProperty")).toEqual((node as any)["declarationList"]["declarations"][0]["initializer"]["properties"][0]);
    });

    test("gets xxxAttribute child node", () => {
      const node = parseJsxCode('<Field name="email" autoComplete="email" />');
      expect(adapter.childNodeValue(node, "expression.attributes.autoCompleteAttribute")).toEqual((node as any)["expression"]["attributes"]["properties"][1]);
    });

    test("gets xxxInitializer child node", () => {
      const node = parseCode('const obj = { foo: "foo", bar: "bar" }');
      expect(adapter.childNodeValue(node, "declarationList.declarations.0.initializer.fooInitializer")).toEqual((node as any)["declarationList"]["declarations"][0]["initializer"]["properties"][0]["initializer"]);
    });
  });
});