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
