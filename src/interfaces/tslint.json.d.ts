export interface Ruledefinitions {
	/**
	 * Enforces function overloads to be consecutive
	 */
	'adjacent-overload-signatures'?: boolean;
	/**
	 * Enforces vertical alignment for parameters, arguments and/or statements
	 */
	'align'?: (true | false | 'parameters' | 'arguments' | 'statements')[];
	/**
	 * Requires using either 'T[]' or 'Array<T>' for arrays
	 */
	'array-type'?: (true | false | 'array' | 'array-simple' | 'generic')[];
	/**
	 * Requires parentheses around the parameters of arrow function definitions
	 */
	'arrow-parens'?: boolean | any[];
	/**
	 * Bans the use of specific functions or global methods
	 */
	'ban'?: boolean | any[];
	/**
	 * Enforces PascalCased class and interface names
	 */
	'class-name'?: boolean;
	/**
	 * Enforces rules for single-line comments
	 */
	'comment-format'?: (true | false | 'check-space' | 'check-lowercase' | 'check-uppercase' | {
		/**
		 * Words that will be ignored at the beginning of comment
		 */
		'ignore-words'?: string[];
		/**
		 * RegExp pattern that will be ignored at the beginning of comment
		 */
		'ignore-pattern'?: string;
	})[];
	/**
	 * Enforces documentation for important items be filled out
	 */
	'completed-docs'?: (true | false | 'classes' | 'functions' | 'methods' | 'properties')[];
	/**
	 * Enforces all components having the suffix of 'Component'
	 */
	'component-class-suffix'?: boolean;
	/**
	 * Enforces naming conventions for components
	 */
	'component-selector-name'?: (true | false | 'camelCase' | 'kebab-case')[];
	/**
	 * Enforces all components to have a uniform prefix
	 */
	'component-selector-prefix'?: (boolean | string)[];
	/**
	 * Enforces the type of a component
	 */
	'component-selector-type'?: (true | false | 'attribute' | 'element')[];
	/**
	 * Enforces braces for if/for/do/while statements
	 */
	'curly'?: boolean;
	/**
	 * Enforces a threshold of cyclomatic complexity
	 */
	'cyclomatic-complexity'?: (boolean | number)[];
	/**
	 * Enforces all components having the suffix of 'Directive'
	 */
	'directive-class-suffix'?: boolean;
	/**
	 * Enforces naming conventions for directives
	 */
	'directive-selector-name'?: (true | false | 'camelCase' | 'kebab-case')[];
	/**
	 * Enforces all directives to have a uniform prefix
	 */
	'directive-selector-prefix'?: (boolean | string)[];
	/**
	 * Enforces the type of a directive
	 */
	'directive-selector-type'?: (true | false | 'attribute' | 'element')[];
	/**
	 * Enforces the file to end with a newline
	 */
	'eofline'?: boolean;
	/**
	 * Enforces a certain header comment for all files, matched by a regular expression
	 */
	'file-header'?: (boolean | string)[];
	/**
	 * Enforces a for...in statement to be filtered with an if statement
	 */
	'forin'?: boolean;
	/**
	 * Enforces consistent indentation levels
	 */
	'indent'?: (boolean | number | string)[];
	/**
	 * Enforces the rule that interface names must or must not begin with a capital 'I'
	 */
	'interface-name'?: (true | false | 'always-prefix' | 'never-prefix')[];
	/**
	 * Enforces basic format rules for jsdoc comments
	 */
	'jsdoc-format'?: boolean;
	/**
	 * Enforces labels only on sensible statements
	 */
	'label-position'?: boolean;
	/**
	 * Enforces a consistent linebreak styl
	 */
	'linebreak-style'?: (true | false | 'CRLF' | 'LF')[];
	/**
	 * A file may not contain more than the specified number of classes
	 */
	'max-classes-per-file'?: (boolean | number)[];
	/**
	 * Requires files to remain under a certain number of lines
	 */
	'max-file-line-count'?: (boolean | number)[];
	/**
	 * Sets the maximum length of a line
	 */
	'max-line-length'?: (boolean | number)[];
	/**
	 * Enforces using explicit visibility on class members
	 */
	'member-access'?: any[] | boolean;
	/**
	 * Enforces chosen member ordering
	 */
	'member-ordering'?: (Object | boolean | string)[];
	/**
	 * Requires parentheses when invoking a constructor via the `new` keyword
	 */
	'new-parens'?: boolean;
	/**
	 * Requires the use of `as Type` for type assertions instead of `<Type>`
	 */
	'no-angle-bracket-type-assertion'?: boolean;
	/**
	 * Disallows usages of any as a type decoration
	 */
	'no-any'?: boolean;
	/**
	 * Disallows access to arguments.callee
	 */
	'no-arg'?: boolean;
	/**
	 * Disallows bitwise operators
	 */
	'no-bitwise'?: boolean;
	/**
	 * Disallows any type of assignment in any conditionals; this applies to do-while, for, if, and while statements
	 */
	'no-conditional-assignment'?: boolean;
	/**
	 * Disallows one or more blank lines in a row
	 */
	'no-consecutive-blank-lines'?: (boolean | number)[];
	/**
	 * Disallows access to the specified functions on console
	 */
	'no-console'?: (true | false | 'assert' | 'count' | 'debug' | 'dir' | 'dirxml' | 'error' | 'group' | 'groupCollapsed' | 'groupEnd' | 'info' | 'log' | 'profile' | 'profileEnd' | 'table' | 'time' | 'timeEnd' | 'timeStamp' | 'trace' | 'warn')[];
	/**
	 * Disallows access to the constructors of String, Number and Boolean
	 */
	'no-construct'?: boolean;
	/**
	 * Disallows debugger statements
	 */
	'no-debugger'?: boolean;
	/**
	 * Disallows default exports in ES6-style modules
	 */
	'no-default-export'?: boolean;
	/**
	 * Disallows duplicate variable declarations in the same block scope
	 */
	'no-duplicate-variable'?: boolean;
	/**
	 * Disallows empty blocks
	 */
	'no-empty'?: boolean;
	/**
	 * Disallows `eval` function invocations
	 */
	'no-eval'?: boolean;
	/**
	 * Disallows iterating over an array with a for-in loop
	 */
	'no-for-in-array'?: boolean;
	/**
	 * Disallows explicit type declarations for variables or parameters initialized to a number, string, or boolean
	 */
	'no-inferrable-types'?: (true | false | 'ignore-params')[];
	/**
	 * Disallows internal module, use namespace instead
	 */
	'no-internal-module'?: boolean;
	/**
	 * Disallows using the `this` keyword outside of classes
	 */
	'no-invalid-this'?: any;
	/**
	 * Disallows mergeable namespaces in the same file
	 */
	'no-mergeable-namespace'?: boolean;
	/**
	 * Disallows use of internal `module`s and `namespace`s
	 */
	'no-namespace'?: any;
	/**
	 * Disallows use of the `null` keyword literal
	 */
	'no-null-keyword'?: boolean;
	/**
	 * Disallows parameter properties in class constructors
	 */
	'no-parameter-properties'?: boolean;
	/**
	 * Disallows `/// <reference path=>` imports (use ES6-style imports instead)
	 */
	'no-reference'?: boolean;
	/**
	 * Disallows require() style imports
	 */
	'no-require-imports'?: boolean;
	/**
	 * Disallows shadowing variable declarations
	 */
	'no-shadowed-variable'?: boolean;
	/**
	 * Disallows object access via string literals
	 */
	'no-string-literal'?: boolean;
	/**
	 * Disallows falling through case statements
	 */
	'no-switch-case-fall-through'?: boolean;
	/**
	 * Disallows trailing whitespace at the end of a line
	 */
	'no-trailing-whitespace'?: boolean;
	/**
	 * Disallows control flow statements, such as `return`, `continue`, `break` and `throws` in finally blocks
	 */
	'no-unsafe-finally'?: boolean;
	/**
	 * Disallows unused expression statements
	 */
	'no-unused-expression'?: boolean;
	/**
	 * Disallows unused 'new' expression statements
	 */
	'no-unused-new'?: boolean;
	/**
	 * Disallows unused imports, variables, functions and private class members
	 */
	'no-unused-variable'?: any[] | boolean;
	/**
	 * Disallows usage of variables before their declaration
	 */
	'no-use-before-declare'?: boolean;
	/**
	 * Disallows usage of the var keyword, use let or const instead
	 */
	'no-var-keyword'?: boolean;
	/**
	 * Disallows the use of require statements except in import statements
	 */
	'no-var-requires'?: boolean;
	/**
	 * Enforces consistent object literal property quote style
	 */
	'object-literal-key-quotes'?: (true | false | 'always' | 'as-needed' | 'consistent' | 'consistent-as-needed')[];
	/**
	 * Enforces use of ES6 object literal shorthand when possible
	 */
	'object-literal-shorthand'?: boolean;
	/**
	 * Requires keys in object literals to be sorted alphabetically
	 */
	'object-literal-sort-keys'?: boolean;
	/**
	 * Enforces the specified tokens to be on the same line as the expression preceding it
	 */
	'one-line'?: (true | false | 'check-open-brace' | 'check-catch' | 'check-finally' | 'check-else' | 'check-whitespace')[];
	/**
	 * Disallows multiple variable definitions in the same declaration statement
	 */
	'one-variable-per-declaration'?: (true | false | 'ignore-for-loop')[];
	/**
	 * Disallows traditional (non-arrow) function expressions
	 */
	'only-arrow-functions'?: (true | false | 'allow-declarations' | 'allow-named-functions')[];
	/**
	 * Requires that import statements be alphabetized
	 */
	'ordered-imports'?: (Object | boolean | string)[];
	/**
	 * Recommends a 'for-of' loop over a standard 'for' loop if the index is only used to access the array being iterated
	 */
	'prefer-for-of'?: boolean;
	/**
	 * Enforces consistent single or double quoted string literals
	 */
	'quotemark'?: (true | false | 'double' | 'single' | 'jsx-double' | 'jsx-single' | 'avoid-escape')[];
	/**
	 * Enforces the radix parameter of parseInt
	 */
	'radix'?: boolean;
	/**
	 * When adding two variables, operands must both be of type number or of type string
	 */
	'restrict-plus-operands'?: boolean;
	/**
	 * Enforces semicolons at the end of every statement
	 */
	'semicolon'?: (true | false | 'always' | 'never' | 'ignore-bound-class-methods' | 'ignore-interfaces')[];
	/**
	 * Enforces a default case in switch statements
	 */
	'switch-default'?: boolean;
	/**
	 * Requires or disallows trailing commas in array and object literals, destructuring assignments, function and tuple typings, named imports and function parameters
	 */
	'trailing-comma'?: (Object | boolean | string)[];
	/**
	 * Enforces === and !== in favor of == and !=
	 */
	'triple-equals'?: any[] | boolean;
	/**
	 * Enforces type definitions to exist
	 */
	'typedef'?: (true | false | 'call-signature' | 'parameter' | 'arrow-parameter' | 'property-declaration' | 'variable-declaration' | 'member-variable-declaration')[];
	/**
	 * Enforces spacing whitespace for type definitions
	 */
	'typedef-whitespace'?: (Object | boolean)[];
	/**
	 * Enforces use of the `isNaN()` function to check for NaN references instead of a comparison to the `NaN` constant
	 */
	'use-isnan'?: boolean;
	/**
	 * Allows only camelCased or UPPER_CASED variable names
	 */
	'variable-name'?: any[] | boolean;
	/**
	 * Enforces spacing whitespace
	 */
	'whitespace'?: (true | false | 'check-branch' | 'check-decl' | 'check-operator' | 'check-module' | 'check-separator' | 'check-type' | 'check-typecast')[];
	[k: string]: any;
}
export interface Jsruledefinitions {
	/**
	 * Enforces vertical alignment for parameters, arguments and/or statements
	 */
	'align'?: (true | false | 'parameters' | 'arguments' | 'statements')[];
	/**
	 * Requires parentheses around the parameters of arrow function definitions
	 */
	'arrow-parens'?: boolean;
	/**
	 * Bans the use of specific functions or global methods
	 */
	'ban'?: boolean | any[];
	/**
	 * Enforces PascalCased class and interface names
	 */
	'class-name'?: boolean;
	/**
	 * Enforces rules for single-line comments
	 */
	'comment-format'?: (true | false | 'check-space' | 'check-lowercase' | 'check-uppercase')[];
	/**
	 * Enforces documentation for important items be filled out
	 */
	'completed-docs'?: (true | false | 'classes' | 'functions' | 'methods' | 'properties')[];
	/**
	 * Enforces all components having the suffix of 'Component'
	 */
	'component-class-suffix'?: boolean;
	/**
	 * Enforces naming conventions for components
	 */
	'component-selector-name'?: (true | false | 'camelCase' | 'kebab-case')[];
	/**
	 * Enforces all components to have a uniform prefix
	 */
	'component-selector-prefix'?: (boolean | string)[];
	/**
	 * Enforces the type of a component
	 */
	'component-selector-type'?: (true | false | 'attribute' | 'element')[];
	/**
	 * Enforces braces for if/for/do/while statements
	 */
	'curly'?: boolean;
	/**
	 * Enforces a threshold of cyclomatic complexity
	 */
	'cyclomatic-complexity'?: (boolean | number)[];
	/**
	 * Enforces all components having the suffix of 'Directive'
	 */
	'directive-class-suffix'?: boolean;
	/**
	 * Enforces naming conventions for directives
	 */
	'directive-selector-name'?: (true | false | 'camelCase' | 'kebab-case')[];
	/**
	 * Enforces all directives to have a uniform prefix
	 */
	'directive-selector-prefix'?: (boolean | string)[];
	/**
	 * Enforces the type of a directive
	 */
	'directive-selector-type'?: (true | false | 'attribute' | 'element')[];
	/**
	 * Enforces the file to end with a newline
	 */
	'eofline'?: boolean;
	/**
	 * Enforces a certain header comment for all files, matched by a regular expression
	 */
	'file-header'?: (boolean | string)[];
	/**
	 * Enforces a for...in statement to be filtered with an if statement
	 */
	'forin'?: boolean;
	/**
	 * Enforces consistent indentation levels
	 */
	'indent'?: (boolean | number | string)[];
	/**
	 * Enforces basic format rules for jsdoc comments
	 */
	'jsdoc-format'?: boolean;
	/**
	 * Enforces labels only on sensible statements
	 */
	'label-position'?: boolean;
	/**
	 * Enforces a consistent linebreak styl
	 */
	'linebreak-style'?: (true | false | 'CRLF' | 'LF')[];
	/**
	 * A file may not contain more than the specified number of classes
	 */
	'max-classes-per-file'?: (boolean | number)[];
	/**
	 * Requires files to remain under a certain number of lines
	 */
	'max-file-line-count'?: (boolean | number)[];
	/**
	 * Sets the maximum length of a line
	 */
	'max-line-length'?: (boolean | number)[];
	/**
	 * Requires parentheses when invoking a constructor via the `new` keyword
	 */
	'new-parens'?: boolean;
	/**
	 * Disallows access to arguments.callee
	 */
	'no-arg'?: boolean;
	/**
	 * Disallows bitwise operators
	 */
	'no-bitwise'?: boolean;
	/**
	 * Disallows any type of assignment in any conditionals; this applies to do-while, for, if, and while statements
	 */
	'no-conditional-assignment'?: boolean;
	/**
	 * Disallows one or more blank lines in a row
	 */
	'no-consecutive-blank-lines'?: (boolean | number)[];
	/**
	 * Disallows access to the specified functions on console
	 */
	'no-console'?: (true | false | 'assert' | 'count' | 'debug' | 'dir' | 'dirxml' | 'error' | 'group' | 'groupCollapsed' | 'groupEnd' | 'info' | 'log' | 'profile' | 'profileEnd' | 'table' | 'time' | 'timeEnd' | 'timeStamp' | 'trace' | 'warn')[];
	/**
	 * Disallows access to the constructors of String, Number and Boolean
	 */
	'no-construct'?: boolean;
	/**
	 * Disallows debugger statements
	 */
	'no-debugger'?: boolean;
	/**
	 * Disallows default exports in ES6-style modules
	 */
	'no-default-export'?: boolean;
	/**
	 * Disallows duplicate variable declarations in the same block scope
	 */
	'no-duplicate-variable'?: boolean;
	/**
	 * Disallows empty blocks
	 */
	'no-empty'?: boolean;
	/**
	 * Disallows `eval` function invocations
	 */
	'no-eval'?: boolean;
	/**
	 * Disallows iterating over an array with a for-in loop
	 */
	'no-for-in-array'?: boolean;
	/**
	 * Disallows using the `this` keyword outside of classes
	 */
	'no-invalid-this'?: any;
	/**
	 * Disallows use of the `null` keyword literal
	 */
	'no-null-keyword'?: boolean;
	/**
	 * Disallows `/// <reference path=>` imports (use ES6-style imports instead)
	 */
	'no-reference'?: boolean;
	/**
	 * Disallows require() style imports
	 */
	'no-require-imports'?: boolean;
	/**
	 * Disallows shadowing variable declarations
	 */
	'no-shadowed-variable'?: boolean;
	/**
	 * Disallows object access via string literals
	 */
	'no-string-literal'?: boolean;
	/**
	 * Disallows falling through case statements
	 */
	'no-switch-case-fall-through'?: boolean;
	/**
	 * Disallows trailing whitespace at the end of a line
	 */
	'no-trailing-whitespace'?: boolean;
	/**
	 * Disallows control flow statements, such as `return`, `continue`, `break` and `throws` in finally blocks
	 */
	'no-unsafe-finally'?: boolean;
	/**
	 * Disallows unused expression statements
	 */
	'no-unused-expression'?: boolean;
	/**
	 * Disallows unused 'new' expression statements
	 */
	'no-unused-new'?: boolean;
	/**
	 * Disallows usage of variables before their declaration
	 */
	'no-use-before-declare'?: boolean;
	/**
	 * Disallows usage of the var keyword, use let or const instead
	 */
	'no-var-keyword'?: boolean;
	/**
	 * Enforces consistent object literal property quote style
	 */
	'object-literal-key-quotes'?: (true | false | 'always' | 'as-needed')[];
	/**
	 * Enforces use of ES6 object literal shorthand when possible
	 */
	'object-literal-shorthand'?: boolean;
	/**
	 * Requires keys in object literals to be sorted alphabetically
	 */
	'object-literal-sort-keys'?: boolean;
	/**
	 * Enforces the specified tokens to be on the same line as the expression preceding it
	 */
	'one-line'?: (true | false | 'check-open-brace' | 'check-catch' | 'check-finally' | 'check-else' | 'check-whitespace')[];
	/**
	 * Disallows multiple variable definitions in the same declaration statement
	 */
	'one-variable-per-declaration'?: (true | false | 'ignore-for-loop')[];
	/**
	 * Disallows traditional (non-arrow) function expressions
	 */
	'only-arrow-functions'?: (true | false | 'allow-declarations')[];
	/**
	 * Requires that import statements be alphabetized
	 */
	'ordered-imports'?: (Object | boolean | string)[];
	/**
	 * Recommends a 'for-of' loop over a standard 'for' loop if the index is only used to access the array being iterated
	 */
	'prefer-for-of'?: boolean;
	/**
	 * Enforces consistent single or double quoted string literals
	 */
	'quotemark'?: (true | false | 'double' | 'single' | 'jsx-double' | 'jsx-single' | 'avoid-escape')[];
	/**
	 * Enforces the radix parameter of parseInt
	 */
	'radix'?: boolean;
	/**
	 * When adding two variables, operands must both be of type number or of type string
	 */
	'restrict-plus-operands'?: boolean;
	/**
	 * Enforces semicolons at the end of every statement
	 */
	'semicolon'?: (true | false | 'always' | 'never' | 'ignore-bound-class-methods' | 'ignore-interfaces')[];
	/**
	 * Enforces a default case in switch statements
	 */
	'switch-default'?: boolean;
	/**
	 * Requires or disallows trailing commas in array and object literals, destructuring assignments, function and tuple typings, named imports and function parameters
	 */
	'trailing-comma'?: (Object | boolean | string)[];
	/**
	 * Enforces === and !== in favor of == and !=
	 */
	'triple-equals'?: any[] | boolean;
	/**
	 * Enforces use of the `isNaN()` function to check for NaN references instead of a comparison to the `NaN` constant
	 */
	'use-isnan'?: boolean;
	/**
	 * Allows only camelCased or UPPER_CASED variable names
	 */
	'variable-name'?: any[] | boolean;
	/**
	 * Enforces spacing whitespace
	 */
	'whitespace'?: (true | false | 'check-branch' | 'check-decl' | 'check-operator' | 'check-module' | 'check-separator' | 'check-type' | 'check-typecast')[];
	[k: string]: any;
}
export interface JsonSchemaForTheTsLintConfigurationFiles {
	/**
	 * The directory where the codelytics rules live
	 */
	'rulesDirectory'?: string[];
	'rules'?: Ruledefinitions;
	'jsRules'?: Jsruledefinitions;
	/**
	 * Extend another configuration (built in config OR a node resolvable .json file)
	 */
	'extends'?: any[] | string;
	[k: string]: any;
}
