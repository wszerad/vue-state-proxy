import { handleGetter, handleMethod } from './handlers';
import { predefineGetters, predefineMethods } from './predefined';
import { StateOptions, TypesMap } from './types';
import { moduleTypeMeta } from './utils';

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

export function extractOptions<T extends { new(...args: any[]): {} }>(Constructor: T): StateOptions {
	const modules = extractModules(Constructor);
	const proto = Constructor.prototype;
	const options: StateOptions = {
		data() {
			return Object.assign({}, new proto.constructor());
		},
		name: Constructor.name,
		computed: predefineGetters(modules),
		methods: predefineMethods(),
	};

	Object.getOwnPropertyNames(proto)
		.forEach((key) => {
			const descriptor = Object.getOwnPropertyDescriptor(proto, key);

			if (!descriptor || key === 'constructor') {
				return;
			} else if (descriptor.set) {
				throw new Error('Setters are not allowed');
			} else if (typeof descriptor.value === 'function') {
				handleMethod(options, key, descriptor);
			} else if (descriptor.get) {
				handleGetter(options, key, descriptor);
			}
		});

	return options;
}