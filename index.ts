import Vue from 'vue';
import { State } from './src/State';
import {devtoolHook, stateMeta} from './src/utils';

export {Type} from './src/Type.decorator';
export {Store} from './src/Store.decorator';
export {State};

export function createStateManager<S, T extends { new(...args: any[]): S }>(Store: T): State | S {
	const store = Vue.observable(new Store());

	if (devtoolHook) {
		devtoolHook.emit('vuex:init', store);
		devtoolHook.on('vuex:travel-to-state', (targetState: any) => {
			(store as any)[stateMeta] = targetState;
		});
	}

	console.log(store);
	return store as any;
}