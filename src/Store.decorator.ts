import 'reflect-metadata';
import Vue from 'vue';
import { extractOptions } from './extractors';
import { PseudoStore } from './Store';

export function Store() {
	return function (constructor) {
		const options = extractOptions(constructor);

		// Vue.extend({
		// 	name: constructor.name,
		// 	data() {
		// 		return Object.assign({}, new constructor.prototype.constructor());
		// 	},
		// 	...options,
		// });
		return PseudoStore.bind(this, constructor, options);
	}
}