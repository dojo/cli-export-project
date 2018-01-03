# @dojo/cli-export-project

[![Build Status](https://travis-ci.org/dojo/cli-export-project.svg?branch=master)](https://travis-ci.org/dojo/cli-export-project)
[![codecov](https://codecov.io/gh/dojo/cli-export-project/branch/master/graph/badge.svg)](https://codecov.io/gh/dojo/cli-export-project)
[![npm version](https://badge.fury.io/js/dojo-cli-export-project.svg)](http://badge.fury.io/js/dojo-cli-export-project)

A command which exports a project bundle which can be used with the `@dojo/web-editor` and other tools.

**WARNING** This is _alpha_ software. This is not yet production ready, so you should use at your own risk.

## Features

This command will create a JSON file which will contain all the necessary information about the current code to be
able to be loaded into the [`@dojo/web-editor`](https://github.com/dojo/web-editor).  It is possible that it can be used with
other tools which can read the custom format.

The types for the file are located in `interfaces/project.json.d.ts` with the interface for the main file being `ProjectJson`.

## How do I use this package?

To create a project export:

```sh
$ dojo export project

Export project bundle
  exported to "my-project.project.json"
```

This will export a file ending in `.project.json` which will be named after the name of your package in the `package.json` file.

There are several options that can be passed on the command line:

|Flag|Type|Description|
|----|----|-----------|
|`-c`, `--content`|string|A comma seperated list of extentions of files to include in the project files.  Defaults to `"ts,html,css,json,xml,md"`.|
|`-o`, `--out`|string|The output path for the generated bundle.  Defaults to the current working directory.|
|`-p`, `--project`|string|The path to the root of the project to bunde.  Defaults to the current working directory.|
|`-v`, `--verbose`|flag|Provide verbose output when generating the editor bundle.|
|`-h`, `--help`|flag|Show help|

## How do I contribute?

We appreciate your interest!  Please see the [Dojo 2 Meta Repository](https://github.com/dojo/meta#readme) for the Contributing Guidelines.

### Code Style

This repository uses [`prettier`](https://prettier.io/) for code styling rules and formatting. A pre-commit hook is installed automatically and configured to run `prettier` against all staged files as per the configuration in the projects `package.json`.

An additional npm script to run `prettier` (with write set to `true`) against all `src` and `test` project files is available by running:

```bash
npm run prettier
```

## Testing

Test cases MUST be written using [Intern](https://theintern.github.io) using the Object test interface and Assert assertion interface.

90% branch coverage MUST be provided for all code submitted to this repository, as reported by Istanbul’s combined coverage results for all supported platforms.

To test locally in node run:

`grunt test`

<!-- ## Licensing information -->

© 2017 JS Foundation & contributors. [New BSD](LICENSE) license.

