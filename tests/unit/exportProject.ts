import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as mockery from 'mockery';
import { stub, spy, SinonStub, SinonSpy } from 'sinon';

import * as fs from 'fs';
import * as process from 'process';

import { ExportArgs } from '../../src/main';
import { ProjectFileType } from '../../src/interfaces/project.json';

let exportProject: (args: ExportArgs) => Promise<void>;
let accessStub: SinonStub;
let readFileStub: SinonStub;
let writeFileStub: SinonStub;
let chdirStub: SinonStub;
let cwdStub: SinonStub;
let consoleLogStub: SinonStub;
let globStub: SinonSpy;
let resolveStub: SinonStub;
let exportArgs: any;
let accessMap: { [filename: string]: boolean };
let readFileMap: { [filename: string]: string };
let globMap: { [pattern: string]: string[] };
let resolveMap: { [mid: string]: string };
let consolelogStack: any[];

registerSuite({
	name: 'exportProject',

	setup() {
		mockery.enable({
			warnOnUnregistered: false
		});

		accessStub = stub(fs, 'access', (name: string, constants: any, callback: (err?: any) => void) => {
			if (name in accessMap && !accessMap[name]) {
				callback(new Error('file not found!'));
			}
			else {
				accessMap[name] = true;
				callback();
			}
		});

		readFileStub = stub(fs, 'readFile', (name: string, encoding: string, callback: (err?: any, data?: string) => void) => {
			const result = readFileMap[name] = readFileMap[name] || '';
			if (result !== 'err') {
				callback(undefined, result);
			}
			else {
				callback(new Error('file not found'));
			}
		});

		writeFileStub = stub(fs, 'writeFile', (filename: string, contents: string, options: any, callback: (err?: any) => void) => {
			if (filename === 'err.project.json') {
				callback(new Error('error writing file'));
			}
			else {
				callback();
			}
		});

		chdirStub = stub(process, 'chdir', (path: string) => {
			if (path === '../other-project') {
				cwdStub.returns('/var/projects/other-project');
			}
		});
		cwdStub = stub(process, 'cwd').returns('/var/projects/test-project');
		globStub = spy((pattern: string, callback: (err?: any, matches?: string[]) => void) => {
			const result = globMap[pattern] = globMap[pattern] || [];
			if (result[0] === 'err') {
				callback(new Error('glob error'));
			}
			else {
				callback(undefined, result);
			}
		});

		mockery.registerMock('glob', globStub);

		const exportProjectModule = require('intern/dojo/node!./../../src/exportProject');

		resolveStub = stub(exportProjectModule, 'requireResolve', (mid: string) => {
			return resolveMap[mid] = resolveMap[mid] || '/var/projects/test-project/node_modules/' + mid;
		});

		exportProject = exportProjectModule.default;
	},

	teardown() {
		mockery.deregisterAll();
		mockery.disable();

		accessStub.restore();
		readFileStub.restore();
		writeFileStub.restore();
		chdirStub.restore();
		cwdStub.restore();
		resolveStub.restore();
	},

	beforeEach() {
		consoleLogStub = stub(console, 'log', (...args: any[]) => {
			consolelogStack.push(args);
		});

		consolelogStack = [];

		exportArgs = {
			content: undefined,
			out: '.',
			project: '.',
			verbose: false
		};

		accessMap = { '.dojorc': false };
		readFileMap = {
			'package.json': JSON.stringify({ name: 'test-package' }),
			'tsconfig.json': JSON.stringify({ compilerOptions: { }, include: [ 'src/**/*.ts' ] }),
			'node_modules/@dojo/loader/dojo-loader-2.0.0.d.ts': 'loader',
			'node_modules/@dojo/core/lang.d.ts': 'lang',
			'node_modules/@types/chai/assert.d.ts': 'assert',
			'node_modules/foo/package.json': JSON.stringify({ types: 'foo.d.ts' }),
			'node_modules/bar/package.json': JSON.stringify({ typings: 'bar.d.ts' }),
			'node_modules/baz/package.json': JSON.stringify({ })
		};
		globMap = {
			'src/**/*.{ts,tsx,html,css,json,xml,md}': [ './src/index.html' ]
		};
		resolveMap = {};
	},

	afterEach() {
		consoleLogStub.restore();

		accessStub.reset();
		readFileStub.reset();
		writeFileStub.reset();
		chdirStub.reset();
		cwdStub.reset();
		cwdStub.returns('/var/projects/test-project');
		globStub.reset();
		resolveStub.reset();
	},

	async 'exports a project bundle with default arguments'() {
		await exportProject(exportArgs);
		assert.strictEqual(consoleLogStub.callCount, 2);
		assert.strictEqual(writeFileStub.callCount, 1, 'project should have been written');
		assert.strictEqual(writeFileStub.lastCall.args[0], 'test-package.project.json', 'should have written expected filename');
		assert.deepEqual(JSON.parse(writeFileStub.lastCall.args[1]), {
			dependencies: { development: {}, production: {} },
			environmentFiles: [],
			files: [ { name: './src/index.html', text: '', type: ProjectFileType.HTML } ],
			index: './src/index.html',
			package: { name: 'test-package' },
			tsconfig: { compilerOptions: { }, include: [ 'src/**/*.ts' ] }
		}, 'should have written expected contents');
		assert.isTrue(accessMap['package.json'], 'should have checked to see if package.json exists');
		assert.isTrue(accessMap['tsconfig.json'], 'should have checked to see if package.json exists');
	},

	async 'reads in .dojorc'() {
		const dojorc = { 'build-webpack': { locale: 'en' } };
		accessMap['.dojorc'] = true;
		readFileMap['.dojorc'] = JSON.stringify(dojorc);

		await exportProject(exportArgs);

		assert.deepEqual(JSON.parse(writeFileStub.lastCall.args[1]), {
			dependencies: { development: {}, production: {} },
			dojorc,
			environmentFiles: [],
			files: [ { name: './src/index.html', text: '', type: ProjectFileType.HTML } ],
			index: './src/index.html',
			package: { name: 'test-package' },
			tsconfig: { compilerOptions: { }, include: [ 'src/**/*.ts' ] }
		}, 'should have written expected contents');
	},

	async 'adds appropriate lib files to project'() {
		readFileMap['tsconfig.json'] = JSON.stringify({
			compilerOptions: {
				lib: [ 'foo', 'bar' ]
			},
			include: [ 'src/**/*.ts' ]
		});
		readFileMap['node_modules/typescript/lib/lib.foo.d.ts'] = 'foo';
		readFileMap['node_modules/typescript/lib/lib.bar.d.ts'] = 'bar';
		await exportProject(exportArgs);
		assert.deepEqual(JSON.parse(writeFileStub.lastCall.args[1]), {
			dependencies: { development: {}, production: {} },
			environmentFiles: [
				{ name: 'lib.foo.d.ts', text: 'foo', type: ProjectFileType.Lib },
				{ name: 'lib.bar.d.ts', text: 'bar', type: ProjectFileType.Lib }
			],
			files: [ { name: './src/index.html', text: '', type: ProjectFileType.HTML } ],
			index: './src/index.html',
			package: { name: 'test-package' },
			tsconfig: {
				compilerOptions: {
					lib: [ 'foo', 'bar' ]
				},
				include: [ 'src/**/*.ts' ]
			}
		}, 'should have written expected contents');
	},

	async 'resolves types specified in the tsconfig.json'() {
		readFileMap['tsconfig.json'] = JSON.stringify({
			compilerOptions: {
				types: [ 'foo', 'bar', 'baz' ]
			},
			include: [ 'src/**/*.ts' ]
		});
		await exportProject(exportArgs);
		assert.strictEqual(consoleLogStub.callCount, 3, 'should have logged a warning');
		assert.include(consoleLogStub.getCall(1).args[0], '"node_modules/baz/package.json" does not contain type information', 'warning should include proper info');
		assert.deepEqual(JSON.parse(writeFileStub.lastCall.args[1]), {
			dependencies: { development: {}, production: {} },
			environmentFiles: [
				{ name: 'node_modules/foo/package.json', text: '{"types":"foo.d.ts"}', type: ProjectFileType.JSON },
				{ name: 'node_modules/bar/package.json', text: '{"typings":"bar.d.ts"}', type: ProjectFileType.JSON },
				{ name: 'node_modules/baz/package.json', text: '{}', type: ProjectFileType.JSON },
				{ name: 'node_modules/foo/foo.d.ts', text: '', type: ProjectFileType.Definition },
				{ name: 'node_modules/bar/bar.d.ts', text: '', type: ProjectFileType.Definition },
				{ name: 'node_modules/baz/index.d.ts', text: '', type: ProjectFileType.Definition }
			],
			files: [ { name: './src/index.html', text: '', type: ProjectFileType.HTML } ],
			index: './src/index.html',
			package: { name: 'test-package' },
			tsconfig: {
				compilerOptions: {
					types: [ 'foo', 'bar', 'baz' ]
				},
				include: [ 'src/**/*.ts' ]
			}
		}, 'should have written expected contents');
	},

	async 'automatically adds @dojo and @types definitions'() {
		globMap['node_modules/{@dojo,@types}/**/*.d.ts'] = [
			'node_modules/@dojo/loader/interfaces.d.ts',
			'node_modules/@dojo/loader/dojo-loader-2.0.0.d.ts',
			'node_modules/@dojo/core/lang.d.ts',
			'node_modules/@types/chai/assert.d.ts'
		];
		await exportProject(exportArgs);
		assert.strictEqual(consoleLogStub.callCount, 2, 'should have only logged twice to console');
		assert.deepEqual(JSON.parse(writeFileStub.lastCall.args[1]), {
			dependencies: { development: {}, production: {} },
			environmentFiles: [
				{ name: 'node_modules/@dojo/loader/dojo-loader-2.0.0.d.ts', text: 'loader', type: ProjectFileType.Definition },
				{ name: 'node_modules/@dojo/core/lang.d.ts', text: 'lang', type: ProjectFileType.Definition },
				{ name: 'node_modules/@types/chai/assert.d.ts', text: 'assert', type: ProjectFileType.Definition }
			],
			files: [ { name: './src/index.html', text: '', type: ProjectFileType.HTML } ],
			index: './src/index.html',
			package: { name: 'test-package' },
			tsconfig: { compilerOptions: {}, include: [ 'src/**/*.ts' ] }
		}, 'should have written expected contents');
	},

	async 'adds project files based on tsconfig.json'() {
		globMap['src/**/*.{ts,tsx,html,css,json,xml,md}'] = [
			'src/index.ts',
			'./src/index.html',
			'src/core.css',
			'src/config/config.json',
			'src/config/build.xml',
			'src/README.md',
			'src/interfaces.d.ts',
			'src/text.txt',
			'src/widgets/Foo.tsx'
		];
		readFileMap['tsconfig.json'] = JSON.stringify({
			compilerOptions: { },
			include: [ 'src/**/*.ts', 'src/**/*.tsx' ]
		});
		await exportProject(exportArgs);
		assert.strictEqual(consoleLogStub.callCount, 2, 'should have only logged twice to console');
		assert.deepEqual(JSON.parse(writeFileStub.lastCall.args[1]), {
			dependencies: { development: {}, production: {} },
			environmentFiles: [],
			files: [
				{ name: 'src/index.ts', text: '', type: ProjectFileType.TypeScript },
				{ name: './src/index.html', text: '', type: ProjectFileType.HTML },
				{ name: 'src/core.css', text: '', type: ProjectFileType.CSS },
				{ name: 'src/config/config.json', text: '', type: ProjectFileType.JSON },
				{ name: 'src/config/build.xml', text: '', type: ProjectFileType.XML },
				{ name: 'src/README.md', text: '', type: ProjectFileType.Markdown },
				{ name: 'src/interfaces.d.ts', text: '', type: ProjectFileType.Definition },
				{ name: 'src/text.txt', text: '', type: ProjectFileType.PlainText },
				{ name: 'src/widgets/Foo.tsx', text: '', type: ProjectFileType.TypeScript }
			],
			index: './src/index.html',
			package: { name: 'test-package' },
			tsconfig: {
				compilerOptions: {},
				include: [ 'src/**/*.ts', 'src/**/*.tsx' ]
			}
		}, 'should have written expected contents');
	},

	'resolves package dependencies': {
		async 'no additional dependencies'() {
			Object.assign(readFileMap, {
				'/var/projects/test-project/node_modules/dep1/package.json': JSON.stringify({
					dependencies: {}
				}),
				'/var/projects/test-project/node_modules/dep2/package.json': JSON.stringify({
					dependencies: {}
				}),
				'/var/projects/test-project/node_modules/dep3/package.json': JSON.stringify({
					dependencies: {}
				}),
				'package.json': JSON.stringify({
					name: 'test-package',
					dependencies: {
						'dep1': '1.0.0'
					},
					peerDependencies: {
						'dep2': '2.0.0'
					},
					devDependencies: {
						'dep3': '0.1.0'
					}
				})
			});

			await exportProject(exportArgs);
			assert.strictEqual(consoleLogStub.callCount, 2);
			assert.deepEqual(JSON.parse(writeFileStub.lastCall.args[1]), {
				dependencies: { development: {
					'dep3': '0.1.0'
				}, production: {
					'dep1': '1.0.0',
					'dep2': '2.0.0'
				} },
				environmentFiles: [],
				files: [ { name: './src/index.html', text: '', type: ProjectFileType.HTML } ],
				index: './src/index.html',
				package: {
					name: 'test-package',
					dependencies: {
						'dep1': '1.0.0'
					},
					peerDependencies: {
						'dep2': '2.0.0'
					},
					devDependencies: {
						'dep3': '0.1.0'
					}
				},
				tsconfig: { compilerOptions: { }, include: [ 'src/**/*.ts' ] }
			}, 'should have written expected contents');
		},

		async 'should ignore dev dependencies on deeper packages'() {
			Object.assign(readFileMap, {
				'/var/projects/test-project/node_modules/dep1/package.json': JSON.stringify({
					dependencies: {
						'dep4': 'next'
					},
					devDependencies: {
						'dep5': '2.0.0'
					}
				}),
				'/var/projects/test-project/node_modules/dep2/package.json': JSON.stringify({
					dependencies: {}
				}),
				'/var/projects/test-project/node_modules/dep3/package.json': JSON.stringify({
					dependencies: {}
				}),
				'/var/projects/test-project/node_modules/dep4/package.json': JSON.stringify({
					dependencies: {}
				}),
				'/var/projects/test-project/node_modules/dep5/package.json': JSON.stringify({
					dependencies: {}
				}),
				'package.json': JSON.stringify({
					name: 'test-package',
					dependencies: {
						'dep1': '1.0.0'
					},
					peerDependencies: {
						'dep2': '2.0.0'
					},
					devDependencies: {
						'dep3': '0.1.0'
					}
				})
			});

			await exportProject(exportArgs);
			assert.strictEqual(consoleLogStub.callCount, 2);
			assert.deepEqual(JSON.parse(writeFileStub.lastCall.args[1]), {
				dependencies: {
					development: {
						'dep3': '0.1.0'
					},
					production: {
						'dep1': '1.0.0',
						'dep2': '2.0.0',
						'dep4': 'next'
					}
				},
				environmentFiles: [],
				files: [ { name: './src/index.html', text: '', type: ProjectFileType.HTML } ],
				index: './src/index.html',
				package: {
					name: 'test-package',
					dependencies: {
						'dep1': '1.0.0'
					},
					peerDependencies: {
						'dep2': '2.0.0'
					},
					devDependencies: {
						'dep3': '0.1.0'
					}
				},
				tsconfig: { compilerOptions: { }, include: [ 'src/**/*.ts' ] }
			}, 'should have written expected contents');
		},

		async 'no package.json for dependency'() {
			Object.assign(readFileMap, {
				'/var/projects/test-project/node_modules/dep1/package.json': JSON.stringify({
					dependencies: {
						'dep6': 'next'
					},
					devDependencies: {
						'dep5': '2.0.0'
					}
				}),
				'/var/projects/test-project/node_modules/dep2/package.json': JSON.stringify({
					dependencies: {}
				}),
				'/var/projects/test-project/node_modules/dep3/package.json': JSON.stringify({
					dependencies: {}
				}),
				'/var/projects/test-project/node_modules/dep4/package.json': JSON.stringify({
					dependencies: {}
				}),
				'/var/projects/test-project/node_modules/dep5/package.json': JSON.stringify({
					dependencies: {}
				}),
				'package.json': JSON.stringify({
					name: 'test-package',
					dependencies: {
						'dep1': '1.0.0'
					},
					peerDependencies: {
						'dep2': '2.0.0'
					},
					devDependencies: {
						'dep3': '0.1.0'
					}
				})
			});

			await exportProject(exportArgs);
			assert.strictEqual(consoleLogStub.callCount, 2);
			assert.deepEqual(JSON.parse(writeFileStub.lastCall.args[1]), {
				dependencies: {
					development: {
						'dep3': '0.1.0'
					},
					production: {
						'dep1': '1.0.0',
						'dep2': '2.0.0',
						'dep6': 'next'
					}
				},
				environmentFiles: [],
				files: [ { name: './src/index.html', text: '', type: ProjectFileType.HTML } ],
				index: './src/index.html',
				package: {
					name: 'test-package',
					dependencies: {
						'dep1': '1.0.0'
					},
					peerDependencies: {
						'dep2': '2.0.0'
					},
					devDependencies: {
						'dep3': '0.1.0'
					}
				},
				tsconfig: { compilerOptions: { }, include: [ 'src/**/*.ts' ] }
			}, 'should have written expected contents');
		},

		async 'dual dependencies, first one wins'() {
			Object.assign(readFileMap, {
				'/var/projects/test-project/node_modules/dep1/package.json': JSON.stringify({
					dependencies: {
						'dep4': '1.0.0'
					}
				}),
				'/var/projects/test-project/node_modules/dep2/package.json': JSON.stringify({
					dependencies: {
						'dep4': '1.0.1'
					}
				}),
				'/var/projects/test-project/node_modules/dep3/package.json': JSON.stringify({
					dependencies: {
						'dep4': '2.0.0'
					}
				}),
				'/var/projects/test-project/node_modules/dep4/package.json': JSON.stringify({
					dependencies: {}
				}),
				'package.json': JSON.stringify({
					name: 'test-package',
					dependencies: {
						'dep1': '1.0.0'
					},
					peerDependencies: {
						'dep2': '2.0.0'
					},
					devDependencies: {
						'dep3': '0.1.0'
					}
				})
			});

			await exportProject(exportArgs);
			assert.strictEqual(consoleLogStub.callCount, 2);
			assert.deepEqual(JSON.parse(writeFileStub.lastCall.args[1]), {
				dependencies: {
					development: {
						'dep3': '0.1.0',
						'dep4': '2.0.0'
					},
					production: {
						'dep1': '1.0.0',
						'dep2': '2.0.0',
						'dep4': '1.0.0'
					}
				},
				environmentFiles: [],
				files: [ { name: './src/index.html', text: '', type: ProjectFileType.HTML } ],
				index: './src/index.html',
				package: {
					name: 'test-package',
					dependencies: {
						'dep1': '1.0.0'
					},
					peerDependencies: {
						'dep2': '2.0.0'
					},
					devDependencies: {
						'dep3': '0.1.0'
					}
				},
				tsconfig: { compilerOptions: { }, include: [ 'src/**/*.ts' ] }
			}, 'should have written expected contents');
		},

		async 'deep dependencies with duplicates'() {
			Object.assign(readFileMap, {
				'/var/projects/test-project/node_modules/dep1/package.json': JSON.stringify({
					dependencies: {
						'dep2': '1.0.0',
						'dep3': '2.0.0',
						'dep4': '1.0.0'
					}
				}),
				'/var/projects/test-project/node_modules/dep2/package.json': JSON.stringify({
					dependencies: {
						'dep3': '1.0.0',
						'dep4': '1.0.0'
					}
				}),
				'/var/projects/test-project/node_modules/dep3/package.json': JSON.stringify({
					dependencies: {
						'dep4': '2.0.0'
					}
				}),
				'/var/projects/test-project/node_modules/dep4/package.json': JSON.stringify({
					dependencies: {}
				}),
				'package.json': JSON.stringify({
					name: 'test-package',
					dependencies: {
						'dep1': '1.0.0'
					}
				})
			});

			await exportProject(exportArgs);
			assert.strictEqual(consoleLogStub.callCount, 2);
			assert.deepEqual(JSON.parse(writeFileStub.lastCall.args[1]), {
				dependencies: {
					development: { },
					production: {
						'dep1': '1.0.0',
						'dep2': '1.0.0',
						'dep3': '1.0.0',
						'dep4': '2.0.0'
					}
				},
				environmentFiles: [],
				files: [ { name: './src/index.html', text: '', type: ProjectFileType.HTML } ],
				index: './src/index.html',
				package: {
					name: 'test-package',
					dependencies: {
						'dep1': '1.0.0'
					}
				},
				tsconfig: { compilerOptions: { }, include: [ 'src/**/*.ts' ] }
			}, 'should have written expected contents');
		},

		async 'sub peer dependencies'() {
			Object.assign(readFileMap, {
				'/var/projects/test-project/node_modules/dep1/package.json': JSON.stringify({
					dependencies: {
						'dep2': '1.0.0',
						'dep4': '1.0.0'
					},
					peerDependencies: {
						'dep3': '2.0.0'
					}
				}),
				'/var/projects/test-project/node_modules/dep2/package.json': JSON.stringify({
					dependencies: {
						'dep3': '1.0.0'
					},
					peerDependencies: {
						'dep4': '1.0.0'
					}
				}),
				'/var/projects/test-project/node_modules/dep3/package.json': JSON.stringify({
					dependencies: {
						'dep4': '2.0.0'
					}
				}),
				'/var/projects/test-project/node_modules/dep4/package.json': JSON.stringify({
					dependencies: {}
				}),
				'package.json': JSON.stringify({
					name: 'test-package',
					dependencies: {
						'dep1': '1.0.0'
					}
				})
			});

			await exportProject(exportArgs);
			assert.strictEqual(consoleLogStub.callCount, 2);
			assert.deepEqual(JSON.parse(writeFileStub.lastCall.args[1]), {
				dependencies: {
					development: { },
					production: {
						'dep1': '1.0.0',
						'dep2': '1.0.0',
						'dep3': '1.0.0',
						'dep4': '1.0.0'
					}
				},
				environmentFiles: [],
				files: [ { name: './src/index.html', text: '', type: ProjectFileType.HTML } ],
				index: './src/index.html',
				package: {
					name: 'test-package',
					dependencies: {
						'dep1': '1.0.0'
					}
				},
				tsconfig: { compilerOptions: { }, include: [ 'src/**/*.ts' ] }
			}, 'should have written expected contents');
		}
	},

	async 'package.json does not contain a name'() {
		readFileMap['package.json'] = '{}';
		await exportProject(exportArgs);
		assert.strictEqual(consoleLogStub.callCount, 2, 'should have only logged twice to console');
		assert.strictEqual(writeFileStub.lastCall.args[0], 'bundle.project.json', 'should have written expected filename');
	},

	async 'package name contains slashes'() {
		readFileMap['package.json'] = JSON.stringify({ name: '@dojo/widget-core' });
		await exportProject(exportArgs);
		assert.strictEqual(consoleLogStub.callCount, 2, 'should have only logged twice to console');
		assert.strictEqual(writeFileStub.lastCall.args[0], '@dojo-widget-core.project.json', 'should have written expected filename');
	},

	'export project arguments': {
		async 'index'() {
			globMap['src/**/*.{ts,html}'] = [
				'src/index.ts',
				'src/foo.html'
			];
			readFileMap['tsconfig.json'] = JSON.stringify({
				compilerOptions: { },
				include: [ 'src/**/*.ts' ]
			});
			exportArgs.content = 'ts,html';

			exportArgs.index = 'src/foo.html';
			await exportProject(exportArgs);
			assert.strictEqual(consoleLogStub.callCount, 2, 'should have only logged twice to console');
			assert.deepEqual(JSON.parse(writeFileStub.lastCall.args[1]), {
				dependencies: { development: {}, production: {} },
				environmentFiles: [],
				files: [
					{ name: 'src/index.ts', text: '', type: ProjectFileType.TypeScript },
					{ name: 'src/foo.html', text: '', type: ProjectFileType.HTML }
				],
				index: 'src/foo.html',
				package: { name: 'test-package' },
				tsconfig: {
					compilerOptions: {},
					include: [ 'src/**/*.ts' ]
				}
			}, 'should have written expected contents');
		},

		async 'out'() {
			exportArgs.out = 'dev';
			await exportProject(exportArgs);
			assert.strictEqual(consoleLogStub.callCount, 2, 'should have only logged twice to console');
			assert.strictEqual(writeFileStub.lastCall.args[0], 'dev/test-package.project.json', 'should have written to proper path');
		},

		async 'project'() {
			exportArgs.project = '../other-project';
			await exportProject(exportArgs);
			assert.strictEqual(consoleLogStub.callCount, 2, 'should have only logged twice to console');
			assert.strictEqual(process.cwd(), '/var/projects/other-project', 'current working directory was changed');
		},

		async 'content'() {
			globMap['src/**/*.{ts,html}'] = [
				'src/index.ts',
				'./src/index.html'
			];
			readFileMap['tsconfig.json'] = JSON.stringify({
				compilerOptions: { },
				include: [ 'src/**/*.ts' ]
			});
			exportArgs.content = 'ts,html';
			await exportProject(exportArgs);
			assert.strictEqual(consoleLogStub.callCount, 2, 'should have only logged twice to console');
			assert.deepEqual(JSON.parse(writeFileStub.lastCall.args[1]), {
				dependencies: { development: {}, production: {} },
				environmentFiles: [],
				files: [
					{ name: 'src/index.ts', text: '', type: ProjectFileType.TypeScript },
					{ name: './src/index.html', text: '', type: ProjectFileType.HTML }
				],
				index: './src/index.html',
				package: { name: 'test-package' },
				tsconfig: {
					compilerOptions: {},
					include: [ 'src/**/*.ts' ]
				}
			}, 'should have written expected contents');
		},

		'verbose': {
			async 'standard args'() {
				exportArgs.verbose = true;
				await exportProject(exportArgs);
				assert.strictEqual(consoleLogStub.callCount, 7, 'should have logged properly to console');
			}
		}
	},

	'error conditions': {
		async 'package.json missing'() {
			accessMap['package.json'] = false;
			await exportProject(exportArgs);
			assert.strictEqual(consoleLogStub.callCount, 3, 'should have logged properly to console');
			assert.include(consoleLogStub.getCall(1).args[0], 'Error: Path "/var/projects/test-project" does not contain a "tsconfig.json" and "package.json".');
		},

		async 'tsconfig.json missing'() {
			accessMap['tsconfig.json'] = false;
			await exportProject(exportArgs);
			assert.strictEqual(consoleLogStub.callCount, 3, 'should have logged properly to console');
			assert.include(consoleLogStub.getCall(1).args[0], 'Error: Path "/var/projects/test-project" does not contain a "tsconfig.json" and "package.json".');
		},

		async 'error reading a file'() {
			readFileMap['tsconfig.json'] = JSON.stringify({
				compilerOptions: {
					lib: [ 'foo' ]
				}
			});
			readFileMap['node_modules/typescript/lib/lib.foo.d.ts'] = 'err';
			await exportProject(exportArgs);
			assert.strictEqual(consoleLogStub.callCount, 3, 'should have logged properly to the console');
			assert.include(consoleLogStub.getCall(1).args[0], 'Error: file not found');
		},

		async 'error writing a file'() {
			readFileMap['package.json'] = JSON.stringify({ name: 'err' });
			await exportProject(exportArgs);
			assert.strictEqual(consoleLogStub.callCount, 3, 'should have logged properly to the console');
			assert.include(consoleLogStub.getCall(1).args[0], 'Error: error writing file');
		},

		async 'error with glob'() {
			globMap['src/**/*.{ts,html}'] = [ 'err' ];
			exportArgs.content = 'ts,html';
			await exportProject(exportArgs);
			assert.strictEqual(consoleLogStub.callCount, 3, 'should have logged properly to the console');
			assert.include(consoleLogStub.getCall(1).args[0], 'Error: glob error');
		},

		async 'error not resolving project index'() {
			globMap['src/**/*.{ts,html}'] = [ 'src/index.ts' ];
			exportArgs.content = 'ts,html';
			await exportProject(exportArgs);
			assert.strictEqual(consoleLogStub.callCount, 3, 'should have logged properly to the console');
			assert.include(consoleLogStub.getCall(1).args[0], 'unable to find index "./src/index.html" in project.');
		}
	}
});
