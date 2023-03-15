import { Node as TypescriptNode } from "typescript";
import { Node as EspreeNode } from "acorn";

export type TypescriptNodeExt = TypescriptNode & { [index: string]: TypescriptNodeExt | TypescriptNodeExt[] };

export type TypescriptNodeArrayExt = TypescriptNodeExt[] & {
  [index: string]: TypescriptNodeExt | (() => TypescriptNodeExt);
};

export type EspreeNodeExt = EspreeNode & { [index: string]: EspreeNodeExt | EspreeNodeArrayExt };

export type EspreeNodeArrayExt = EspreeNodeExt[] & {
  [index: string]: EspreeNodeExt | (() => { start: number; end: number });
};

export type Action = {
  start: number,
  end: number,
  newCode?: string
};

export type POSITION = "beginning" | "end";

export type InsertOptions = {
  at?: POSITION,
  to?: string
}

export type ReplaceOptions = {
  with: string
}

export type ProcessResult = {
  affected: boolean,
  conflicted: boolean,
  newSource?: string
}

export type TestResult = {
  affected: boolean,
  conflicted: boolean,
  actions: Action[]
}
