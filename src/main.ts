import { Command, Helper, OptionsHelper } from '@dojo/cli/interfaces';
import { join } from 'path';
import exportProject from './exportProject';
const pkgDir = require('pkg-dir');

export interface ExportArgs {
	content: string | undefined;
	out: string;
	index: string | undefined;
	project: string;
	verbose: boolean;
}

function buildNpmDependencies(): { [pkg: string]: string } {
	try {
		const packagePath = pkgDir.sync(__dirname);
		const packageJsonFilePath = join(packagePath, 'package.json');
		const packageJson = <any>require(packageJsonFilePath);

		return packageJson.dependencies;
	} catch (e) {
		throw new Error('Failed reading dependencies from "package.json" - ' + e.message);
	}
}

const command: Command<ExportArgs> = {
	description: 'Emit a JSON file that describes the project.',

	register(options: OptionsHelper) {
		options('c', {
			alias: 'content',
			describe:
				'A comma separated list of extensions of files to include in the project files.  Defaults to ' +
				'"ts,html,css,json,xml,md".',
			type: 'string'
		});

		options('i', {
			alias: 'index',
			describe:
				'A file path to the main HTML document to load when running the project.  Defaults to ' +
				'"./src/index.html".'
		});

		options('o', {
			alias: 'out',
			describe: 'The output path for the generated bundle.  Defaults to the current working directory.',
			type: 'string',
			default: '.'
		});

		options('p', {
			alias: 'project',
			describe: 'The path to the root of the project to bundle.  Defaults to the current working directory.',
			type: 'string',
			default: '.'
		});

		options('v', {
			alias: 'verbose',
			describe: 'Provide verbose output when generating the editor bundle.',
			default: false
		});
	},

	async run(helper: Helper, args: ExportArgs) {
		return exportProject(args);
	},

	eject(helper: Helper) {
		return {
			npm: {
				devDependencies: {
					...buildNpmDependencies()
				}
			}
		};
	}
};

export default command;
