import { Node } from "typescript";
import { IndentAction } from "../../src/action";
import { parseCode } from "../helper";
import TypescriptAdapter from "../../src/adapter/typescript";

describe("IndentAction", () => {
  const adapter = new TypescriptAdapter();
  const node = parseCode(`class FooBar {\n}`);

  it("gets range and rewritten code", () => {
    const action = new IndentAction<Node>(node, { adapter });
    expect(action.process()).toEqual({
      type: "replace",
      start: 0,
      end: `class FooBar {\n}`.length,
      newCode: `  class FooBar {\n  }`,
    });
  });
});
