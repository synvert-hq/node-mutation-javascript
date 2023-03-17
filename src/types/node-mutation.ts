import type { Action } from "./action";

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
