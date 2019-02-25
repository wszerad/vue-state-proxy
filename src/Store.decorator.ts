import 'reflect-metadata';
import { extend } from './extensions';
import { devtoolHook, StateManagerConstructor } from './utils';
import { storeWrapper } from './wrappers';

export function Store() {
	return function<T extends StateManagerConstructor> (Constructor: T) {
		extend(Constructor);

		if (devtoolHook) {
            return storeWrapper(Constructor);
		}

		return Constructor;
	}
}