import { RustOption, RustResult } from 'ts-rust';

// ts-rust's constructors are typed `any`; these typed wrappers are the only
// place that touches them, so swapping the library is a one-file change.
export type Result<T, E> = RustResult<T, E>;
export type Option<T> = RustOption<T>;

export const ok = <T, E = never>(value: T): Result<T, E> =>
  RustResult.Ok(value) as Result<T, E>;

export const err = <E, T = never>(error: E): Result<T, E> =>
  RustResult.Err(error) as Result<T, E>;

export const some = <T>(value: T): Option<T> =>
  RustOption.Some(value) as Option<T>;

export const none = <T>(): Option<T> => RustOption.None as Option<T>;
