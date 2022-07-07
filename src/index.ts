import NodeMutation, { STRATEGY } from "./node-mutation";
import Adapter from "./adapter";
import { NotSupportedError, ConflictActionError } from "./error";
import { InsertOptions, ReplaceWithOptions, ReplaceOptions, ProcessResult } from "./types";

export default NodeMutation;
export {
  Adapter,
  STRATEGY,
  NotSupportedError,
  ConflictActionError,
  InsertOptions,
  ReplaceWithOptions,
  ReplaceOptions,
  ProcessResult
};