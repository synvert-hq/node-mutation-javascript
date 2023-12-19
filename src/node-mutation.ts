import debug from "debug";
import type { Action, InsertOptions, ReplaceOptions, DeleteOptions, RemoveOptions } from "./types/action";
import type { ProcessResult, TestResult } from "./types/node-mutation";
import Adapter from "./adapter";
import TypescriptAdapter from "./adapter/typescript";
import EspreeAdapter from "./adapter/espree";
import GonzalesPeAdapter from "./adapter/gonzales-pe";
import Strategy from "./strategy";
import { AppendAction, DeleteAction, GroupAction, InsertAction, NoopAction, PrependAction, RemoveAction, ReplaceWithAction, ReplaceAction } from "./action";
import { ConflictActionError } from "./error";

class NodeMutation<T> {
  private static strategy: Strategy = Strategy.THROW_ERROR;
  public static tabWidth: number = 2;
  public adapter: Adapter<T>;
  private actions: Action[] = [];

  /**
   * Configure NodeMutation
   * @static
   * @param options {Object}
   * @param options.strategy {Strategy} - strategy, default is Strategy.THROW_ERROR
   * @param options.tabWidth {Number} - tab width, default is 2
   */
  static configure(options: { adapter?: Adapter<any>, strategy?: Strategy, tabWidth?: number }) {
    if (options.strategy) {
      this.strategy = options.strategy;
    }
    if (options.tabWidth) {
      this.tabWidth = options.tabWidth;
    }
  }

  /**
   * Initialize a NodeMutation
   * @param source {string} - file source.
   * @param {object} options
   * @param {Adapter<T>} options.adapter - adapter to parse the node
   */
  constructor(private source: string, { adapter }: { adapter: string }) {
    this.adapter = this.getAdapterInstance(adapter);
  }

  /**
   * Append code to the ast node.
   * @param node {T} - ast node
   * @param code {string} - new code to append
   * @example
   * source code of the ast node is
   * ```
   * class FooBar {
   *   foo() {}
   * }
   * ```
   * then we call
   * ```
   * mutation.append(node, "bar() {}");
   * ```
   * the source code will be rewritten to
   * ```
   * class FooBar {
   *   foo() {}
   *   bar() {}
   * }
   * ```
   */
  append(node: T, code: string) {
    this.actions.push(new AppendAction<T>(node, code, { adapter: this.adapter }).process());
  }

  /**
   * Delete source code of the child ast node
   * @param node {T} - current ast node
   * @param selectors {string|string[]} - selectors to find chid ast nodes
   * @param options {DeleteOptions}
   * @example
   * source code of the ast node is
   * ```
   * this.foo.bind(this)
   * ```
   * then we call
   * ```
   * mutation.delete(["expression.expression.dot", "expression.expression.name", "expression.arguments"])
   * ```
   * the source code will be rewritten to
   * ```
   * this.foo
   * ```
   */
  delete(node: T, selectors: string | string[], options: DeleteOptions = {}) {
    this.actions.push(new DeleteAction<T>(node, selectors, { ...options, adapter: this.adapter }).process());
  }

  /**
   * Group actions, it works both sync and async.
   * @param func {Function} - actions in the function will be grouped
   */
  async group(func: () => void | Promise<void>) {
    const currentActions = this.actions;
    const groupAction = new GroupAction({ adapter: this.adapter });
    this.actions = [];
    const result = func.call(this);
    if (result instanceof Promise) {
      await result;
    }
    groupAction.actions = this.actions;
    this.actions = currentActions;
    this.actions.push(groupAction.process());
  }

  /**
   * Insert options
   * @typedef {Object} InsertOptions
   * @property {string} [at = "end"] - position to insert, "beginning" or "end"
   * @property {string} [to] - selector to find the child ast node
   */

  /**
   * Insert code to the ast node.
   * @param node {T} - ast node
   * @param code {string} - new code to insert
   * @param options {InsertOptions}
   * @example
   * source code of the ast node is
   * ```
   * this.foo
   * ```
   * then we call
   * ```
   * mutation.insert(node, "::", { at: "beginning" });
   * ```
   * the source code will be rewritten to
   * ```
   * ::this.foo
   * ```
   * if we call
   * ```
   * mutation.insert(node, ".bar", { to: "expression.expression" })
   * ```
   * the source code will be rewritten to
   * ```
   * this.foo.bar
   * ```
   */
  insert(node: T, code: string, options: InsertOptions = { at: "end" }) {
    this.actions.push(new InsertAction<T>(node, code, { ...options, adapter: this.adapter }).process());
  }

  /**
   * No operation.
   * @param node {T} - ast node
   */
  noop(node: T) {
    this.actions.push(new NoopAction<T>(node, { adapter: this.adapter }).process());
  }

  /**
   * Prepend code to the ast node.
   * @param node {T} - ast node
   * @param code {string} - new code to prepend
   * @example
   * source code of the ast node is
   * ```
   * class FooBar {
   *   foo() {}
   * }
   * ```
   * then we call
   * ```
   * mutation.prepend(node, "bar() {}");
   * ```
   * the source code will be rewritten to
   * ```
   * class FooBar {
   *   bar() {}
   *   foo() {}
   * }
   * ```
   */
  prepend(node: T, code: string) {
    this.actions.push(new PrependAction<T>(node, code, { adapter: this.adapter }).process());
  }

  /**
   * Remove source code of the ast node
   * @param node {T} - ast node
   * @param options {RemoveOptions}
   * @example
   * source code of the ast node is
   * ```
   * this.foo.bind(this)
   * ```
   * then we call
   * ```
   * mutation.remove()
   * ```
   * the source code will be completely removed
   */
  remove(node: T, options: RemoveOptions = {}) {
    this.actions.push(new RemoveAction<T>(node, { ...options, adapter: this.adapter }).process());
  }

  /**
   * Replace options
   * @typedef {Object} ReplaceOptions
   * @property {string} with - new code to replace with
   */

  /**
   * Replace child node of the ast node with new code
   * @param node {T} - current ast node
   * @param selectors {string|string[]} - selectors to find chid ast nodes
   * @param options {ReplaceOptions}
   * @example
   * source code of the ast node is
   * ```
   * class FooBar {}
   * ```
   * then we call
   * ```
   * mutation.replace(node, "name", { with: "Synvert" });
   * ```
   * the source code will be rewritten to
   * ```
   * class Synvert {}
   * ```
   */
  replace(node: T, selectors: string | string[], options: ReplaceOptions) {
    this.actions.push(new ReplaceAction<T>(node, selectors, { ...options, adapter: this.adapter }).process());
  }

  /**
   * Replace the ast node with new code
   * @param node {T} - ast node
   * @param code {string} - new code to replace
   * @example
   * source code of the ast node is
   * ```
   * !!foobar
   * ```
   * then we call
   * ```
   * mutation.replaceWith(node, "Boolean({{expression.operand.operand}})");
   * ```
   * the source code will be rewritten to
   * ```
   * Boolean(foobar)
   * ```
   */
  replaceWith(node: T, code: string) {
    this.actions.push(new ReplaceWithAction<T>(node, code, { adapter: this.adapter }).process());
  }

  /**
   * Process Result
   * @typedef {Object} ProcessResult
   * @property {boolean} affected - if the source code is affected
   * @property {boolean} conflicted - if the actions are conflicted
   * @property {string} [newSource] - the new generated source code
   */

  /**
   * Rewrite the source code based on all actions.
   *
   * If there's an action range conflict,
   * it will raise a ConflictActionError if strategy is set to THROW_ERROR,
   * it will process all non conflicted actions and return `{ conflicted: true }`
   * @returns {ProcessResult}
   */
  process(): ProcessResult {
    this.actions = this.optimizeGroupActions(this.actions);
    const flattenActions = this.flatActions(this.actions);
    if (flattenActions.length == 0) {
      return { affected: false, conflicted: false };
    }
    const sortedActions = this.sortFlattenActions(flattenActions);
    const conflictActions = this.getConflictActions(sortedActions);
    if (conflictActions.length > 0  && this.isStrategy(Strategy.THROW_ERROR)) {
      throw new ConflictActionError();
    }
    const actions = this.sortFlattenActions(this.flatActions(this.getFilteredActions(conflictActions)));
    const newSource = this.rewriteSource(this.source, actions);

    return {
      affected: true,
      conflicted: conflictActions.length !== 0,
      newSource
    };
  }

  /**
   * Action
   * @typedef {Object} Action
   * @property {number} start - start position of the action
   * @property {number} end - end position of the action
   * @property {string} [newCode] - the new generated source code
   */

  /**
   * Test Result
   * @typedef {Object} TestResult
   * @property {boolean} affected - if the source code is affected
   * @property {boolean} conflicted - if the actions are conflicted
   * @property {Action[]} actions - actions to be processed
   */

  /**
   * Return the actions.
   *
   * If there's an action range conflict,
   * it will raise a ConflictActionError if strategy is set to THROW_ERROR,
   * it will process all non conflicted actions and return `{ conflicted: true }`
   * @returns {TestResult} if actions are conflicted and the actions
   */
  test(): TestResult {
    this.actions = this.optimizeGroupActions(this.actions);
    const flattenActions = this.flatActions(this.actions);
    if (flattenActions.length == 0) {
      return { affected: false, conflicted: false, actions: [] };
    }
    const sortedActions = this.sortFlattenActions(flattenActions);
    const conflictActions = this.getConflictActions(sortedActions);
    if (conflictActions.length > 0  && this.isStrategy(Strategy.THROW_ERROR)) {
      throw new ConflictActionError();
    }
    const actions = this.sortActions(this.getFilteredActions(conflictActions));
    return { affected: true, conflicted: conflictActions.length !== 0, actions };
  }

  /**
   * Optimizes a group of actions by recursively optimizing its sub-actions.
   * If a group action contains only one action, it replaces the group action with that action.
   * If a group action contains more than one action, it optimizes its sub-actions.
   * @private
   * @param {Action[]} actions
   * @returns {Action[]} optimized actions
   */
  private optimizeGroupActions(actions: Action[]): Action[] {
    return actions.flatMap(action => {
      if (action.type === 'group') {
        // If the group action contains only one action, replace the group action with that action
        if (action.actions!.length === 1) {
          return this.optimizeGroupActions(action.actions!);
        }
        // If the group action contains more than one action, optimize its sub-actions
        action.actions = this.optimizeGroupActions(action.actions!);
      }
      return action;
    });
  }

  /**
   * It flattens a series of actions by removing any GroupAction objects that contain only a single action. This is done recursively.
   * @private
   * @param {Action[]} actions
   * @returns {Action[]} sorted actions
   */
  private flatActions(actions: Action[]): Action[] {
    const flattenActions: Action[] = [];
    actions.forEach(action => {
      if (action.type === "group") {
        flattenActions.push(...this.flatActions(action.actions!));
      } else {
        flattenActions.push(action);
      }
    });
    return flattenActions;
  }

  /**
   * Sort actions by start position and end position.
   * @private
   * @param {Action[]} flattenActions
   * @returns {Action[]} sorted actions
   */
  private sortFlattenActions(flattenActions: Action[]): Action[] {
    return flattenActions.sort(this.compareActions);
  }

  /**
   * Recursively sort actions by start position and end position.
   * @private
   * @param {Action[]} flattenActions
   * @returns {Action[]} sorted actions
   */
  private sortActions(actions: Action[]): Action[] {
    actions.sort(this.compareActions);
    actions.forEach(action => {
      if (action.type === "group") {
        this.sortActions(action.actions!);
      }
    });
    return actions;
  }

  /**
   * Action sort function.
   * @private
   * @param {Action} actionA
   * @param {Action} actionB
   * @returns {number} returns 1 if actionA goes before actionB, -1 if actionA goes after actionB
   */
   private compareActions(actionA: Action, actionB: Action): 0 | 1 | -1 {
    if (actionA.start > actionB.start) return 1;
    if (actionA.start < actionB.start) return -1;
    if (actionA.end > actionB.end) return 1;
    if (actionA.end < actionB.end) return -1;
    if (actionA.conflictPosition && actionB.conflictPosition) {
      if (actionA.conflictPosition > actionB.conflictPosition) return 1;
      if (actionA.conflictPosition < actionB.conflictPosition) return -1;
    }
    return 0;
  }

  /**
   * Rewrite source code with actions.
   * @param source {string} source code
   * @param actions {Action[]} actions
   * @returns {string} new source code
   */
  private rewriteSource(source: string, actions: Action[]): string {
    actions.reverse().forEach((action) => {
      if (action.type === "group") {
        source = this.rewriteSource(source, action.actions!);
      } else if (typeof action.newCode !== "undefined") {
        source =
          source.slice(0, action.start) +
          action.newCode +
          source.slice(action.end);
      }
    });
    return source;
  }

  /**
   * It changes source code from bottom to top, and it can change source code twice at the same time,
   * So if there is an overlap between two actions, it removes the conflict actions and operate them in the next loop.
   * @private
   * @param {Action[]} actions
   * @returns {Action[]} conflict actions
   */
  private getConflictActions(actions: Action[]): Action[] {
    let i = actions.length - 1;
    let j = i - 1;
    const conflictActions: Action[] = [];
    if (i < 0) return [];

    let beginPos = actions[i].start;
    let endPos = actions[i].end;
    while (j > -1) {
      if (beginPos < actions[j].end) {
        conflictActions.push(actions[j]);
        debug("node-mutation")(`Conflict ${actions[j].type}[${actions[j].start}-${actions[j].end}]:${actions[j].newCode}`);
      } else {
        i = j;
        beginPos = actions[i].start;
        endPos = actions[i].end;
      }
      j--;
    }
    return conflictActions;
  }

  /**
   * It filters conflict actions from actions.
   * @private
   * @param {Action[]} conflictActions
   * @returns {Action[]} filtered actions
   */
  private getFilteredActions(conflictActions: Action[]): Action[] {
    return this.actions.filter(action => {
      if (action.type === 'group') {
        // If all child-actions of a group action are conflicted, remove the group action
        return action.actions!.every(childAction => !conflictActions.includes(childAction));
      } else {
        return !conflictActions.includes(action);
      }
    })
  }

  private isStrategy(strategy: Strategy): boolean {
    return !!NodeMutation.strategy && (NodeMutation.strategy & strategy) === strategy;
  }

  private getAdapterInstance(adapter: string): Adapter<any> {
    switch (adapter) {
      case "espree":
        return new EspreeAdapter();
      case "typescript":
        return new TypescriptAdapter();
      case "gonzales-pe":
        return new GonzalesPeAdapter();
      default:
        throw new Error(`Adapter "${adapter}" is not supported.`);
    }
  }
}

export default NodeMutation;
