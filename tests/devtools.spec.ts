import 'mocha';
import { expect } from 'chai';
import { Store } from '../src/decorators/Store.decorator';
import { createStateManager, State } from '../index';
import { devtoolHook } from '../src/utils/devtool-hook';
import { MutationTypeParser } from '../src/utils/mutation-type-parser';
import { mutationCollector } from '../src/utils/mutation-collector';
devtoolHook.emulate();

enum Fields {
	simpleType = 'simpleType',
	simpleArray = 'simpleArray',
	nestedModel = 'nestedModel',
	nestedArrayWithModel = 'nestedArrayWithModel',
}

enum Methods {
	simpleTypeChange = 'simpleTypeChange',
	simpleArrayChange = 'simpleArrayChange',
	modelChange = 'nestedModelChange',
	modelArrayChange = 'nestedArrayWithModelChange',
	nestedElementModuleChange = 'nestedElementModuleChange',
	nestedTrigger = 'nestedTrigger',
	asynchronousChanges = 'asynchronousChanges',
	asynchronousMod = 'asynchronousMod',
}

@Store()
class Model extends State {
	[Fields.simpleType]: string = '';

	[Methods.simpleTypeChange](payload: string) {
		this.simpleType += payload;
	}
}

@Store()
class Root extends State {
	[Fields.simpleType]: string = '';
	[Fields.simpleArray]: string[] = [];
	[Fields.nestedModel]: Model = new Model();
	[Fields.nestedArrayWithModel]: Model[] = [new Model()];

	[Methods.simpleTypeChange](payload: string) {
		this.simpleType += payload;
	}

	[Methods.simpleArrayChange](payload: string) {
		this.simpleArray.push(payload);
	}

	[Methods.modelChange](payload: Model) {
		this.nestedModel = payload;
	}

	[Methods.modelArrayChange](payload: Model) {
		this.nestedArrayWithModel.push(payload);
	}

	[Methods.nestedElementModuleChange](payload: string) {
		this.nestedArrayWithModel[0].simpleType += payload;
	}

	[Methods.nestedTrigger](payload: string) {
		this.nestedModel.simpleTypeChange(payload);
	}

	[Methods.asynchronousChanges](a: string, b: string) {
		this[Fields.simpleType] += a;
		return new Promise((resolve) => {
			setTimeout(() => {
				this[Fields.simpleType] += b;
				resolve();
			}, 5);
		});
	}

	[Methods.asynchronousMod](trigger1: Function, trigger2: Function) {
		trigger1();

		return new Promise((resolve) => {
			setTimeout(() => {
				trigger2();
				resolve();
			}, 5);
		});
	}
}

describe('DevTools', () => {
	let initialized, events;

	beforeEach(() => {
		initialized = false;
		events = [];

		devtoolHook.baypass((event, ...args) => {
			if (event === 'vuex:init') {
				initialized = true;
			} else if (event === 'vuex:mutation') {
				const {type, payload} = args[0];
				events.push({
					type, payload
				});
			}
		});
	});

	it('should init', () => {
		createStateManager(Root);
		expect(initialized).to.be.equal(true);
	});

	it('should emit direct mutation', () => {
		const Store = createStateManager(Root);
		Store[Fields.simpleType] += 's';

		expect(events.length).to.be.equal(1);
		expect(events[0].type).to.be.equal(new MutationTypeParser(Root.name, Fields.simpleType).toString());
		expect(events[0].payload).to.be.eql('s');
	});

	it('should emit direct mutation of complexType', () => {
		const Store = createStateManager(Root);
		Store[Fields.simpleArray].push('s');

		expect(events.length).to.be.equal(1);
		expect(events[0].type).to.be.equal(new MutationTypeParser(Root.name, Fields.simpleArray).complexType('push').toString());
		expect(events[0].payload).to.be.eql(['s']);
	});

	it('should emit direct mutation of nested model', () => {
		const Store = createStateManager(Root);
		const payload = new Model();
		Store[Fields.nestedModel] = payload;

		expect(events.length).to.be.equal(1);
		expect(events[0].type).to.be.equal(new MutationTypeParser(Root.name, Fields.nestedModel).toString());
		expect(events[0].payload).to.be.equal(payload);
	});

	it('should emit direct mutation of nested array with model', () => {
		const Store = createStateManager(Root);
		const payload = new Model();
		Store[Fields.nestedArrayWithModel].push(payload);

		expect(events.length).to.be.equal(1);
		expect(events[0].type).to.be.equal(new MutationTypeParser(Root.name, Fields.nestedArrayWithModel).complexType('push').toString());
		expect(events[0].payload).to.be.eql([payload]);
	});

	it('should emit mutation', () => {
		const Store = createStateManager(Root);
		Store[Methods.simpleTypeChange]('s');

		expect(events.length).to.be.equal(1);
		expect(events[0].type).to.be.equal(new MutationTypeParser(Root.name, Methods.simpleTypeChange).method(0).toString());
		expect(events[0].payload).to.be.eql(['s']);
	});

	it('should emit doubled mutation', () => {
		const Store = createStateManager(Root);
		Store[Methods.simpleTypeChange]('a');
		Store[Methods.simpleTypeChange]('b');

		expect(events.length).to.be.equal(2);
		// this method was called before so count is #1
		expect(events[0].type).to.be.equal(new MutationTypeParser(Root.name, Methods.simpleTypeChange).method(1).toString());
		expect(events[0].payload).to.be.eql(['a']);
		expect(events[1].type).to.be.equal(new MutationTypeParser(Root.name, Methods.simpleTypeChange).method(2).toString());
		expect(events[1].payload).to.be.eql(['b']);
	});

	it('should emit mutation of array type', () => {
		const Store = createStateManager(Root);
		Store[Methods.simpleArrayChange]('s');

		expect(events.length).to.be.equal(1);
		expect(events[0].type).to.be.equal(new MutationTypeParser(Root.name, Methods.simpleArrayChange).method(0).toString());
		expect(events[0].payload).to.be.eql(['s']);
	});

	it('should emit mutation of model', () => {
		const Store = createStateManager(Root);
		const payload = new Model();
		Store[Methods.modelChange](payload);

		expect(events.length).to.be.equal(1);
		expect(events[0].type).to.be.equal(new MutationTypeParser(Root.name, Methods.modelChange).method(0).toString());
		expect(events[0].payload).to.be.eql([payload]);
	});

	it('should emit mutation of model array', () => {
		const Store = createStateManager(Root);
		const payload = new Model();
		Store[Methods.modelArrayChange](payload);

		expect(events.length).to.be.equal(1);
		expect(events[0].type).to.be.equal(new MutationTypeParser(Root.name, Methods.modelArrayChange).method(0).toString());
		expect(events[0].payload).to.be.eql([payload]);
	});

	it('should emit mutation of nested model', () => {
		const Store = createStateManager(Root);
		Store[Methods.nestedElementModuleChange]('s');
		mutationCollector.fire();

		expect(events.length).to.be.equal(1);
		//TODO? without change in store there is no method trigger,
		expect(events[0].type).to.be.equal(new MutationTypeParser(Model.name, Fields.simpleType).toString());
		expect(events[0].payload).to.be.eql('s');
	});

	it('should emit mutation of nested method', () => {
		const Store = createStateManager(Root);
		Store[Methods.nestedTrigger]('s');

		expect(events.length).to.be.equal(1);
		expect(events[0].type).to.be.equal(new MutationTypeParser(Model.name, Methods.simpleTypeChange).method(0).toString());
		expect(events[0].payload).to.be.eql(['s']);
	});

	it('should emit direct mutation of nested model', () => {
		const Store = createStateManager(Root);
		Store[Fields.nestedModel][Fields.simpleType] += 's';

		expect(events.length).to.be.equal(1);
		expect(events[0].type).to.be.equal(new MutationTypeParser(Model.name, Fields.simpleType).toString());
		expect(events[0].payload).to.be.eql('s');
	});

	it('should emit async mutation', async () => {
		const Store = createStateManager(Root);

		await Store[Methods.asynchronousChanges]('a', 'b');
		mutationCollector.fire();

		expect(events.length).to.be.equal(2);
		expect(events[0].type).to.be.equal(new MutationTypeParser(Root.name, Methods.asynchronousChanges).method(0).toString());
		expect(events[0].payload).to.be.eql(['a', 'b']);
		expect(events[1].type).to.be.equal(new MutationTypeParser(Root.name, Methods.asynchronousChanges).method(0).async().toString());
		expect(events[1].payload).to.be.eql(['a', 'b']);
	});

	it('should emit async mutation with intercept', () => {
		const Store = createStateManager(Root);

		const done = Store[Methods.asynchronousChanges]('a', 'c');
		Store[Methods.simpleTypeChange]('b');

		return done.then(() => {
			mutationCollector.fire();
			expect(events.length).to.be.equal(3);
			expect(events[0].type).to.be.equal(new MutationTypeParser(Root.name, Methods.asynchronousChanges).method(1).toString());
			expect(events[0].payload).to.be.eql(['a', 'c']);
			expect(events[1].type).to.be.equal(new MutationTypeParser(Root.name, Methods.simpleTypeChange).method(3).toString());
			expect(events[1].payload).to.be.eql(['b']);
			expect(events[2].type).to.be.equal(new MutationTypeParser(Root.name, Methods.asynchronousChanges).method(1).async().toString());
			expect(events[2].payload).to.be.eql(['a', 'c']);
		});
	});

	it('should emit async mutation but directly (scope trap)', async () => {
		const Store = createStateManager(Root);

		await Store[Methods.asynchronousMod](() => {
			Store[Fields.simpleType] = 'a';
		}, () => {
			Store[Fields.simpleType] = 'b';
		});

		expect(events.length).to.be.equal(2);
		expect(events[0].type).to.be.equal(new MutationTypeParser(Root.name, Fields.simpleType).toString());
		expect(events[0].payload).to.be.eql('a');
		expect(events[1].type).to.be.equal(new MutationTypeParser(Root.name, Fields.simpleType).async().toString());
		expect(events[1].payload).to.be.eql('b');
	});

	it('should emit async mutation but directly (scope trap)', () => {
		const Store = createStateManager(Root);

		const done = Store[Methods.asynchronousMod](() => {
			Store[Fields.simpleType] = 'a';
		}, () => {
			Store[Fields.simpleType] = 'c';
		});
		Store[Methods.simpleTypeChange]('b');

		return done.then(() => {
			expect(events.length).to.be.equal(3);
			expect(events[0].type).to.be.equal(new MutationTypeParser(Root.name, Fields.simpleType).toString());
			expect(events[0].payload).to.be.eql('a');
			expect(events[1].type).to.be.equal(new MutationTypeParser(Root.name, Methods.simpleTypeChange).method(4).toString());
			expect(events[1].payload).to.be.eql(['b']);
			expect(events[2].type).to.be.equal(new MutationTypeParser(Root.name, Fields.simpleType).toString());
			expect(events[2].payload).to.be.eql('c');
		});
	});
});
