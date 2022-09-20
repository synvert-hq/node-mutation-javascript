import { Node } from "typescript";
import { NoopAction } from "../../src/action";
import { parseCode } from "../helper";

describe("NoopAction", () => {
  it("gets range and rewritten code", () => {
    const node = parseCode("!!foobar");
    const action = new NoopAction<Node>(node);
    expect(action.process()).toEqual({
      start: 0,
      end: "!!foobar".length,
      newCode: undefined,
    });
  });
});
