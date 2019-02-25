import {
	mutation,
	mutationCollector,
	originTargetMeta,
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

export function storeWrapper(Constructor) {
	return new Proxy(Constructor, {
		construct(target: any, args: any): object {
			const instance = Reflect.construct(target, args);
			return new Proxy(instance, {
				get(target, key) {
					if (key === originTargetMeta) {
						return target;
					}

					if(key === stateMeta) {
						return target.getState();
					}

					return target[key];
				},
				set(target, key, value, receiver) {
					if (key === stateMeta) {
						receiver.setState(value);
						return true;
					}

					mutation(`${Constructor.name}.${key as string}`, value, instance);
					return Reflect.set(target, key, value);
				}
			});
		}
	});
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
