import Vue, * as vue from 'vue';
import { State } from './src/State';
import { StateManagerConstructor, stateMeta, WithState } from './src/utils/utils';
import { devtoolHook } from './src/utils/devtool-hook';

export { mutationCollector } from './src/utils/mutation-collector';
export { Type } from './src/decorators/Type.decorator';
export { Store } from './src/decorators/Store.decorator';
export { State };

export function createStateManager<S extends StateManagerConstructor>(Store: S) {
	const observable = (Vue && Vue.observable) || (vue as any).observable;
	const store = observable(new (Store as any)());

	if (devtoolHook.isActive) {
		devtoolHook.handler.emit('vuex:init', store);
		devtoolHook.handler.on('vuex:travel-to-state', (targetState: any) => {
			(store as any)[stateMeta] = targetState;
		});
	}

	return store as WithState & InstanceType<S>;
}