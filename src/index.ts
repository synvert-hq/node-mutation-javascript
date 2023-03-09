import NodeMutation from "./node-mutation";
import Adapter from "./adapter";
import Strategy from "./strategy";
import TypescriptAdapter from "./typescript-adapter";
import { NotSupportedError, ConflictActionError } from "./error";
import { InsertOptions, ReplaceOptions, ProcessResult, TestResult } from "./types";

export default NodeMutation;
export {
  Adapter,
  TypescriptAdapter,
  Strategy,
  NotSupportedError,
  ConflictActionError,
  InsertOptions,
  ReplaceOptions,
  ProcessResult,
  TestResult
};
