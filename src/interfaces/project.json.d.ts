import { JsonSchemaForNpmPackageJsonFiles as PackageJson } from './package.json';
import { JsonSchemaForTheTypeScriptCompilersConfigurationFile as TsconfigJson } from './tsconfig.json';
import { JsonSchemaForTheTsLintConfigurationFiles as TslintJson } from './tslint.json';
import { DojoRcJson } from './dojorc';

export interface ProjectJson {

	/**
	 * The package dependencies for the project, either `production` or `development`
	 */
	dependencies: {
		/**
		 * A map of production dependencies, where the package name is the key and the value is the semver of the package
		 */
		production: {
			[pkg: string]: string;
		},

		/**
		 * A map of development dependencies, where the package name is the key and the value is the semver of the package
		 */
		development: {
			[pkg: string]: string;
		}
	};

	/**
	 * The .dojorc for the project
	 */
	dojorc?: DojoRcJson;

	/**
	 * Files that are part of the environment but are not exposed for editing
	 *
	 * Typically these are TypeScript definition files and libraries that are needed
	 * to provide context to edit and compile the project files
	 */
	environmentFiles: ProjectFile[];

	/**
	 * These are the editable project files
	 */
	files: ProjectFile[];

	/**
	 * The filename of the HTML document for the project to load when running it
	 */
	index: string;

	/**
	 * The package.json for the project
	 */
	package: PackageJson;

	/**
	 * The tsconfig.json for the project
	 */
	tsconfig: TsconfigJson;

	/**
	 * The tslint.json for the project
	 */
	tslint?: TslintJson;
}

export interface ProjectFile {
	type: ProjectFileType;
	name: string;
	text: string;
}

export const enum ProjectFileType {
	TypeScript = 1,
	Definition,
	Lib,
	JavaScript,
	CSS,
	HTML,
	Markdown,
	JSON,
	XML,
	SourceMap,
	PlainText,
	SVG,
	PNG,
	JPEG,
	GIF
}
