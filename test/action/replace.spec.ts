import { ReplaceAction } from "../../src/action";
import { parseCode } from "../helper";

describe("ReplaceAction", () => {
  const node = parseCode("class FooBar {}");

  it("gets range and rewritten code", () => {
    const action = new ReplaceAction(node, "name", { with: "Synvert" });
    expect(action.process()).toEqual({
      start: "class ".length,
      end: "class FooBar".length,
      newCode: "Synvert",
    });
  });
});
