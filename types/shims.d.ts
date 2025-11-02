declare interface ProcessEnv {
  [key: string]: string | undefined;
}

declare interface ProcessShape {
  env: ProcessEnv;
  cwd(): string;
}

declare const process: ProcessShape;

declare module "process" {
  const value: ProcessShape;
  export = value;
}

declare module "node:process" {
  const value: ProcessShape;
  export = value;
}

declare module "path" {
  export function resolve(...paths: string[]): string;
  export function isAbsolute(path: string): boolean;
}

declare module "node:path" {
  export * from "path";
}

declare interface RunResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

declare interface Statement<Params = unknown[], Row = unknown> {
  run(...params: Params): RunResult;
  get(...params: Params): Row | undefined;
  all(...params: Params): Row[];
}

declare class BetterSqlite3Database {
  constructor(filename: string);
  prepare<Params = unknown[], Row = unknown>(sql: string): Statement<Params, Row>;
  exec(sql: string): void;
  pragma(value: string): void;
}

declare module "better-sqlite3" {
  export default BetterSqlite3Database;
  export type Database = BetterSqlite3Database;
  export type Statement = Statement;
}
