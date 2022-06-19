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

/**
 * ConflictActionError is thrown when there is a conflict among actions.
 */
class ConflictActionError extends Error {
  constructor() {
    super("mutation actions are conflicted");
    this.name = "ConflictActionError";
  }
}

export { NotSupportedError, ConflictActionError };
