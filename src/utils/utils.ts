import { State } from '../State';

export const stateMeta = 'state';
export const nestedMeta = Symbol('nested');
export const originTargetMeta = Symbol('origin');
export const moduleTypeMeta = Symbol('module');
export const isStateMeta = Symbol('state');

export interface StateManagerConstructor {
	new(...args: any[]): State;
}

export interface WithState {
	state: this;
}

export interface FunctionsMap {
	[key: string]: Function;
}

export interface ModuleType {
	creator: any;
	module: any;
}

