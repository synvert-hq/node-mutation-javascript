import ts from "typescript";

// Parse source code and return typescript SourceFile.
// @param code [String] source code.
// @return [ts.SourceFile] typescrpt SourceFile node.
export const parseCode = (code: string): ts.Node => {
  return ts.createSourceFile("code.ts", code, ts.ScriptTarget.Latest, true).statements[0];
};
