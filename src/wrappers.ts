import { devtoolHook, mutation, mutationCollector, stateMeta } from './utils';

export function afterEffectsWrapper(name: string, payload: any, state: any) {
	const collector = mutationCollector.create(name, payload, state);
	const release = mutationCollector.release(name);
	return stateWrapper(state, collector, release);
}

export function methodWrapper(storeName: string, name: string, method: Function) {
	if (!devtoolHook) {
		return method;
	}

	let counter = 0;

	return function(...args) {
		const num = counter++;
		const label = `${storeName}.${name}(#${num})`;
		const wrappedState = afterEffectsWrapper(label, args, this);

		method.apply(wrappedState, ...args);
	};
}

export function storeWrapper(store: any, storeName: string) {
	if (!devtoolHook) {
		return store;
	}

	return stateWrapper(store, (key, value) => {
		mutation(`${storeName}.${key}`, value, store)
	});
}

function stateWrapper(state: any, mutation: (key: string, value: any) => void, preset?: () => void) {
	return new Proxy(state, {
		set(target, key, value) {
			preset && preset();
			target[key] = value;

			if (key === stateMeta) {
				return true;
			}

			mutation(key as string, value);

			return true;
		}
	});
}