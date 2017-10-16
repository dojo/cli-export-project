const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');

import { SinonStub, stub } from 'sinon';
import { indent, log, setVerbose, verbose, verboseFlag } from '../../src/log';

let consoleLogStub: SinonStub;
let verboseFlagInitialValue: boolean;

registerSuite('log', {
	before() {
		verboseFlagInitialValue = verboseFlag;
		consoleLogStub = stub(console, 'log');
	},

	beforeEach() {
		consoleLogStub.reset();
	},

	afterEach() {
		setVerbose(verboseFlagInitialValue);
	},

	after() {
		consoleLogStub.restore();
	},

	tests: {
		log() {
			log('Hello', ' World');

			const actual = consoleLogStub.lastCall.args;
			assert.lengthOf(actual, 1);
			assert.strictEqual(actual[0], 'Hello World');
		},

		verbose: {
			'does not log when verboseFlag is false'() {
				setVerbose(false);

				verbose('Hello', ' World');
				assert.isFalse(consoleLogStub.called);
			},

			'logs when verboseFlag is true'() {
				setVerbose(true);

				verbose('Hello', ' World');
				const actual = consoleLogStub.lastCall.args;
				assert.isTrue(consoleLogStub.called);
				assert.lengthOf(actual, 1);
				assert.strictEqual(actual[0], 'Hello World');
			}
		},

		indent() {
			assert.strictEqual(indent(), '  ');
			assert.strictEqual(indent(2), '    ');
			assert.strictEqual(indent(2, 'message'), '    message');
		},

		setVerbose() {
			setVerbose(!verboseFlag);
			assert.isFalse(verboseFlagInitialValue === verboseFlag);
		}
	}
});
