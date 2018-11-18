import { StateOptions } from './types';
import { methodWrapper } from './wrappers';

export function handleGetter(option: StateOptions, key: string, descriptor: PropertyDescriptor) {
	option.computed[key] = descriptor.get;
}

export function handleMethod(option: StateOptions, key: string, descriptor: PropertyDescriptor) {
	const method = descriptor.value;
	option.methods[key] = methodWrapper(option.name, key, method);
}