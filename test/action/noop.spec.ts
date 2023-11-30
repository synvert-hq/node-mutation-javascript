import { Node } from "typescript";
import { NoopAction } from "../../src/action";
import { parseCode } from "../helper";
import TypescriptAdapter from "../../src/adapter/typescript";

describe("NoopAction", () => {
  const adapter = new TypescriptAdapter();

  it("gets range and rewritten code", () => {
    const node = parseCode("!!foobar");
    const action = new NoopAction<Node>(node, { adapter });
    expect(action.process()).toEqual({
      type: "",
      start: 0,
      end: "!!foobar".length,
      newCode: undefined,
    });
  });
});
