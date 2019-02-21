import {getStateMeta, setStateMeta} from './utils';

export class State {
	[setStateMeta](value: any): void {}
	[getStateMeta](): this {
		return this;
	}
}