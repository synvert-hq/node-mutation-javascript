interface Adapter<T> {
  /**
   * Get source code of the ast node
   * @param node {T} ast node
   * @returns {string} source code
   */
  getSource(node: T): string;

  /**
   * Replace the child node selector with child node source code
   * @param node {T} ast node
   * @param code {string} code with child node selector, e.g. `Boolean({{expression.operand.operand}})`
   * @returns {string} code with source code of child node selector,
   * e.g. source code of ast node is `!!foobar`, code is `Boolean({{expression.operand.operand}})`,
   * it will return `Boolean(foobar)`
   */
  rewrittenSource(node: T, code: string): string;

  /**
   * The file content of the ast node file
   * @param node {T} ast node
   * @returns file content
   */
  fileContent(node: T): string;

  /**
   * @typedef Range
   * @property start {number} - start posistion
   * @property end {number} - end posistion
   */

  /**
   * Get the start/end range of the child node
   * @param node {T} ast node
   * @param childName {string} child name selector
   * @returns {Range} child node range
   */
  childNodeRange(node: T, childName: string): { start: number, end: number };

  /**
   * Get start position of ast node
   * @param node {T} ast node
   * @returns {number} start position
   */
  getStart(node: T): number;

  /**
   * Get end position of ast node
   * @param node {T} ast node
   * @returns {number} end position
   */
  getEnd(node: T): number;

  /**
   * @typedef Location
   * @property line {number} - line
   * @property column {number} - column
   */

  /**
   * Get start location of ast node
   * @param node {T} ast node
   * @returns {Location} start location
   */
  getStartLoc(node: T): { line: number, column: number };

  /**
   * Get end location of ast node
   * @param node {T} ast node
   * @returns {Location} end location
   */
  getEndLoc(node: T): { line: number, column: number };

  /**
   * Get indent of ast node
   * @param node {T} ast node
   */
  getIndent(node: T): number;
}

export default Adapter;