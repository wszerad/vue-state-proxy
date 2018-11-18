type Accessors<T> = {
	[K in keyof T]?: T[K] | any
};

type WithOmit<T> = Pick<Accessors<T>, Exclude<keyof T, 'state'>>;

export class State {
	get state(): WithOmit<this> {
		return this as any;
	}

	set state(newState: WithOmit<this>) {}
}