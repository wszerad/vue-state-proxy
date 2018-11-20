import 'reflect-metadata';
import Vue from 'vue';
import { extractOptions } from './extractors';
import { isStoreMeta } from './utils';
import { storeWrapper } from './wrappers';

export function Store() {
	return function (constructor) {
		const options = extractOptions(constructor);

		return class extends Vue {
			constructor() {
				super({
					name: constructor.name,
					data() {
						return Object.assign({}, new constructor.prototype.constructor());
					},
					...options,
				});

				return storeWrapper(this, constructor.name);
			}

			static [isStoreMeta] = true;
		} as any
	}
}