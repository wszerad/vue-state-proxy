import { devtoolHook } from './devtool-hook';
import { MutationTypeParser } from './mutation-type-parser';

export type MutationTrigger = (key: string, value: any, async?: boolean) => void;
type MutationAction = () => void;

class MutationCollector {
	private timeout: number | null = null;
	private mutation: MutationAction | null = null;
	private mutationActionId: string | null = null;

	create(type: MutationTypeParser, payload: any, state: any) {
		return (key: string, value: any, async?: boolean) => {
			const name = type.toString();

			if (name === this.mutationActionId) {
				return;
			}

			if (this.timeout !== null) {
				clearTimeout(this.timeout);
			}

			const action = () => {
				if (async) {
					type.async(true);
				}
				mutation(type, payload, state);
			};

			this.mutation = action;
			this.mutationActionId = name;
			this.timeout = setTimeout(() => {
				this.fire(action);
			}, 0);
		};
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

	release(type: MutationTypeParser) {
		return () => {
			if (this.mutationActionId !== type.toString()) {
				this.fire();
			}
		};
	}
}

export const mutationCollector = new MutationCollector();

export function mutation(type: MutationTypeParser, payload: any, state: any) {
	devtoolHook.handler.emit(
		'vuex:mutation',
		{
			type: type.toString(),
			payload: payload
		},
		state
	);
}