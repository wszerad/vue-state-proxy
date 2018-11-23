import 'reflect-metadata';
import Vue from 'vue';
import { extractOptions } from './extractors';
import { isStoreMeta } from './utils';
import { storeWrapper } from './wrappers';

export function Store() {
	return function (Constructor: any) {
		const options = extractOptions(Constructor);

		return class extends Vue {
			constructor() {
				super({...options});
				return storeWrapper(this, options.name);
			}

			static [isStoreMeta] = true;
		} as any;
	}
}