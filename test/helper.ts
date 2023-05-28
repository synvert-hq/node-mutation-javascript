import path from "path";
import ts from "typescript";
import { Node as EspreeNode } from "acorn";
import * as espree from "@xinminlabs/espree";
import gonzales from "@xinminlabs/gonzales-pe";

// Parse source code and return the first typescript statement.
// @param code [String] source code.
// @return [ts.Node] first typescrpt statement node.
export const parseCode = (code: string): ts.Node => {
  return ts.createSourceFile("code.ts", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS).statements[0];
}

export const parseJsxCode = (code: string): ts.Node => {
  return ts.createSourceFile("code.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX).statements[0];
}

export const parseCodeByEspree = (code: string): EspreeNode => {
  return espree.parse(code, {
    ecmaVersion: "latest",
    loc: true,
    sourceFile: "code.js",
  }).body[0];
}

export const parseCodeByGonzalesPe = (code: string, sourceFile: string = 'code.css'): gonzales.Node => {
  return gonzales.parse(code, {
    syntax: path.extname(sourceFile).slice(1),
    sourceFile
  });
}

export const indent = (code: string, column: number = 2): string => {
  return code.split("\n").map(line => " ".repeat(column) + line).join("\n");
}
