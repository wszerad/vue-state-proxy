import { PseudoStore } from './Store';
import { FunctionsMap, TypesMap } from './types';

export function predefineGetters(modules: TypesMap): FunctionsMap {
	let getterOverwrite = 'return {';
	let setterOverwrite = '';

	Object.getOwnPropertyNames(modules)
		.forEach((key) => {
			const type = modules[key];
			if (Array.isArray(type)) {
				getterOverwrite += `${key}: this['${key}'].map((i)=>i.state),`;
				setterOverwrite += `if('${key}' in data){
					this['${key}'] = data['${key}'].map((i) => {
						var m = new modules['${key}'][0](); m.state = i; return m;
					});
				}`;
			} else if (type && type.name === `bound ${PseudoStore.name}`) {
				getterOverwrite += `${key}: this['${key}'].state,`;
				setterOverwrite += `if('${key}' in data){ this['${key}'].state = data['${key}']; }`;
			} else {
				getterOverwrite += `${key}: this['${key}'],`;
				setterOverwrite += `if('${key}' in data){ this['${key}'] = (data['${key}'] != null) ? new modules['${key}'][0](data['${key}']) : data['${key}']; }`;
			}
		});

	getterOverwrite += '}';
	setterOverwrite += '';

	const get = new Function(getterOverwrite);
	const set = new Function('data', 'modules', setterOverwrite);

	return {
		state: {
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