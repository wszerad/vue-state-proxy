import { TypesMap } from './utils';
import { devtoolHook, moduleTypeMeta } from './utils';
import { predefineMethods } from './state-manager';
import { methodWrapper } from './wrappers';

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
	const modules = extractModules(Constructor);

	if (devtoolHook) {
		Object.getOwnPropertyNames(proto)
			.forEach((key) => {
				const descriptor = Object.getOwnPropertyDescriptor(proto, key);

				if (!descriptor || key === 'constructor') {
					return;
				} else if (typeof descriptor.value === 'function') {
					const method = descriptor.value;
					proto[key] = methodWrapper(Constructor.name, key, method);
				}
			});
	}
	predefineMethods(proto, modules);
}