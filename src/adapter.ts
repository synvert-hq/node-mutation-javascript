interface Adapter<T> {
  /**
   * Get source code of the ast node
   * @param node {T} ast node
   * @returns {string} source code
   */
  getSource(node: T, options?: { fixIndent: boolean }): string;

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
   * Get the value of the child node
   * @param node {T} ast node
   * @param childName {string} child name selector
   * @returns {any} child node value
   */
  childNodeValue(node: T, childName: string): any;

  /**
   * Get start position of ast node
   * @param node {T} ast node
   * @param childName {string} child name selector
   * @returns {number} start position
   */
  getStart(node: T, childName?: string): number;

  /**
   * Get end position of ast node
   * @param node {T} ast node
   * @param childName {string} child name selector
   * @returns {number} end position
   */
  getEnd(node: T, childName?: string): number;

  /**
   * @typedef Location
   * @property line {number} - line
   * @property column {number} - column
   */

  /**
   * Get start location of ast node
   * @param node {T} ast node
   * @param childName {string} child name selector
   * @returns {Location} start location
   */
  getStartLoc(node: T, childName?: string): { line: number, column: number };

  /**
   * Get end location of ast node
   * @param node {T} ast node
   * @param childName {string} child name selector
   * @returns {Location} end location
   */
  getEndLoc(node: T, childName?: string): { line: number, column: number };

  /**
   * Get indent of ast node
   * @param node {T} ast node
   * @returns {Number} indent
   */
  getIndent(node: T): number;
}

export default Adapter;