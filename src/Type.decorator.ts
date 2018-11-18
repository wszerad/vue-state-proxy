import 'reflect-metadata';
import { moduleTypeMeta } from './utils';

export function Type(module: any) {
	return function (target: any, key: string) {
		const type = Reflect.getMetadata('design:type', target, key);
		module = (typeof type === 'function' && type.name === 'Array') ? [module] : module;
		Reflect.defineMetadata(moduleTypeMeta, module, target, key);
	};
}