import NodeMutation from "./node-mutation";
import Adapter from "./adapter";
import Strategy from "./strategy";
import TypescriptAdapter from "./adapter/typescript";
import EspreeAdapter from "./adapter/espree";
import { NotSupportedError, ConflictActionError } from "./error";
import type { InsertOptions, ReplaceOptions } from "./types/action";
import type { ProcessResult, TestResult } from "./types/node-mutation";

export default NodeMutation;
export {
  Adapter,
  TypescriptAdapter,
  EspreeAdapter,
  Strategy,
  NotSupportedError,
  ConflictActionError,
  InsertOptions,
  ReplaceOptions,
  ProcessResult,
  TestResult
};
