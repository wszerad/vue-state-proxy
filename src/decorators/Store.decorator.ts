import 'reflect-metadata';
import { extend } from '../extensions';
import { StateManagerConstructor } from '../utils/utils';
import { storeWrapper } from '../wrappers';
import { devtoolHook } from '../utils/devtool-hook';

export function Store() {
	return function <T extends StateManagerConstructor>(Constructor: T) {
		extend(Constructor);

		if (devtoolHook.isActive) {
			return storeWrapper(Constructor);
		}

		return Constructor;
	};
}