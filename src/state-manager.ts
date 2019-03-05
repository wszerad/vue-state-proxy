import { FunctionsMap, isStateMeta, ModuleType, originTargetMeta } from './utils/utils';

export function predefineMethods(proto: FunctionsMap, modules: Map<PropertyKey, ModuleType>) {
	let getterOverwrite = 'return assign({}, this, {\n';
	let setterOverwrite = 'var cache; var overwrites = {};\n';

	Object.getOwnPropertyNames(modules)
		.forEach((key: string) => {
			const {creator, module} = modules[key];
			if (creator === Array) {
				if (module && module[isStateMeta]) {
					getterOverwrite += arrayStateGetter(key);
					setterOverwrite += arraySetter(key, stateTypeSetter);
				} else if (module) {
					getterOverwrite += simpleTypeGetter(key);
					setterOverwrite += arraySetter(key, objectTypeSetter);
				} else {
					getterOverwrite += simpleTypeGetter(key);
					setterOverwrite += arraySetter(key, simpleTypeSetter);
				}
			} else if (module[isStateMeta]) {
				getterOverwrite += stateGetter(key);
				setterOverwrite += singleSetter(key, stateTypeSetter);
			} else {
				setterOverwrite += singleSetter(key, objectTypeSetter);
			}
		});

	getterOverwrite += '})';
	setterOverwrite += 'assign(this, data, overwrites);';

	const set = new Function('data', 'modules', 'assign', setterOverwrite);
	const get = new Function('assign', getterOverwrite);
	proto.setState = function (newState) {
		set.call(this[originTargetMeta] || this, newState, modules, Object.assign);
	};
	proto.getState = function () {
		return get.call(this, Object.assign);
	}
}

interface Filament {
	target: string;
	source: string;
	module: string;
}

function arrayStateGetter(key: string) {
	return `
		${key}: this['${key}'].map(function(i){
			return i.getState();
		}),
	`;
}

function stateGetter(key: string) {
	return `
		${key}: this['${key}'].getState(),
	`;
}

function simpleTypeGetter(key: string) {
	return `
		${key}: this['${key}'],
	`;
}

function singleSetter(key: string, parser: Function) {
	const filament: Filament = {
		source: `data['${key}']`,
		target: `overwrites['${key}'] =`,
		module: `new modules['${key}'].module`
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
		module: `new modules['${key}'].module`
	};

	return `
		if('${key}' in data){
			overwrites['${key}'] = data['${key}'].map(function(data) {
				${parser(filament)}
			});
		}
	`;
}

function simpleTypeSetter(filament: Filament) {
	return `${filament.target} ${filament.source};`;
}

function objectTypeSetter(filament: Filament) {
	return `${filament.target} (${filament.source} != null) ? ${filament.module}(${filament.source}) : ${filament.source};`;
}

function stateTypeSetter(filament: Filament) {
	return `cache = ${filament.module}(); cache.setState(${filament.source}); ${filament.target} cache`;
}
