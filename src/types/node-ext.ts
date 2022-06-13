import { Node } from "typescript";

export type NodeExt = Node & { [index: string]: NodeExt | NodeExt[] };

export type NodeArrayExt = NodeExt[] & {
  [index: string]: NodeExt | (() => NodeExt);
};
