import { devtoolHook } from '../vue-depot/src/devtools';
import { State } from './src/State';

export {Type} from './src/Type.decorator';
export {Store} from './src/Store.decorator';
export {State};

let registered = false;
export function createStateManager<T extends { new(...args: any[]): {} }>(Store: T) {
	if (registered) {
		throw new Error('Store already registered!');
	}

	registered = true;

	const store = new Store();

	if (devtoolHook) {
		devtoolHook.emit('vuex:init', store);
		devtoolHook.on('vuex:travel-to-state', (targetState: any) => {
			(store as any).$data.state = targetState;
		});
	}

	return store;
}