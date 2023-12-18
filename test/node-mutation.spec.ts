import dedent from "dedent";
import NodeMutation from "../src/node-mutation";
import Strategy from "../src/strategy";
import { ConflictActionError } from "../src/error";
import { parseCode } from "./helper";
import { Node } from "typescript";
import TypescriptAdapter from "../src/adapter/typescript";

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
      const mutation = new NodeMutation<Node>(source, { adapter: "typescript" });
      const result = mutation.process();
      expect(result.affected).toBeFalsy();
    });

    it("gets no conflict", () => {
      const mutation = new NodeMutation<Node>(source, { adapter: "typescript" });
      const node = parseCode(source);
      mutation.insert(node, "'use strict'\n", { at: "beginning" });
      mutation.replace(node, "name", { with: "Synvert" });
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
      const mutation = new NodeMutation<Node>(source, { adapter: "typescript" });
      const node = parseCode(source);
      mutation.replace(node, "name", { with: "Foobar extends Base" });
      mutation.replace(node, "name", { with: "Synvert" });
      mutation.insert(node, " extends Base", { at: "end", to: "name" });
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
      const mutation = new NodeMutation<Node>(source, { adapter: "typescript" });
      const node = parseCode(source);
      mutation.replace(node, "name", { with: "Foobar extends Base" });
      mutation.replace(node, "name", { with: "Synvert" });
      mutation.insert(node, " extends Base", { at: "end", to: "name" });
      expect(() => {
        mutation.process();
      }).toThrowError(new ConflictActionError());
    });

    it("gets no conflict with insert at the same position", () => {
      NodeMutation.configure({ strategy: Strategy.KEEP_RUNNING });
      const mutation = new NodeMutation<Node>(source, { adapter: "typescript" });
      const node = parseCode(source);
      mutation.insert(node, " extends Foo", { at: "end", to: "name" });
      mutation.insert(node, " extends Bar", { at: "end", to: "name" });
      const result = mutation.process();
      expect(result.affected).toBeTruthy();
      expect(result.conflicted).toBeFalsy();
      expect(result.newSource).toEqual(dedent`
        class FooBar extends Foo extends Bar {
          foo() {}
          bar() {}
        }
      `)
    });

    it("gets no conflict with insert at the same position with conflictPosition", () => {
      NodeMutation.configure({ strategy: Strategy.KEEP_RUNNING });
      const mutation = new NodeMutation<Node>(source, { adapter: "typescript" });
      const node = parseCode(source);
      mutation.insert(node, " extends Foo", { at: "end", to: "name", conflictPosition: 2 });
      mutation.insert(node, " extends Bar", { at: "end", to: "name", conflictPosition: 1 });
      const result = mutation.process();
      expect(result.affected).toBeTruthy();
      expect(result.conflicted).toBeFalsy();
      expect(result.newSource).toEqual(dedent`
        class FooBar extends Bar extends Foo {
          foo() {}
          bar() {}
        }
      `)
    });

    it("groups actions", () => {
      NodeMutation.configure({ strategy: Strategy.KEEP_RUNNING });
      const mutation = new NodeMutation<Node>(source, { adapter: "typescript" });
      const node = parseCode(source);
      mutation.group(() => {
        mutation.insert(node, " extends Foo", { at: "end", to: "name" });
        mutation.insert(node, " extends Bar", { at: "end", to: "name" });
      });
      const result = mutation.process();
      expect(result.affected).toBeTruthy();
      expect(result.conflicted).toBeFalsy();
      expect(result.newSource).toEqual(dedent`
        class FooBar extends Foo extends Bar {
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
      const mutation = new NodeMutation<Node>(source, { adapter: "typescript" });
      const result = mutation.test();
      expect(result.affected).toBeFalsy();
    });

    it("gets no conflict", () => {
      const mutation = new NodeMutation<Node>(source, { adapter: "typescript" });
      const node = parseCode(source);
      mutation.insert(node, "'use strict'\n", { at: "beginning" });
      mutation.replace(node, "name", { with: "Synvert" });
      const result = mutation.test();
      expect(result.affected).toBeTruthy();
      expect(result.conflicted).toBeFalsy();
      expect(result.actions).toEqual([{
        "type": "insert",
        "actions": undefined,
        "start": 0,
        "end": 0,
        "newCode": "'use strict'\n",
      }, {
        "type": "replace",
        "start": 6,
        "end": 12,
        "newCode": "Synvert",
      }]);
    });

    it("get conflict with KEEP_RUNNING strategy", () => {
      NodeMutation.configure({ strategy: Strategy.KEEP_RUNNING });
      const mutation = new NodeMutation<Node>(source, { adapter: "typescript" });
      const node = parseCode(source);
      mutation.replace(node, "name", { with: "Foobar extends Base" });
      mutation.replace(node, "name", { with: "Synvert" });
      mutation.insert(node, " extends Base", { at: "end", to: "name" });
      const result = mutation.test();
      expect(result.affected).toBeTruthy();
      expect(result.conflicted).toBeTruthy();
      expect(result.actions).toEqual([{
        "type": "replace",
        "start": 6,
        "end": 12,
        "newCode": "Synvert",
      }, {
        "type": "insert",
        "start": 12,
        "end": 12,
        "newCode": " extends Base",
      }]);
    });

    it("get conflict with THROW_ERROR strategy", () => {
      NodeMutation.configure({ strategy: Strategy.THROW_ERROR });
      const mutation = new NodeMutation<Node>(source, { adapter: "typescript" });
      const node = parseCode(source);
      mutation.replace(node, "name", { with: "Foobar extends Base" });
      mutation.replace(node, "name", { with: "Synvert" });
      mutation.insert(node, " extends Base", { at: "end", to: "name" });
      expect(() => {
        mutation.test();
      }).toThrowError(new ConflictActionError());
    });

    it("groups actions", () => {
      NodeMutation.configure({ strategy: Strategy.KEEP_RUNNING });
      const mutation = new NodeMutation<Node>(source, { adapter: "typescript" });
      const node = parseCode(source);
      mutation.group(() => {
        mutation.insert(node, " extends Foo", { at: "end", to: "name" });
        mutation.insert(node, " extends Bar", { at: "end", to: "name" });
      });
      const result = mutation.test();
      expect(result.affected).toBeTruthy();
      expect(result.conflicted).toBeFalsy();
      expect(result.actions).toEqual([{
        "type": "group",
        "start": 12,
        "end": 12,
        "actions": [{
          "type": "insert",
          "start": 12,
          "end": 12,
          "newCode": " extends Foo",
        },
        {
          "type": "insert",
          "start": 12,
          "end": 12,
          "newCode": " extends Bar",
        }],
      }])
    });

    it("async groups actions", async () => {
      NodeMutation.configure({ strategy: Strategy.KEEP_RUNNING });
      const mutation = new NodeMutation<Node>(source, { adapter: "typescript" });
      const node = parseCode(source);
      await mutation.group(async () => {
        mutation.insert(node, " extends Foo", { at: "end", to: "name" });
        mutation.insert(node, " extends Bar", { at: "end", to: "name" });
      });
      const result = mutation.test();
      expect(result.affected).toBeTruthy();
      expect(result.conflicted).toBeFalsy();
      expect(result.actions).toEqual([{
        "type": "group",
        "start": 12,
        "end": 12,
        "actions": [{
          "type": "insert",
          "start": 12,
          "end": 12,
          "newCode": " extends Foo",
        },
        {
          "type": "insert",
          "start": 12,
          "end": 12,
          "newCode": " extends Bar",
        }],
      }])
    });
  });
});