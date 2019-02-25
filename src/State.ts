import { isStateMeta } from './utils';

export class State {
	setState(value: any): void {}
	getState(): any {
		return this;
	}

	static [isStateMeta] = true;
}