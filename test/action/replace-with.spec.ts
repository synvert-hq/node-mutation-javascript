import dedent from "dedent";
import { Node } from "typescript";
import { ReplaceWithAction } from "../../src/action";
import { parseCode, parseJsxCode } from "../helper";
import TypescriptAdapter from "../../src/adapter/typescript";

describe("ReplaceWithAction", () => {
  const adapter = new TypescriptAdapter();

  it("gets range and rewritten code", () => {
    const node = parseCode("!!foobar");
    const action = new ReplaceWithAction<Node>(
      node,
      "Boolean({{expression.operand.operand}})",
      { adapter },
    );
    expect(action.process()).toEqual({
      type: "replace",
      start: 0,
      end: "!!foobar".length,
      newCode: "Boolean(foobar)",
    });
  });

  it("gets range and rewritten code with array", () => {
    const node = (parseCode("const x: Array<string> = ['a', 'b']") as any).declarationList.declarations[0].type
    const action = new ReplaceWithAction<Node>(
      node,
      "{{typeArguments}}[]",
      { adapter },
    );
    expect(action.process()).toEqual({
      type: "replace",
      start: "const x: ".length,
      end: "const x: Array<string>".length,
      newCode: "string[]",
    });
  });

  it("gets range and rewritten code with multiple lines", () => {
    const source = dedent`
      <div className="container-fluid">
        foobar
      </div>
    `
    const node = parseJsxCode(source)
    const action = new ReplaceWithAction<Node>(
      node,
      dedent`
        <Container fluid>
          {{expression.children.0}}
        </Container>
      `,
      { adapter },
    );
    expect(action.process()).toEqual({
      type: "replace",
      start: 0,
      end: source.length,
      newCode: dedent`
        <Container fluid>
          foobar
        </Container>
      `,
    });
  });
});
