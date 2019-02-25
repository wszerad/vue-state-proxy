import { State } from './State';

export const stateMeta = 'state';
export const originTargetMeta = Symbol('origin');
export const moduleTypeMeta = Symbol('module');
export const isStateMeta = Symbol('state');
export const devtoolHook = typeof window !== 'undefined' && (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__;

export interface StateManagerConstructor {
	new(...args: any[]): State;
}

export interface WithState {
	state: this;
}

export interface TypesMap {
	[key: string]: any;
}

export interface FunctionsMap {
	[key: string]: Function;
}

type MutationAction = () => void;

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type Props<P> = {[key in keyof P]: P[key]};

class MutationCollector {
	private timeout: number | null = null;
	private mutation: MutationAction | null = null;
	private mutationActionId: string | null = null;

	create(name: string, payload: any, state: any) {
		const action = () => {mutation(name, payload, state)};

		return () => {
			if (this.timeout !== null) {
				clearTimeout(this.timeout);
			}

			this.mutation = action;
			this.mutationActionId = name;
			this.timeout = setTimeout(() => {
				this.fire(action);
			}, 0);
		}
	}

	fire(action?: Function) {
		if (this.timeout !== null) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}

		action ? action() : this.mutation && this.mutation();
		this.mutation = null;
		this.mutationActionId = null;
	}

	release(id: string) {
		return () => {
			if (this.mutationActionId !== id) {
				this.fire();
			}
		};
	}
}

export const mutationCollector = new MutationCollector();
export function mutation(name: string, payload: any, state: any) {
	devtoolHook.emit(
		'vuex:mutation',
		{type: name, payload: payload},
		state
	);
}
