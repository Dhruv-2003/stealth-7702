/* tslint:disable */
/* eslint-disable */
/**
 * @param {string} stealth_meta_address
 * @returns {any}
 */
export function new_stealth_address(stealth_meta_address: string): any;
/**
 * @param {string} pks
 * @param {string} pkv
 * @returns {string}
 */
export function get_stealth_meta_address(pks: string, pkv: string): string;
/**
 * @param {string} stealth_address
 * @param {string} ephemeral_pubkey
 * @param {string} viewing_key
 * @param {string} spending_key
 * @param {number} view_tag
 * @returns {boolean}
 */
export function check_stealth(stealth_address: string, ephemeral_pubkey: string, viewing_key: string, spending_key: string, view_tag: number): boolean;
/**
 * @param {string} spending_key
 * @param {string} viewing_key
 * @param {string} stealth_address
 * @param {string} ephemeral_pubkey
 * @returns {string}
 */
export function reveal_stealth_key(spending_key: string, viewing_key: string, stealth_address: string, ephemeral_pubkey: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly new_stealth_address: (a: number, b: number) => Array;
  readonly get_stealth_meta_address: (a: number, b: number, c: number, d: number) => Array;
  readonly check_stealth: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => Array;
  readonly reveal_stealth_key: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => Array;
  readonly __wbindgen_export_0: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
