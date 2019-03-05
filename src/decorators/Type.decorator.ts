import 'reflect-metadata';
import { ModuleType, moduleTypeMeta } from '../utils/utils';

export function Type(module: any, complexType?: any) {
	return function (target: any, key: string) {
		const type = Reflect.getMetadata('design:type', target, key);
		const creator = (typeof type === 'function' && type.name === 'Array') ? Array : complexType;

		let modules: { [key: string]: ModuleType };
		if (Reflect.hasMetadata(moduleTypeMeta, target)) {
			modules = Reflect.getMetadata(moduleTypeMeta, target);
		} else {
			modules = {};
			Reflect.defineMetadata(moduleTypeMeta, modules, target);
		}

		modules[key] = {
			creator,
			module
		};
	};
}