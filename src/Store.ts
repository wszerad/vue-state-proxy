import Vue from 'vue';
import { storeWrapper } from './wrappers';

export function PseudoStore(constructor, options) {
	const instance = Vue.extend({
		name: constructor.name,
		data() {
			return Object.assign({}, new constructor.prototype.constructor());
		},
		...options,
	});

	return storeWrapper(new instance(), constructor.name);
}