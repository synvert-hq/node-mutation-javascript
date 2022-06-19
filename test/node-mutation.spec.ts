import fs from "fs";
import mock from "mock-fs";
import dedent from "dedent";
import NodeMutation, { STRATEGY } from "../src/node-mutation";
import { ConflictActionError } from "../src/error";

describe("NodeMutation", () => {
  describe("process", () => {
    const filePath = "code.ts";
    const source = dedent`
      class FooBar {
        foo() {}
        bar() {}
      }
    `;

    beforeEach(() => {
      mock({ [filePath]: source });
    });

    afterEach(() => {
      mock.restore();
    });

    it("gets no conflict", () => {
      const mutation = new NodeMutation<Node>(filePath);
      mutation.actions.push({
        start: 0,
        end: 0,
        newCode: "'use strict'\n",
      });
      mutation.actions.push({
        start: "class ".length,
        end: "class FooBar".length,
        newCode: "Synvert",
      });
      const result = mutation.process();
      expect(result.conflict).toBeFalsy();
      const newSource = fs.readFileSync(filePath, "utf-8");
      expect(newSource).toEqual(dedent`
        'use strict'
        class Synvert {
          foo() {}
          bar() {}
        }
      `)
    });

    it("get conflict with KEEP_RUNNING strategy", () => {
      NodeMutation<Node>.configure({ strategy: STRATEGY.KEEP_RUNNING });
      const mutation = new NodeMutation<Node>(filePath);
      mutation.actions.push({
        start: "class ".length,
        end: "class FooBar".length,
        newCode: "Synvert",
      });
      mutation.actions.push({
        start: "class FooBar".length,
        end: "class FooBar".length,
        newCode: " extends Base",
      });
      mutation.actions.push({
        start: 0,
        end: "class Foobar".length,
        newCode: "class Foobar extends Base",
      });
      const result = mutation.process();
      expect(result.conflict).toBeTruthy();
      const newSource = fs.readFileSync(filePath, "utf-8");
      expect(newSource).toEqual(dedent`
        class Synvert extends Base {
          foo() {}
          bar() {}
        }
      `)
    });

    it("get conflict with THROW_ERROR strategy", () => {
      NodeMutation<Node>.configure({ strategy: STRATEGY.THROW_ERROR });
      const mutation = new NodeMutation<Node>(filePath);
      mutation.actions.push({
        start: "class ".length,
        end: "class FooBar".length,
        newCode: "Synvert",
      });
      mutation.actions.push({
        start: "class FooBar".length,
        end: "class FooBar".length,
        newCode: " extends Base",
      });
      mutation.actions.push({
        start: 0,
        end: "class Foobar".length,
        newCode: "class Foobar extends Base",
      });
      expect(() => {
        mutation.process();
      }).toThrowError(new ConflictActionError());
    });
  });
});