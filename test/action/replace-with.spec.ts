import ReplaceWithAction from "../../src/action/replace-with";
import { parseCode } from "../helper";

describe("ReplaceWithAction", () => {
  const node = parseCode("!!foobar");

  it("gets range and rewritten code", () => {
    const action = new ReplaceWithAction(
      node,
      "Boolean({{expression.operand.operand}})"
    );
    expect(action.process()).toEqual({
      start: 0,
      end: "!!foobar".length,
      rewrittenCode: "Boolean(foobar)",
    });
  });
});
