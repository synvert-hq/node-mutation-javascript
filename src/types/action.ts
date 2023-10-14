export type Action = {
  type: string;
  start: number;
  end: number;
  newCode?: string;
  conflictPosition?: number; // insert position when insert at the same position
  actions?: Action[];
};

export type POSITION = "beginning" | "end";

export type InsertOptions = {
  at?: POSITION;
  to?: string;
  andComma?: boolean;
  andSpace?: boolean;
  conflictPosition?: number; // insert position when insert at the same position
}

export type ReplaceOptions = {
  with: string;
}

export type DeleteOptions = {
  wholeLine?: boolean;
  andComma?: boolean;
}

export type RemoveOptions = {
  andComma?: boolean;
}
