import { FunctionsMap, TypesMap } from './types';
import { isStoreMeta, stateMeta } from './utils';

export function predefineGetters(modules: TypesMap): FunctionsMap {
	let getterOverwrite = 'var cache; return {';
	let setterOverwrite = '';

	Object.getOwnPropertyNames(modules)
		.forEach((key) => {
			const type = modules[key];

			if (Array.isArray(type)) {
				const subtype = type[0];
				if (subtype && subtype[isStoreMeta]) {
					getterOverwrite += arrayStateGetter(key);
					setterOverwrite += arraySetter(key, stateTypeSetter);
				} else if (subtype) {
					getterOverwrite += simpleTypeGetter(key);
					setterOverwrite += arraySetter(key, objectTypeSetter);
				} else {
					getterOverwrite += simpleTypeGetter(key);
					setterOverwrite += arraySetter(key, simpleTypeSetter);
				}
			} else if (type && type[isStoreMeta]) {
				getterOverwrite += stateGetter(key);
				setterOverwrite += singleSetter(key, stateTypeSetter);
			} else if (type) {
				getterOverwrite += simpleTypeGetter(key);
				setterOverwrite += singleSetter(key, objectTypeSetter);
			} else {
				getterOverwrite += simpleTypeGetter(key);
				setterOverwrite += singleSetter(key, simpleTypeSetter);
			}
		});

	getterOverwrite += '}';
	setterOverwrite += '';

	const get = new Function(getterOverwrite);
	const set = new Function('data', 'modules', setterOverwrite);

	return {
		[stateMeta]: {
			get,
			set(this: any, newState: any) {
				set.call(this, newState, modules);
			},
		},
	};
}

export function predefineMethods(): FunctionsMap {
	return {};
}

interface Filament {
	stateKey: string;
	target: string;
	source: string;
	module: string;
}

function arrayStateGetter(key: string) {
	return `${key}: this['${key}'].map((i)=>i['${stateMeta}']),`;
}

function stateGetter(key: string) {
	return `${key}: this['${key}']['${stateMeta}'],`
}

function simpleTypeGetter(key: string) {
	return `${key}: this['${key}'],`
}

function singleSetter(key: string, parser: Function) {
	const filament: Filament = {
		stateKey: stateMeta,
		source: `data['${key}']`,
		target: `this['${key}'] =`,
		module: `new modules['${key}']`
	};

	return `
		if('${key}' in data){
			${parser(filament)}
		}
	`;
}

function arraySetter(key: string, parser: Function) {
	const filament: Filament = {
		stateKey: stateMeta,
		source: 'data',
		target: 'return',
		module: `new modules['${key}'][0]`
	};

	return `
		if('${key}' in data){
			this['${key}'] = data['${key}'].map((data) => {
				return ${parser(filament)}
			});
		}
	`;
}

function simpleTypeSetter(filament: Filament) {
	return `${filament.target} ${filament.source};`
}

function objectTypeSetter(filament: Filament) {
	return `${filament.target} (${filament.source} != null) ? ${filament.module}(${filament.source}) : ${filament.source};`;
}

function stateTypeSetter(filament: Filament) {
	return `cache = ${filament.module}(); cache.state = ${filament.source}; ${filament.target} cache;`;
}