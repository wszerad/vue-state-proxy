import 'reflect-metadata';
import { extend } from './extensions';
import {devtoolHook} from './utils';
import {storeWrapper} from './wrappers';

export function Store() {
	return function (Constructor: any) {
		extend(Constructor);

		if (devtoolHook) {
			return new Proxy(Constructor, {
				construct(target: any, args: any): object {
					return storeWrapper(Reflect.construct(target, args), Constructor.name);
				}
			});
		}

		return Constructor;
	}
}