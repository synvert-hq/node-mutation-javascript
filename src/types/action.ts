export type Action = {
  type: string,
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
