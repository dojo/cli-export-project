import chalk from 'chalk';
import { access, constants, readFile, writeFile } from 'fs';
import * as glob from 'glob';
import { extname, join, normalize, relative } from 'path';
import { chdir, cwd } from 'process';
import * as resolveCwd from 'resolve-cwd';

import { ExportArgs } from './main';
import { ProjectFile, ProjectFileType, ProjectJson } from './interfaces/project.json';
import { JsonSchemaForNpmPackageJsonFiles as PackageJson } from './interfaces/package.json';
import { indent, log, setVerbose, verbose } from './log';

/**
 * Including both interface files from @dojo/loader causes issues, therefore we will manually exclude one of
 * them
 */
const DOJO_EXCLUDE = /@dojo\/loader\/interfaces\.d\.ts$/;

export let requireResolve = resolveCwd;

export type StringMap = { [pkg: string]: string };

/**
 * Helper function to create a new project file entry
 * @param name Name of the file
 * @param text The text of the file
 * @param type The file type
 */
function createProjectFile(
	name: string,
	text: string,
	type: ProjectFileType = ProjectFileType.Definition
): ProjectFile {
	return { name, text, type };
}

/**
 * An async function which resolves with an array of files which match the supplied glob pattern.
 * @param pattern The matching pattern to glob
 */
async function getGlob(pattern: string) {
	return new Promise<string[]>((resolve, reject) => {
		glob(pattern, (err, matches) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(matches);
		});
	});
}

/**
 * An async function which loads a file and resolves to its string data
 * @param filename The filename to get
 */
async function getFile(filename: string) {
	return new Promise<string>((resolve, reject) => {
		readFile(filename, 'utf8', (err, data) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(data.toString());
		});
	});
}

/**
 * An async function that resolves to `true` if the file exists and is readable, otherwise `false`
 * @param filename The filename to check existance of
 */
async function exists(filename: string) {
	return new Promise<boolean>((resolve) => {
		access(filename, constants.R_OK, (err) => {
			resolve(!err);
		});
	});
}

/**
 * An async function which writes out a file
 * @param filename The filename to write out
 * @param contents The contents of the file
 */
async function setFile(filename: string, contents: string) {
	return new Promise<string>((resolve, reject) => {
		writeFile(filename, contents, { encoding: 'utf8' }, (err) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(filename);
		});
	});
}

/**
 * Create the basic project bundle, reading in the `package.json` and `tsconfig.json`
 */
async function createProject() {
	const project: ProjectJson = {
		dependencies: {
			production: {},
			development: {}
		},
		environmentFiles: [],
		files: [],
		index: '',
		package: {},
		tsconfig: {}
	};

	if (!((await exists('package.json')) && (await exists('tsconfig.json')))) {
		throw new Error(`Path "${cwd()}" does not contain a "tsconfig.json" and "package.json".`);
	}

	verbose(indent(), chalk.bold.blue('reading'), ' "package.json"');
	Object.assign(project.package, JSON.parse(await getFile('package.json')));
	verbose(indent(), chalk.bold.blue('reading'), ' "tsconfig.json"');
	Object.assign(project.tsconfig, JSON.parse(await getFile('tsconfig.json')));
	if (await exists('.dojorc')) {
		verbose(indent(), chalk.bold.blue('reading'), ' ".dojorc"');
		project.dojorc = JSON.parse(await getFile('.dojorc'));
	}

	return project;
}

/**
 * An async function which loads and adds TypeScript libraries files specified in the `tsconfig.json`
 * for the project.
 * @param project The reference to the project bundle
 */
async function addLibFiles(project: ProjectJson) {
	if (project.tsconfig.compilerOptions && project.tsconfig.compilerOptions.lib) {
		const tasks = project.tsconfig.compilerOptions.lib.map(async (lib) => {
			const filename = `lib.${lib}.d.ts`;
			const projectDescriptor = createProjectFile(
				filename,
				await getFile(join('node_modules', 'typescript', 'lib', filename)),
				ProjectFileType.Lib
			);
			project.environmentFiles.push(projectDescriptor);
			verbose(indent(), chalk.bold.blue('adding'), ` lib "${lib}"`);
		});

		return Promise.all(tasks);
	}
	return Promise.all([]);
}

/**
 * Determine the project file type for a given file name
 * @param name The file to get the project file type for
 */
function getProjectFileType(name: string): ProjectFileType {
	const ext = extname(name);

	switch (ext) {
		case '.ts':
			return /\.d\.ts$/.test(name) ? ProjectFileType.Definition : ProjectFileType.TypeScript;
		case '.tsx':
			return ProjectFileType.TypeScript;
		case '.html':
			return ProjectFileType.HTML;
		case '.css':
			return ProjectFileType.CSS;
		case '.json':
			return ProjectFileType.JSON;
		case '.xml':
			return ProjectFileType.XML;
		case '.md':
			return ProjectFileType.Markdown;
		default:
			return ProjectFileType.PlainText;
	}
}

/**
 * Recursively maps the dependencies of a collection of packages
 * @param packages a collection of packages (only the package name is used)
 * @param parsedPackages a set of packages that have already been parsed for export
 * @return a flattened map of production and peer dependencies
 */
async function getDependencies(packages: StringMap, parsedPackages: Set<string> = new Set()): Promise<StringMap> {
	const dependencies: StringMap = {};

	for (const packageName in packages) {
		if (!parsedPackages.has(packageName)) {
			parsedPackages.add(packageName);
			verbose(indent(2), chalk.bold.blue('resolving'), ` dependencies for package "${packageName}"`);

			let packageJson: PackageJson;

			try {
				const packageJsonFileName = requireResolve(join(packageName, 'package.json'));
				packageJson = JSON.parse(await getFile(packageJsonFileName));
			} catch (e) {
				verbose(indent(2), chalk.bold.yellow('missing'), ` "${join(packageName, 'package.json')}"`);
				continue;
			}

			Object.assign(dependencies, packageJson.peerDependencies);
			Object.assign(dependencies, packageJson.dependencies);
			if (packageJson.dependencies && Object.keys(packageJson.dependencies).length) {
				verbose(
					indent(3),
					chalk.bold.blue('depends'),
					` on packages "${Object.keys(packageJson.dependencies).join('", "')}"`
				);
			}
			if (packageJson.peerDependencies && Object.keys(packageJson.peerDependencies).length) {
				verbose(
					indent(3),
					chalk.bold.blue('depends'),
					` on peer packages "${Object.keys(packageJson.peerDependencies).join('", "')}"`
				);
			}
		} else {
			verbose(indent(2), chalk.bold.blue('skipping'), ` dependencies for package "${packageName}", already seen`);
		}
	}

	if (Object.keys(dependencies).length) {
		Object.assign(dependencies, await getDependencies(dependencies, parsedPackages));
	}

	return dependencies;
}

/**
 * Populates the `project.dependencies` with the recursively resolved dependencies for the package
 * @param project The project bundle to populate
 */
async function addDependencies(project: ProjectJson) {
	const packageSet = new Set();

	verbose(indent(), chalk.bold.blue('resolving'), ` production dependecies:`);
	Object.assign(project.dependencies.production, project.package.peerDependencies);
	Object.assign(project.dependencies.production, project.package.dependencies);
	Object.assign(project.dependencies.production, await getDependencies(project.dependencies.production, packageSet));

	verbose(indent(), chalk.bold.blue('resolving'), ` development dependecies:`);
	packageSet.clear();
	Object.assign(project.dependencies.development, project.package.devDependencies);
	Object.assign(
		project.dependencies.development,
		await getDependencies(project.dependencies.development, packageSet)
	);
}

/**
 * An async function which loads any of the `include` files that are specified in the `tsconfig.json` plus
 * other related static content files.
 * @param project The reference to the project bundle
 * @param includeExtensions A comma deliminated string of extensions to be included in the project files
 */
async function addProjectFiles(project: ProjectJson, includeExtensions: string = 'ts,tsx,html,css,json,xml,md') {
	if (project.tsconfig.include) {
		const globs = await Promise.all(
			project.tsconfig.include.map((pattern) =>
				getGlob(pattern.replace(/(\.d)?\.ts$/, `.{${includeExtensions}}`))
			)
		);
		const files = (<string[]>[]).concat(...globs);
		const tasks = files.map(async (name) => {
			const text = await getFile(name);
			verbose(indent(), chalk.bold.blue('adding'), ` project file "${name}"`);
			project.files.push({
				name,
				text,
				type: getProjectFileType(name)
			});
		});
		return Promise.all(tasks);
	}
	return Promise.all([]);
}

/**
 * An async function which loads any of the `compilerOptions.types` that are specified in the `tsconfig.json`
 * @param project The reference to the project bundle
 */
async function addTypesFiles(project: ProjectJson) {
	if (project.tsconfig.compilerOptions && project.tsconfig.compilerOptions.types) {
		const tasks = project.tsconfig.compilerOptions.types.map(async (packageName) => {
			verbose(indent(), chalk.bold.blue('resolving'), ` types for package "${packageName}"`);

			const packageJsonFilename = relative(cwd(), requireResolve(join(packageName, 'package.json')));
			const packageJson: PackageJson = JSON.parse(await getFile(packageJsonFilename));

			project.environmentFiles.push(
				createProjectFile(packageJsonFilename, JSON.stringify(packageJson), ProjectFileType.JSON)
			);

			const typings = packageJson.typings || packageJson.types;
			if (typings) {
				const filename = relative(cwd(), requireResolve(normalize(join(packageName, typings))));

				project.environmentFiles.push(createProjectFile(filename, await getFile(filename)));
				verbose(indent(), chalk.bold.blue('adding'), ` type file "${filename}"`);
			} else {
				log(indent(), chalk.bold.yellow('warn'), ` "${packageJsonFilename}" does not contain type information`);

				try {
					/* try to find an index.d.ts file, since none specified in package.json */
					const filename = relative(cwd(), requireResolve(normalize(join(packageName, 'index.d.ts'))));
					project.environmentFiles.push(createProjectFile(filename, await getFile(filename)));
					verbose(indent(), chalk.bold.blue('adding'), ` type file "${filename}"`);
				} catch (e) {
					/* swallow error */
				}
			}
		});

		return Promise.all(tasks);
	}
	return Promise.all([]);
}

/**
 * An async function which will glob any definitions that are included in `node_modules/@dojo` or `node_modules/@types`
 * @param project The reference to the project bundle
 */
async function addDefinitionFiles(project: ProjectJson) {
	const files = await getGlob('node_modules/{@dojo,@types}/**/*.d.ts');
	const tasks = files.map(async (filename) => {
		if (DOJO_EXCLUDE.test(filename)) {
			return;
		}

		project.environmentFiles.push(createProjectFile(filename, await getFile(filename)));
		verbose(indent(), chalk.bold.blue('adding'), ` definition file "${filename}"`);
	});

	return Promise.all(tasks);
}

/**
 * Set the project index.html filename
 * @param project The project that is the target
 * @param index Supply an alternative index.html
 */
function setProjectIndex(project: ProjectJson, index = './src/index.html') {
	if (!project.files.find(({ name }) => name === index)) {
		log(indent(), chalk.bold.red('error'), ` unable to find index "${index}" in project.`);
	} else {
		project.index = index;
	}
}

/**
 * An async function which resolves when a project bundle has been output for the specified path
 */
export default async function exportProject({ content, index, out, project: root, verbose: verboseFlag }: ExportArgs) {
	setVerbose(verboseFlag);

	log(chalk.underline('\nExport project bundle'));

	try {
		const initialCwd = cwd();
		chdir(root);
		if (cwd() !== initialCwd) {
			verbose(indent(), chalk.bold.blue('changing'), ` working directory to "${root}"`);
		}

		const project = await createProject();
		const tasks: Promise<any>[] = [];

		tasks.push(addLibFiles(project));
		tasks.push(addTypesFiles(project));
		tasks.push(addDefinitionFiles(project));
		if (content) {
			verbose(indent(), chalk.bold.blue('setting'), ` project file extensions to "${content}"`);
		}
		tasks.push(addProjectFiles(project, content));
		tasks.push(addDependencies(project));
		await Promise.all(tasks);

		setProjectIndex(project, index);

		/* write out project bundle file */
		const outfilename = `${(project.package.name || 'bundle').replace(/[\/\\]/, '-')}.project.json`;
		const outfile = relative(cwd(), normalize(join(initialCwd, out, outfilename)));

		await setFile(outfile, JSON.stringify(project));
		log(indent(), chalk.bold.green('exported'), ` to "${relative(initialCwd, outfile)}"\n`);
	} catch (e) {
		const stack: string[] = e.stack.split('\n');
		log(indent(), chalk.bold.red('errored'), ' ', stack.shift());
		log(stack.join('\n'), '\n');
	}
}
