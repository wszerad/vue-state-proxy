export const moduleTypeMeta = Symbol('module');
export const silentMeta = Symbol('silent');
export const originMeta = 'origin';
export const devtoolHook = typeof window !== 'undefined' && (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__;

class MutationCollector {
	private timeout: number = null;
	private mutation = null;
	private mutationActionId = null;

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