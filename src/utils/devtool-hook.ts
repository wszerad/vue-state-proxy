class DevtoolHook {
	private hook = (typeof window !== 'undefined') ? (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ : null;
	private active: boolean = !!this.hook;
	private listener: Function;

	emulate() {
		const listener = (action: string, ...args: any[]) => {
			this.listener && this.listener(action, ...args);
		};
		this.hook = new DevtoolHookEmulator(listener);
		this.active = true;
	}

	baypass(listener: Function) {
		this.listener = listener;
	}

	get isActive() {
		return this.active;
	}

	get handler() {
		return this.hook;
	}
}

class DevtoolHookEmulator {
	constructor(
		private listener: Function
	) {}

	on(eventName: string, handler: Function) {}

	emit(eventName: string, ...args: any[]) {
		this.listener(eventName, ...args);
	}
}

export const devtoolHook = new DevtoolHook();