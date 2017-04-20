export interface BuildWebpackJson {
	'locale'?: string;
	'messageBundles'?: string | string[];
	'supportedLocales'?: string | string[];
	'watch'?: boolean;
	'port'?: number;
	'element'?: string;
	'elementPrefix'?: string;
	'withTests'?: boolean;
	'debug'?: boolean;
	'disableLazyWidgetDetection'?: boolean;
	'bundles'?: { [bundle: string]: string[] };
}

export interface DojoRcJson {
	'build-webpack'?: BuildWebpackJson;
	[k: string]: any;
}
