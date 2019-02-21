import {
	devtoolHook,
	getStateMeta,
	mutation,
	mutationCollector,
	originTargetMeta,
	setStateMeta,
	stateMeta
} from './utils';

export function afterEffectsWrapper(name: string, payload: any, state: any) {
	const collector = mutationCollector.create(name, payload, state);
	const release = mutationCollector.release(name);
	return stateWrapper(state, collector, release);
}

export function methodWrapper(storeName: string, name: string, method: Function) {
	let counter = 0;

	return function(...args) {
		const num = counter++;
		const label = `${storeName}.${name}(#${num})`;
		const wrappedState = afterEffectsWrapper(label, args, this[originTargetMeta]);

		method.apply(wrappedState, ...args);
	};
}

function stateWrapper(state: any, mutation: (key: string, value: any) => void, preset?: () => void) {
	return new Proxy(state, {
		set(target, key, value) {
			preset && preset();
			Reflect.set(target, key, value);
			mutation(key as string, value);
			return true;
		}
	});
}

export function storeWrapper(store: any, storeName: string) {
	if (!devtoolHook) {
		return store;
	}

	return new Proxy(store, {
		get(target, key) {
			if (key === originTargetMeta) {
				return target;
			}

			if(key === stateMeta) {
				return target[getStateMeta]();
			}

			return target[key];
		},
		set(target, key, value, receiver) {
			if (key === stateMeta) {
				receiver[setStateMeta](value);
				return true;
			}

			mutation(`${storeName}.${key as string}`, value, store);
			return Reflect.set(target, key, value);
		}
	});
}
