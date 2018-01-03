export let verboseFlag = false;

/**
 * Log a message to the console
 * @param text The message to be logged
 */
export function log(...text: any[]) {
	console.log(text.join(''));
}

/**
 * Log a message to the console if verbose messages are desired
 * @param text The message to be logged
 */
export function verbose(...text: any[]) {
	if (!verboseFlag) {
		return;
	}
	log(...text);
}

/**
 * Indents a message
 * @param num the number of indents
 * @param message an optional message to add at the end
 */
export function indent(num: number = 1, message: string = '') {
	for (let i = 0; i < num; i++) {
		message = '  ' + message;
	}
	return message;
}

export function setVerbose(verbose: boolean) {
	verboseFlag = verbose;
}
