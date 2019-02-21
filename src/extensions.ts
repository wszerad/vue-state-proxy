import { handleMethod } from './handlers';
import { StateOptions, TypesMap } from './types';
import {isStoreMeta, moduleTypeMeta} from './utils';
import {predefineMethods} from './state-manager';

function extractModules<T extends { new(...args: any[]): {} }>(constructor: T) {
	const proto = constructor.prototype;
	const props = new proto.constructor() as any;
	const modules: TypesMap = {};

	Object.getOwnPropertyNames(props)
		.forEach((key) => {
			modules[key] = Reflect.getMetadata(moduleTypeMeta, proto, key);
		});

	return modules;
}

export function extend<T extends { new(...args: any[]): {} }>(Constructor: T) {
	const proto = Constructor.prototype;
	const options: StateOptions = {
		name: Constructor.name,
		modules: extractModules(Constructor),
		proto
	};

	Object.getOwnPropertyNames(proto)
		.forEach((key) => {
			const descriptor = Object.getOwnPropertyDescriptor(proto, key);

			if (!descriptor || key === 'constructor') {
				return;
			} else if (typeof descriptor.value === 'function') {
				handleMethod(options, key, descriptor);
			}
		});
	predefineMethods(options);
	Constructor[isStoreMeta] = true;
}