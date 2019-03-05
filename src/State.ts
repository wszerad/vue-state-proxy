import { isStateMeta } from './utils/utils';

export class State {
	static [isStateMeta] = true;

	setState(value: any): void {
	}

	getState(): any {
		return this;
	}
}