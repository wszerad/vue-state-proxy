import { moduleTypeMeta } from './utils/utils';
import { predefineMethods } from './state-manager';
import { methodWrapper } from './wrappers';
import { devtoolHook } from './utils/devtool-hook';

function extractModules<T extends { new(...args: any[]): {} }>(constructor: T) {
	return Reflect.getMetadata(moduleTypeMeta, constructor.prototype) || new Map();
}

export function extend<T extends { new(...args: any[]): {} }>(Constructor: T) {
	const proto = Constructor.prototype;
	const modules = extractModules(Constructor);

	if (devtoolHook.isActive) {
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