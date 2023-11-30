import NodeMutation from "./node-mutation";
import Adapter from "./adapter";
import Strategy from "./strategy";
import { NotSupportedError, ConflictActionError } from "./error";
import type { InsertOptions, ReplaceOptions, DeleteOptions, RemoveOptions } from "./types/action";
import type { ProcessResult, TestResult } from "./types/node-mutation";

export default NodeMutation;
export {
  Adapter,
  Strategy,
  NotSupportedError,
  ConflictActionError,
  InsertOptions,
  ReplaceOptions,
  DeleteOptions,
  RemoveOptions,
  ProcessResult,
  TestResult
};
