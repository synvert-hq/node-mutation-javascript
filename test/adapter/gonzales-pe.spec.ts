import dedent from "dedent";
import { NotSupportedError } from "../../src/error";
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

  describe("rewrittenSource", () => {
    it("rewrites with sub selector", () => {
      const code = `
        nav {
          a {
            color: red;
          }
        }
      `;
      mock({ "code.scss": code });
      const node = parseCodeByGonzalesPe(code, 'code.scss');
      const expectedCode = dedent`
        a {
          color: red;
        }
      `
      expect(adapter.rewrittenSource(node, "{{content.1.content.2.content.1}}")).toEqual(indent(expectedCode, 10));
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
      expect(adapter.childNodeRange(node, 'content.0.content.2.content.1')).toEqual({ start: 8, end: code.length - 2 });
    });
  });
});