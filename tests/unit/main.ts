const { beforeEach, afterEach, describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');

import * as mockery from 'mockery';
import * as sinon from 'sinon';

import * as fs from 'fs';
import MockModule from '../support/MockModule';

describe('main', () => {
	let moduleUnderTest: any;
	let mockModule: MockModule;
	let mockGenerateProjectJson: any;
	let sandbox: sinon.SinonSandbox;
	let mockReadFile: sinon.SinonStub;

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		mockModule = new MockModule('../../src/main', require);
		mockGenerateProjectJson = {
			default: sandbox.stub().returns(Promise.resolve())
		};
		mockery.registerMock('./exportProject', mockGenerateProjectJson);
		moduleUnderTest = mockModule.getModuleUnderTest().default;
		mockReadFile = sandbox.stub(fs, 'readFileSync');
	});

	afterEach(() => {
		sandbox.restore();
		mockModule.destroy();
	});

	it('should register supported arguments', () => {
		const options = sandbox.stub();
		moduleUnderTest.register(options);

		let untestedArguments: { [key: string]: string } = {
			c: 'content',
			i: 'index',
			o: 'out',
			p: 'project',
			v: 'verbose'
		};

		for (let i = 0; i < options.callCount; i++) {
			const call = options.getCall(i);

			assert.isTrue(call.args[0] in untestedArguments);
			assert.strictEqual(call.args[1].alias, untestedArguments[call.args[0]]);

			delete untestedArguments[call.args[0]];
		}

		assert.isTrue(Object.keys(untestedArguments).length === 0, 'Not all commands are tested');
	});

	it('should run the GenerateProjectJson with the approriate arguments', () => {
		const helper = {
			command: {
				exists: sandbox.stub().returns(true),
				run: sandbox.stub().returns(Promise.resolve())
			}
		};

		const runTestArgs = { testArg: 'value' };
		return moduleUnderTest.run(<any>helper, <any>runTestArgs).then(() => {
			assert.isFalse(helper.command.run.calledOnce, 'Should not have called the command helper');
			assert.isTrue(
				mockGenerateProjectJson.default.calledOnce,
				'Should have called the GenerateProjectJson module'
			);
			assert.deepEqual(
				mockGenerateProjectJson.default.firstCall.args,
				[runTestArgs],
				"Didn't run tests with provided arguments"
			);
		});
	});

	it('should support eject', () => {
		mockReadFile.returns(`{
				"name": "@dojo/cli-test-intern",
				"version": "test-version",
				"dependencies": {
					"dep1": "dep1v",
					"dep2": "dep2v"
				}
			}`);

		const result = moduleUnderTest.eject({});

		assert.isTrue('npm' in result, 'expecting npm property');
		assert.isTrue('devDependencies' in result.npm, 'expecting a devDependencies property');
		assert.deepEqual(result.npm.devDependencies, {
			dep1: 'dep1v',
			dep2: 'dep2v'
		});
	});

	it('should fail if package.json fails to be read', () => {
		mockReadFile.throws(new Error('test error'));

		try {
			moduleUnderTest.eject({});
			assert.fail('Should not have succeeded');
		} catch (e) {
			assert.equal(e.message, 'Failed reading dependencies from "package.json" - test error');
		}
	});
});
