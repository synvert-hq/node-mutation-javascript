import ts from "typescript";

// Parse source code and return the first typescript statement.
// @param code [String] source code.
// @return [ts.Node] first typescrpt statement node.
export const parseCode = (code: string): ts.Node => {
  return ts.createSourceFile("code.ts", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS).statements[0];
};

export const parseJsxCode = (code: string): ts.Node => {
  return ts.createSourceFile("code.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX).statements[0];
}
