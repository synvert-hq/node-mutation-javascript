import { Node } from "typescript";
import { GroupAction, InsertAction } from "../../src/action";
import { parseCode } from "../helper";

describe("GroupAction", () => {
  it("gets range and rewritten code", () => {
    const action = new GroupAction<Node>();
    const node = parseCode("foo");
    const childAction1 = new InsertAction<Node>(node, "this.", { at: "beginning" });
    const childAction2 = new InsertAction<Node>(node, ".bar", { at: "end" });
    action.actions.push(childAction1.process());
    action.actions.push(childAction2.process());
    expect(action.process()).toEqual({
      type: "group",
      start: 0,
      end: "foo".length,
      actions: [{
        "end": 0,
        "newCode": "this.",
        "start": 0,
        "type": "insert",
      }, {
        "end": "foo".length,
        "newCode": ".bar",
        "start": "foo".length,
        "type": "insert",
      }]
    });
  });
});
