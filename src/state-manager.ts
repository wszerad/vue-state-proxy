import { FunctionsMap, isStateMeta, originTargetMeta, TypesMap } from './utils';

export function predefineMethods(proto: FunctionsMap, modules: TypesMap) {
	let getterOverwrite = 'return {';
	let setterOverwrite = 'var cache;';

	Object.getOwnPropertyNames(modules)
		.forEach((key) => {
			const type = modules[key];

			if (Array.isArray(type)) {
				const subtype = type[0];
				if (subtype && subtype[isStateMeta]) {
					getterOverwrite += arrayStateGetter(key);
					setterOverwrite += arraySetter(key, stateTypeSetter);
				} else if (subtype) {
					getterOverwrite += simpleTypeGetter(key);
					setterOverwrite += arraySetter(key, objectTypeSetter);
				} else {
					getterOverwrite += simpleTypeGetter(key);
					setterOverwrite += arraySetter(key, simpleTypeSetter);
				}
			} else if (type && type[isStateMeta]) {
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

	const set = new Function('data', 'modules', setterOverwrite);
	proto.setState = function (newState) {
		set.call(this[originTargetMeta] || this, newState, modules);
	};
	proto.getState = new Function(getterOverwrite);
}

interface Filament {
	target: string;
	source: string;
	module: string;
}

function arrayStateGetter(key: string) {
	return `${key}: this['${key}'].map((i)=>i.getState()),`;
}

function stateGetter(key: string) {
	return `${key}: this['${key}'].getState(),`
}

function simpleTypeGetter(key: string) {
	return `${key}: this['${key}'],`
}

function singleSetter(key: string, parser: Function) {
	const filament: Filament = {
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
		source: 'data',
		target: 'return',
		module: `new modules['${key}'][0]`
	};

	return `
		if('${key}' in data){
			this['${key}'] = data['${key}'].map((data) => {
				${parser(filament)}
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
	return `cache = ${filament.module}(); cache.setState(${filament.source}); ${filament.target} cache;`;
}