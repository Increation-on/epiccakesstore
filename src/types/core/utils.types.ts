export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object 
    ? DeepPartial<T[P]> 
    : T[P];
};

export type WithId = {
  id: number | string;
};

export type Timestamp = {
  createdAt: Date;
  updatedAt: Date;
};