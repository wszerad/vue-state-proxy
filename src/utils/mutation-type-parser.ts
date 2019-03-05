export class MutationTypeParser {
	asynchronous = false;
	count: number | false = false;
	methodName: string;

	constructor(
		public className: string,
		public propertyName: string
	) {
	}

	complexType(methodName: string) {
		this.methodName = methodName;
		return this;
	}

	method(count: number) {
		this.methodName = this.propertyName;
		this.propertyName = null;
		this.count = count;
		return this;
	}

	async(async: boolean = true) {
		this.asynchronous = async;
		return this;
	}

	toString() {
		const methodPath = `.${this.methodName}()${this.count===false ? '' : ` #${this.count}`}${this.asynchronous ? ' async' : ''}`;
		return `${this.className}${this.propertyName ? `.${this.propertyName}` : ''}${this.methodName? methodPath: ''}`;
	}
}