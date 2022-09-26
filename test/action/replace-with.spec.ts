import dedent from "dedent";
import { Node } from "typescript";
import { ReplaceWithAction } from "../../src/action";
import { parseCode, parseJsxCode } from "../helper";

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
      `
    );
    expect(action.process()).toEqual({
      start: 0,
      end: source.length,
      newCode: dedent`
        <Container fluid>
          foobar
        </Container>
      `,
    });
  });

  it("gets range and rewritten code with function call", () => {
    const source = `/^bar/.test(baz)`;
    const node = parseCode(source);
    const action = new ReplaceWithAction<Node>(node, "{{expression.expression.expression.text.slice(2, -1)}}");
    expect(action.process()).toEqual({
      start: 0,
      end: source.length,
      newCode: 'bar'
    })
  });
});
