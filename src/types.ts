import { Node } from "typescript";

export type NodeExt = Node & { [index: string]: NodeExt | NodeExt[] };

export type NodeArrayExt = NodeExt[] & {
  [index: string]: NodeExt | (() => NodeExt);
};

export type Action = {
  start: number,
  end: number,
  rewrittenCode: string
};

export type InsertOptions = {
  at: string,
  to?: string
}

export type ReplaceWithOptions = {
  autoIndent: boolean
}

export type ReplaceOptions = {
  with: string
}
