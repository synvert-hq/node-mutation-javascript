import { Node } from "typescript";
import { ReplaceWithAction } from "../../src/action";
import { parseCode } from "../helper";

describe("ReplaceWithAction", () => {
  it("gets range and rewritten code", () => {
    const node = parseCode("!!foobar");
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

  it("gets range and rewritten code with array", () => {
    const node = (parseCode("const x: Array<string> = ['a', 'b']") as any).declarationList.declarations[0].type
    const action = new ReplaceWithAction<Node>(
      node,
      "{{typeArguments}}[]"
    );
    expect(action.process()).toEqual({
      start: "const x: ".length,
      end: "const x: Array<string>".length,
      newCode: "string[]",
    });
  });
});
