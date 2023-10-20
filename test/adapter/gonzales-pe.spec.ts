import dedent from "dedent";
import GonzalesPeAdapter from "../../src/adapter/gonzales-pe";
import { parseCodeByGonzalesPe, indent } from "../helper";
import mock from "mock-fs";

describe("GonzalesPeAdapter", () => {
  const adapter = new GonzalesPeAdapter();

  afterEach(() => {
    mock.restore();
  });

  describe("getSource", () => {
    it('gets one line code', () => {
      const code = `a { color: red; }`;
      mock({ "code.css": code });
      const node = parseCodeByGonzalesPe(code);
      expect(adapter.getSource(node)).toEqual(code);
    });

    it('gets multiple lines code', () => {
      const code = `
        nav {
          a {
            color: red;
          }
        }
      `;
      mock({ "code.scss": code });
      const node = (parseCodeByGonzalesPe(code, 'code.scss') as any)['content'][1]['content'][2]['content'][1];
      const expectedCode = dedent`
        a {
          color: red;
        }
      `
      expect(adapter.getSource(node)).toEqual(indent(expectedCode, 10));
    });
  });

  describe("getStart", () => {
    it("gets start count", () => {
      const code = dedent`
        nav {
          a {
            color: red;
          }
        }
      `;
      mock({ "code.scss": code });
      const node = parseCodeByGonzalesPe(code, 'code.scss');
      expect(adapter.getStart(node)).toEqual(0);
      const childNode = (node as any)['content'][0]['content'][2]['content'][1];
      expect(adapter.getStart(childNode)).toEqual(8);
    });

    it("gets start count with childName", () => {
      const code = dedent`
        nav {
          a {
            color: red;
          }
        }
      `;
      mock({ "code.scss": code });
      const node = parseCodeByGonzalesPe(code, 'code.scss');
      const childNode = (node as any)['content'][0]['content'][2]['content'][1];
      expect(adapter.getStart(childNode, "content.2")).toEqual(10);
    });
  });

  describe("getEnd", () => {
    it("gets end count", () => {
      const code = dedent`
        nav {
          a {
            color: red;
          }
        }
      `;
      mock({ "code.scss": code });
      const node = parseCodeByGonzalesPe(code, 'code.scss');
      expect(adapter.getEnd(node)).toEqual(code.length);
      const childNode = (node as any)['content'][0]['content'][2]['content'][1];
      expect(adapter.getEnd(childNode)).toEqual(code.length - 2);
    });

    it("gets end count with childName", () => {
      const code = dedent`
        nav {
          a {
            color: red;
          }
        }
      `;
      mock({ "code.scss": code });
      const node = parseCodeByGonzalesPe(code, 'code.scss');
      expect(adapter.getEnd(node, "content.0.content.2.content.1")).toEqual(code.length - 2);
    });
  });

  describe("getStartLoc", () => {
    test("gets start location", () => {
      const code = dedent`
        nav {
          a {
            color: red;
          }
        }
      `;
      mock({ "code.scss": code });
      const node = parseCodeByGonzalesPe(code, 'code.scss');
      expect(adapter.getStartLoc(node)).toEqual({ line: 1, column: 0 });
      const childNode = (node as any)['content'][0]['content'][2]['content'][1];
      expect(adapter.getStartLoc(childNode)).toEqual({ line: 2, column: 2 });
    });

    test("gets start location with childName", () => {
      const code = dedent`
        nav {
          a {
            color: red;
          }
        }
      `;
      mock({ "code.scss": code });
      const node = parseCodeByGonzalesPe(code, 'code.scss');
      expect(adapter.getStartLoc(node, "content.0.content.2.content.1")).toEqual({ line: 2, column: 2 });
    });
  });

  describe("getEndLoc", () => {
    test("gets end location", () => {
      const code = dedent`
        nav {
          a {
            color: red;
          }
        }
      `;
      mock({ "code.scss": code });
      const node = parseCodeByGonzalesPe(code, 'code.scss');
      expect(adapter.getEndLoc(node)).toEqual({ line: 5, column: 1 });
      const childNode = (node as any)['content'][0]['content'][2]['content'][1];
      expect(adapter.getEndLoc(childNode)).toEqual({ line: 4, column: 3 });
    });

    test("gets end location with childName", () => {
      const code = dedent`
        nav {
          a {
            color: red;
          }
        }
      `;
      mock({ "code.scss": code });
      const node = parseCodeByGonzalesPe(code, 'code.scss');
      expect(adapter.getEndLoc(node, "content.0.content.2.content.1")).toEqual({ line: 4, column: 3 });
    });
  });

  describe("#childNodeRange", () => {
    test("gets range", () => {
      const code = dedent`
        nav {
          a {
            color: red;
          }
        }
      `;
      mock({ "code.scss": code });
      const node = parseCodeByGonzalesPe(code, 'code.scss');
      expect(adapter.childNodeRange(node, 'content')).toEqual({ start: 0, end: code.length });
      expect(adapter.childNodeRange(node, 'ruleset.block.ruleset')).toEqual({ start: 8, end: code.length - 2 });
    });

    test("block leftCurlyBracket", () => {
      const code = dedent`
        a {
          color: red;
        }
      `;
      mock({ "code.scss": code });
      const node = parseCodeByGonzalesPe(code, 'code.scss');
      expect(adapter.childNodeRange(node, 'ruleset.block.leftCurlyBracket')).toEqual({ start: 2, end: 3 });
    });

    test("block rightCurlyBracket", () => {
      const code = dedent`
        a {
          color: red;
        }
      `;
      mock({ "code.scss": code });
      const node = parseCodeByGonzalesPe(code, 'code.scss');
      expect(adapter.childNodeRange(node, 'ruleset.block.rightCurlyBracket')).toEqual({ start: code.length - 1, end: code.length });
    });
  });

  describe("#childNodeValue", () => {
    test("gets child node", () => {
      const code = dedent`
        nav {
          a {
            color: red;
          }
        }
      `;
      mock({ "code.scss": code });
      const node = parseCodeByGonzalesPe(code, 'code.scss');
      expect(adapter.childNodeValue(node, 'ruleset.block.ruleset')).toEqual((node as any)["ruleset"]["block"]["ruleset"]);
    });

    test("gets child node with negative index", () => {
      const code = dedent`
        nav {
          a {
            color: red;
          }
        }
      `;
      mock({ "code.scss": code });
      const node = parseCodeByGonzalesPe(code, 'code.scss');
      expect(adapter.childNodeValue(node, 'content.0.content.-1.content.1')).toEqual((node as any)["ruleset"]["block"]["ruleset"]);
    });
  });
});