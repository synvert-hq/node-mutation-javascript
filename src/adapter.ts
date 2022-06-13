interface Adapter<T> {
  getSource(node: T): string;
  rewrittenSource(node: T, code: string): string;
  fileContent(node: T): string;
  childNodeRange(node: T, childName: string): { start: number, end: number };
  getStart(node: T): number;
  getEnd(node: T): number;
  getStartLoc(node: T): { line: number, column: number };
  getEndLoc(node: T): { line: number, column: number };
  getIndent(node: T): number;
}

export default Adapter;