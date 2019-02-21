import { StateOptions } from './types';
import { methodWrapper } from './wrappers';
import { devtoolHook } from './utils';

export function handleMethod(option: StateOptions, key: string, descriptor: PropertyDescriptor) {
	const method = descriptor.value;
	option.proto[key] = devtoolHook ? methodWrapper(option.name, key, method) : method;
}