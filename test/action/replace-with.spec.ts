import { Node } from "typescript";
import { ReplaceWithAction } from "../../src/action";
import { parseCode } from "../helper";

describe("ReplaceWithAction", () => {
  const node = parseCode("!!foobar");

  it("gets range and rewritten code", () => {
    const action = new ReplaceWithAction<Node>(
      node,
      "Boolean({{expression.operand.operand}})"
    );
    expect(action.process()).toEqual({
      start: 0,
      end: "!!foobar".length,
      newCode: "Boolean(foobar)",
    });
  });
});
