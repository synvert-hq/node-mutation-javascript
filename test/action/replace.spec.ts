import { Node } from "typescript";
import { ReplaceAction } from "../../src/action";
import { parseCode } from "../helper";
import TypescriptAdapter from "../../src/adapter/typescript";

describe("ReplaceAction", () => {
  const adapter = new TypescriptAdapter();
  const node = parseCode("class FooBar {}");

  it("gets range and rewritten code", () => {
    const action = new ReplaceAction<Node>(node, "name", { with: "Synvert" , adapter });
    expect(action.process()).toEqual({
      type: "replace",
      start: "class ".length,
      end: "class FooBar".length,
      newCode: "Synvert",
    });
  });
});
