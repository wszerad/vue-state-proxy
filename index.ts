import { State } from './src/State';
import { devtoolHook, stateMeta } from './src/utils';

export {Type} from './src/Type.decorator';
export {Store} from './src/Store.decorator';
export {State};

export function createStateManager<T extends { new(...args: any[]): {} }>(Store: T) {
	const store = new Store();

	if (devtoolHook) {
		const devProxy = new Proxy(store, {
			get(target: any, key) {
				if (key === 'state') {
					return target[stateMeta];
				}
				return target[key];
			}
		});
		devtoolHook.emit('vuex:init', devProxy);
		devtoolHook.on('vuex:travel-to-state', (targetState: any) => {
			(store as any)[stateMeta] = targetState;
		});
	}

	return store;
}