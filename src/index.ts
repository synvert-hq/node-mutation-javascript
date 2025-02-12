import NodeMutation from "./node-mutation";
import Adapter from "./adapter";
import Strategy from "./strategy";
import TypescriptAdapter from "./adapter/typescript";
import GonzalesPeAdapter from "./adapter/gonzales-pe";
import EspreeAdapter from "./adapter/espree";
import { NotSupportedError, ConflictActionError } from "./error";
import type { IndentOptions, InsertOptions, ReplaceOptions, DeleteOptions, RemoveOptions } from "./types/action";
import type { ProcessResult, TestResult } from "./types/node-mutation";

export default NodeMutation;
export {
  Adapter,
  TypescriptAdapter,
  EspreeAdapter,
  GonzalesPeAdapter,
  Strategy,
  NotSupportedError,
  ConflictActionError,
  IndentOptions,
  InsertOptions,
  ReplaceOptions,
  DeleteOptions,
  RemoveOptions,
  ProcessResult,
  TestResult
};
