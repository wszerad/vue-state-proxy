import { stateMeta } from './utils';

type Accessors<T> = {
	[K in keyof T]?: T[K] | any
};

type WithOmit<T> = Pick<Accessors<T>, Exclude<keyof T, 'state'>>;

export class State {
	get state(): WithOmit<this> {
		return this[stateMeta];
	}

	set state(newState: WithOmit<this>) {
		this[stateMeta] = newState;
	}
}