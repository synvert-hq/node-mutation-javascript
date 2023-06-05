import dedent from "dedent";
import NodeMutation from "../src/node-mutation";
import Strategy from "../src/strategy";
import { ConflictActionError } from "../src/error";

describe("NodeMutation", () => {
  describe("configure", () => {
    it("sets tabWidth", () => {
      expect(NodeMutation.tabWidth).toEqual(2);
      NodeMutation.configure({ tabWidth: 4 });
      expect(NodeMutation.tabWidth).toEqual(4);
    });
  });

  describe("process", () => {
    const source = dedent`
      class FooBar {
        foo() {}
        bar() {}
      }
    `;

    it("gets no action", () => {
      const mutation = new NodeMutation<Node>(source);
      const result = mutation.process();
      expect(result.affected).toBeFalsy();
    });

    it("gets no conflict", () => {
      const mutation = new NodeMutation<Node>(source);
      mutation.actions.push({
        type: "insert",
        start: 0,
        end: 0,
        newCode: "'use strict'\n",
      });
      mutation.actions.push({
        type: "replace",
        start: "class ".length,
        end: "class FooBar".length,
        newCode: "Synvert",
      });
      const result = mutation.process();
      expect(result.affected).toBeTruthy();
      expect(result.conflicted).toBeFalsy();
      expect(result.newSource).toEqual(dedent`
        'use strict'
        class Synvert {
          foo() {}
          bar() {}
        }
      `)
    });

    it("gets conflict with KEEP_RUNNING strategy", () => {
      NodeMutation.configure({ strategy: Strategy.KEEP_RUNNING });
      const mutation = new NodeMutation<Node>(source);
      mutation.actions.push({
        type: "replace",
        start: "class ".length,
        end: "class FooBar".length,
        newCode: "Synvert",
      });
      mutation.actions.push({
        type: "insert",
        start: "class FooBar".length,
        end: "class FooBar".length,
        newCode: " extends Base",
      });
      mutation.actions.push({
        type: "replace",
        start: 0,
        end: "class Foobar".length,
        newCode: "class Foobar extends Base",
      });
      const result = mutation.process();
      expect(result.affected).toBeTruthy();
      expect(result.conflicted).toBeTruthy();
      expect(result.newSource).toEqual(dedent`
        class Synvert extends Base {
          foo() {}
          bar() {}
        }
      `)
    });

    it("gets conflict with THROW_ERROR strategy", () => {
      NodeMutation.configure({ strategy: Strategy.THROW_ERROR });
      const mutation = new NodeMutation<Node>(source);
      mutation.actions.push({
        type: "replace",
        start: "class ".length,
        end: "class FooBar".length,
        newCode: "Synvert",
      });
      mutation.actions.push({
        type: "insert",
        start: "class FooBar".length,
        end: "class FooBar".length,
        newCode: " extends Base",
      });
      mutation.actions.push({
        type: "replace",
        start: 0,
        end: "class Foobar".length,
        newCode: "class Foobar extends Base",
      });
      expect(() => {
        mutation.process();
      }).toThrowError(new ConflictActionError());
    });

    it("gets no conflict with insert at the same position", () => {
      NodeMutation.configure({ strategy: Strategy.KEEP_RUNNING });
      const mutation = new NodeMutation<Node>(source);
      mutation.actions.push({
        type: "insert",
        start: "class Foobar".length,
        end: "class FooBar".length,
        newCode: " extends Base",
      });
      mutation.actions.push({
        type: "insert",
        start: "class FooBar".length,
        end: "class FooBar".length,
        newCode: " extends Base",
      });
      const result = mutation.process();
      expect(result.affected).toBeTruthy();
      expect(result.conflicted).toBeFalsy();
      expect(result.newSource).toEqual(dedent`
        class FooBar extends Base extends Base {
          foo() {}
          bar() {}
        }
      `)
    });
  });

  describe("test", () => {
    const source = dedent`
      class FooBar {
        foo() {}
        bar() {}
      }
    `;

    it("gets no action", () => {
      const mutation = new NodeMutation<Node>(source);
      const result = mutation.test();
      expect(result.affected).toBeFalsy();
    });

    it("gets no conflict", () => {
      const mutation = new NodeMutation<Node>(source);
      mutation.actions.push({
        type: "insert",
        start: 0,
        end: 0,
        newCode: "'use strict'\n",
      });
      mutation.actions.push({
        type: "replace",
        start: "class ".length,
        end: "class FooBar".length,
        newCode: "Synvert",
      });
      const result = mutation.test();
      expect(result.affected).toBeTruthy();
      expect(result.conflicted).toBeFalsy();
      expect(result.actions).toEqual(mutation.actions);
    });

    it("get conflict with KEEP_RUNNING strategy", () => {
      NodeMutation.configure({ strategy: Strategy.KEEP_RUNNING });
      const mutation = new NodeMutation<Node>(source);
      mutation.actions.push({
        type: "replace",
        start: "class ".length,
        end: "class FooBar".length,
        newCode: "Synvert",
      });
      mutation.actions.push({
        type: "insert",
        start: "class FooBar".length,
        end: "class FooBar".length,
        newCode: " extends Base",
      });
      mutation.actions.push({
        type: "replace",
        start: 0,
        end: "class Foobar".length,
        newCode: "class Foobar extends Base",
      });
      const result = mutation.test();
      expect(result.affected).toBeTruthy();
      expect(result.conflicted).toBeTruthy();
      expect(result.actions).toEqual(mutation.actions);
    });

    it("get conflict with THROW_ERROR strategy", () => {
      NodeMutation.configure({ strategy: Strategy.THROW_ERROR });
      const mutation = new NodeMutation<Node>(source);
      mutation.actions.push({
        type: "replace",
        start: "class ".length,
        end: "class FooBar".length,
        newCode: "Synvert",
      });
      mutation.actions.push({
        type: "insert",
        start: "class FooBar".length,
        end: "class FooBar".length,
        newCode: " extends Base",
      });
      mutation.actions.push({
        type: "replace",
        start: 0,
        end: "class Foobar".length,
        newCode: "class Foobar extends Base",
      });
      expect(() => {
        mutation.test();
      }).toThrowError(new ConflictActionError());
    });
  });
});