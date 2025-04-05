export type DateFieldsMap<T extends object> = T extends Array<infer U>
? U extends object 
  ? DateFieldsMap<U>
  : never
: {
    [P in keyof T]?: T[P] extends Date | undefined ? true : never;
  };