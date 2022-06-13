import {
  Action,
  AppendAction,
  DeleteAction,
  InsertAction,
  PrependAction,
  RemoveAction,
  ReplaceAction,
  ReplaceWithAction,
} from "../src/action";
import { parseCode } from "./helper";

describe("Action", () => {
  describe("AppendAction", () => {
    const code = `class FooBar {\n}`;
    const node = parseCode(code);

    describe("single line", () => {
      let action: Action;

      beforeEach(() => {
        action = new AppendAction(node, "foobar() {}").process();
      });

      it("gets beginPos", function () {
        expect(action.beginPos).toBe(15);
      });

      it("gets endPos", function () {
        expect(action.endPos).toBe(15);
      });

      it("gets rewrittenCode", function () {
        expect(action.rewrittenCode).toBe(`  foobar() {}\n`);
      });
    });

    describe("multiple lines", () => {
      let action: Action;

      beforeEach(() => {
        action = new AppendAction(node, "foo() {}\nbar() {}").process();
      });

      it("gets beginPos", function () {
        expect(action.beginPos).toBe(15);
      });

      it("gets endPos", function () {
        expect(action.endPos).toBe(15);
      });

      it("gets rewrittenCode", function () {
        expect(action.rewrittenCode).toBe(`  foo() {}\n  bar() {}\n`);
      });
    });
  });

  describe("PrependAction", () => {
    const code = `class FooBar {\n}`;
    const node = parseCode(code);

    describe("single line", () => {
      let action: Action;

      beforeEach(() => {
        action = new PrependAction(node, "foobar() {}").process();
      });

      it("gets beginPos", function () {
        expect(action.beginPos).toBe(15);
      });

      it("gets endPos", function () {
        expect(action.endPos).toBe(15);
      });

      it("gets rewrittenCode", function () {
        expect(action.rewrittenCode).toBe(`  foobar() {}\n`);
      });
    });

    describe("multiple lines", () => {
      let action: Action;

      beforeEach(() => {
        action = new PrependAction(node, "foo() {}\nbar() {}").process();
      });

      it("gets beginPos", function () {
        expect(action.beginPos).toBe(15);
      });

      it("gets endPos", function () {
        expect(action.endPos).toBe(15);
      });

      it("gets rewrittenCode", function () {
        expect(action.rewrittenCode).toBe(`  foo() {}\n  bar() {}\n`);
      });
    });
  });

  describe("InsertAction", () => {
    const node = parseCode("this.foo");
    let action: Action;

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

  describe("DeleteAction", () => {
    const code = "this.foo.bind(this)";
    const node = parseCode(code);
    let action: Action;

    beforeEach(() => {
      action = new DeleteAction(node, [
        "expression.expression.dot",
        "expression.expression.name",
        "expression.arguments",
      ]).process();
    });

    it("gets beginPos", function () {
      expect(action.beginPos).toBe(8);
    });

    it("gets endPos", function () {
      expect(action.endPos).toBe(19);
    });

    it("gets rewrittenCode", function () {
      expect(action.rewrittenCode).toBe("");
    });
  });

  describe("RemoveAction", () => {
    describe("single line", () => {
      const code = "this.foo.bind(this);";
      const node = parseCode(code);
      let action: Action;

      beforeEach(() => {
        action = new RemoveAction(node).process();
      });

      it("gets beginPos", function () {
        expect(action.beginPos).toBe(0);
      });

      it("gets endPos", function () {
        expect(action.endPos).toBe(code.length);
      });

      it("gets rewrittenCode", function () {
        expect(action.rewrittenCode).toBe("");
      });
    });

    describe("multiple lines", () => {
      const code = `
        function foo(props) {
          this.bar = this.bar.bind(this);
        }
      `;
      const node = parseCode(code);
      let action: Action;

      beforeEach(() => {
        action = new RemoveAction((node as any).body.statements[0]).process();
      });

      it("gets beginPos", function () {
        expect(action.beginPos).toBe(code.indexOf("{") + "{\n".length);
      });

      it("gets endPos", function () {
        expect(action.endPos).toBe(code.indexOf(";") + ";\n".length);
      });

      it("gets rewrittenCode", function () {
        expect(action.rewrittenCode).toBe("");
      });
    });
  });

  describe("ReplaceAction", () => {
    const node = parseCode("class FooBar {}");
    let action: Action;

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

  describe("ReplaceWithAction", () => {
    const node = parseCode("!!foobar");
    let action: Action;

    beforeEach(() => {
      action = new ReplaceWithAction(
        node,
        "Boolean({{expression.operand.operand}})"
      ).process();
    });

    it("gets beginPos", function () {
      expect(action.beginPos).toBe(0);
    });

    it("gets endPos", function () {
      expect(action.endPos).toBe(8);
    });

    it("gets rewrittenCode", function () {
      expect(action.rewrittenCode).toBe("Boolean(foobar)");
    });
  });
});
