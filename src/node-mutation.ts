import fs from "fs";
import type { Action, InsertOptions, ReplaceOptions, ReplaceWithOptions } from "./types";
import Adapter from "./adapter";
import { AppendAction, DeleteAction, InsertAction, PrependAction, RemoveAction, ReplaceWithAction, ReplaceAction } from "./action";
import { ConflictActionError } from "./error";

export enum STRATEGY {
  KEEP_RUNNING = 1,
  THROW_ERROR,
}

class NodeMutation<T> {
  private static adapter?: Adapter<any>;
  private static strategy?: STRATEGY = STRATEGY.THROW_ERROR;
  public actions: Action[] = [];

  static configure(options: { adapter?: Adapter<any>, strategy?: STRATEGY }) {
    if (options.adapter) {
      this.adapter = options.adapter;
    }
    if (options.strategy) {
      this.strategy = options.strategy;
    }
  }

  static getAdapter(): Adapter<any> {
    if (!this.adapter) {
      const TypescriptAdapter = require("./typescript-adapter");
      this.adapter = new TypescriptAdapter();
    }
    return this.adapter!;
  }

  constructor(private filePath: string) {}

  append(node: T, code: string) {
    this.actions.push(new AppendAction<T>(node, code).process());
  }

  delete(node: T, selectors: string | string[]) {
    this.actions.push(new DeleteAction<T>(node, selectors).process());
  }

  insert(node: T, code: string, options: InsertOptions) {
    this.actions.push(new InsertAction<T>(node, code, options).process());
  }

  prepend(node: T, code: string) {
    this.actions.push(new PrependAction<T>(node, code).process());
  }

  remove(node: T) {
    this.actions.push(new RemoveAction<T>(node).process());
  }

  replace(node: T, selectors: string | string[], options: ReplaceOptions) {
    this.actions.push(new ReplaceAction<T>(node, selectors, options).process());
  }

  replaceWith(node: T, code: string, options: ReplaceWithOptions = { autoIndent: true }) {
    this.actions.push(new ReplaceWithAction<T>(node, code, options).process());
  }

  process(): { conflict: boolean } {
    let conflictActions = [];
    let source = fs.readFileSync(this.filePath, "utf-8");
    if (this.actions.length > 0) {
      this.actions.sort(this.compareActions);
      conflictActions = this.getConflictActions();
      if (conflictActions.length > 0  && NodeMutation.strategy === STRATEGY.THROW_ERROR) {
        throw new ConflictActionError();
      }
      this.actions.reverse().forEach((action) => {
        source =
          source.slice(0, action.start) +
          action.newCode +
          source.slice(action.end);
      });
      this.actions = [];

      fs.writeFileSync(this.filePath, source);
    }
    return { conflict: conflictActions.length !== 0};
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
    return 0;
  }

  /**
   * Get conflict actions.
   * @private
   * @returns {Action[]} conflict actions
   */
  private getConflictActions(): Action[] {
    let i = this.actions.length - 1;
    let j = i - 1;
    const conflictActions: Action[] = [];
    if (i < 0) return [];

    let beginPos = this.actions[i].start;
    while (j > -1) {
      if (beginPos < this.actions[j].end) {
        conflictActions.push(this.actions.splice(j, 1)[0]);
      } else {
        i = j;
        beginPos = this.actions[i].start;
      }
      j--;
    }
    return conflictActions;
  }
}

export default NodeMutation;