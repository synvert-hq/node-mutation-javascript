import NodeMutation, { STRATEGY } from "./node-mutation";
import { NotSupportedError, ConflictActionError } from "./error";
import { InsertOptions, ReplaceWithOptions, ReplaceOptions } from "./types";

export default NodeMutation;
export { STRATEGY, NotSupportedError, ConflictActionError, InsertOptions, ReplaceWithOptions, ReplaceOptions };