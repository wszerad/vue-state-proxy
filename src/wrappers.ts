import { nestedMeta, originTargetMeta, stateMeta } from './utils/utils';
import { mutation, mutationCollector, MutationTrigger } from './utils/mutation-collector';
import { MutationTypeParser } from './utils/mutation-type-parser';

const ArrayMutators = ['push', 'splice', 'pop', 'shift', 'unshift', 'fill', 'sort', 'reverse'];
const NativeCodeRegExp = /native code/;

export function methodWrapper(className: string, methodName: string, method: Function) {
	let counter = 0;

	return function (...args) {
		const num = counter++;
		const type = new MutationTypeParser(className, methodName).method(num);
		const state = this[originTargetMeta] || this;

		if (!state[nestedMeta]) {
			const collector = mutationCollector.create(type, args, state);
			const release = mutationCollector.release(type);
			const wrappedState = setStateWrapper(state, collector, release);
			const ret =  method.apply(wrappedState, args);
			mutationCollector.fire();
			return ret;
		} else {
			return method.apply(state, args);
		}
	};
}

export function storeWrapper(Constructor) {
	return new Proxy(Constructor, {
		construct(target: any, args: any): object {
			const instance = Reflect.construct(target, args);
			return new Proxy(instance, {
				get(target: any, key: PropertyKey, receiver: any) {
					if (key === originTargetMeta) {
						return target;
					}

					if (key === stateMeta) {
						return target.getState();
					}

					if (target[key] instanceof Array) {
						return complexTypeTrap(target[key], ArrayMutators, complexTypeMutator(Constructor.name, key, target));
					}

					return target[key];
				},
				set(target: any, key: PropertyKey, value: any, receiver: any) {
					if (key === stateMeta) {
						receiver.setState(value);
						return true;
					}

					const type = new MutationTypeParser(Constructor.name, key as string);
					mutation(type, value, instance);
					return Reflect.set(target, key, value);
				}
			});
		}
	});
}

function setStateWrapper(state: any, mutation: MutationTrigger, preset: () => void) {
	let fired = false;

	return new Proxy(state, {
		get(target: any, key: PropertyKey, receiver: any) {
			if (key === nestedMeta) {
				return true;
			}

			if (target[key] instanceof Array) {
				return complexTypeTrap(target[key], ArrayMutators, mutation);
			}

			return target[key];
		},
		set(target: any, key: PropertyKey, value: any, receiver: any): boolean {
			preset();
			Reflect.set(target, key, value);
			mutation(key as string, value, fired);
			fired = true;
			return true;
		}
	});
}

export function complexTypeTrap(type: any[], modifiers: PropertyKey[], mutation: MutationTrigger) {
	return new Proxy(type, {
		get(target: any[], key: PropertyKey, receiver: any): any {
			if (modifiers.includes(key)) {
				return new Proxy(target[key], {
					apply(target: Function, thisArg: any, argArray?: any): any {
						const ret = type[key].apply(thisArg, argArray);
						// avoid VUE mutator
						try {
							if (NativeCodeRegExp.test(target.toString())) {
								mutation(key as string, argArray);
							}
						} catch (e) {
							// sometimes toString() of native function is broken
							mutation(key as string, argArray);
						}

						return ret;
					}
				});
			}

			return target[key];
		}
	});
}

function complexTypeMutator(className: string, propertyName: PropertyKey, state: any) {
	return (methodName, value) => {
		const type = new MutationTypeParser(className, propertyName as string).complexType(methodName);
		mutation(type, value, state);
	};
}