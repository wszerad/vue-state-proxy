export const moduleTypeMeta = Symbol('module');
export const isStoreMeta = Symbol('store');
export const stateMeta = '__state';
export const devtoolHook = typeof window !== 'undefined' && (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__;

type MutationAction = () => void;

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