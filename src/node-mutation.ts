import { Node } from "typescript";
import Adapter from "./adapter";

interface InsertOptions {
  at: string;
  to?: string;
}

class NodeMutation {
  private static adapter?: Adapter<any>;

  static configure(adapter: Adapter<any>) {
    this.adapter = adapter;
  }

  static getAdapter(): Adapter<any> {
    if (!this.adapter) {
      const TypescriptAdapter = require("./typescript-adapter");
      this.adapter = new TypescriptAdapter();
    }
    return this.adapter!;
  }

  constructor(private filepath: string) {}

  insert(node: Node, code: string, options: InsertOptions) {

  }

  process() {

  }
}

export default NodeMutation;