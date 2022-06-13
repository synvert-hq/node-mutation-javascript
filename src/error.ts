/**
 * NotSupportedError is thrown when calling a not supported method on AST node.
 * @extends Error
 */
 class NotSupportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotSupportedError";
  }
}

export { NotSupportedError };
