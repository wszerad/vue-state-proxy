import Vue, * as vue from 'vue';
import { State } from './src/State';
import { devtoolHook, StateManagerConstructor, stateMeta, WithState } from './src/utils';

export { Type } from './src/Type.decorator';
export { Store } from './src/Store.decorator';
export { State };

export function createStateManager<S extends StateManagerConstructor>(Store: S) {
	const observable = (Vue && Vue.observable) || (vue as any).observable;
	const store = observable(new (Store as any)());

	if (devtoolHook) {
		devtoolHook.emit('vuex:init', store);
		devtoolHook.on('vuex:travel-to-state', (targetState: any) => {
			(store as any)[stateMeta] = targetState;
		});
	}

	return store as WithState & InstanceType<S>;
}