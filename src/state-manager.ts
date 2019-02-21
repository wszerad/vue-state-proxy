import {StateOptions} from './types';
import {getStateMeta, isStoreMeta, originTargetMeta, setStateMeta} from './utils';

export function predefineMethods(option: StateOptions) {
	let getterOverwrite = 'var cache; return {';
	let setterOverwrite = '';

	Object.getOwnPropertyNames(option.modules)
		.forEach((key) => {
			const type = option.modules[key];

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

	const set = new Function('data', 'modules', setterOverwrite);
	option.proto[setStateMeta] = function (newState) {
		set.call(this[originTargetMeta], newState, option.modules);
	};
	option.proto[getStateMeta] = new Function(getterOverwrite);
}

interface Filament {
	stateKey: string;
	target: string;
	source: string;
	module: string;
}

function arrayStateGetter(key: string) {
	return `${key}: this['${key}'].map((i)=>i['${getStateMeta}']()),`;
}

function stateGetter(key: string) {
	return `${key}: this['${key}']['${getStateMeta}'](),`
}

function simpleTypeGetter(key: string) {
	return `${key}: this['${key}'],`
}

function singleSetter(key: string, parser: Function) {
	const filament: Filament = {
		stateKey: setStateMeta,
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
		stateKey: setStateMeta,
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
	return `cache = ${filament.module}(); cache['${filament.stateKey}'](${filament.source}); ${filament.target} cache;`;
}