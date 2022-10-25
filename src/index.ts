import NodeMutation, { Strategy } from "./node-mutation";
import Adapter from "./adapter";
import TypescriptAdapter from "./typescript-adapter";
import { NotSupportedError, ConflictActionError } from "./error";
import { InsertOptions, ReplaceWithOptions, ReplaceOptions, ProcessResult, TestResult } from "./types";

export default NodeMutation;
export {
  Adapter,
  TypescriptAdapter,
  Strategy,
  NotSupportedError,
  ConflictActionError,
  InsertOptions,
  ReplaceWithOptions,
  ReplaceOptions,
  ProcessResult,
  TestResult
};
