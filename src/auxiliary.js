/**
 * @private
 * Determines if the browser supports everything this library needs 
 *  in order to work
 *  
 * @return {Boolean}
 */
function isBrowserSupported () {
	if ( !navigator.webkitPersistentStorage ) {
		return false;
	}

	return true;
};

/**
 * @private
 * If the browser is not supported this function will be called, 
 *  which sets up the console.file() & console.file as if the 
 *  browser was supported. This allows the user to use the library 
 *  and not have to worry about it breaking in unsupported browsers.
 */
function patchConsole ( consoleFileMethods ) {
	var nopFunction = function () { console.log('nop')};

	console.file = function () {
		var returnObj = {};

		consoleFileMethods.forEach( function ( methodName ) {
			returnObj[methodName] = nopFunction;
		} );

		return returnObj;
	};

	consoleFileMethods.forEach( function ( methodName ) {
		console.file[methodName] = nopFunction;
	} );
};

/**
 * @private
 * General FileSystem API error handler.
 */
function fsErrorHandler ( error ) {
	var msg = '';

	switch (e.code) {
		case FileError.QUOTA_EXCEEDED_ERR:
			msg = 'QUOTA_EXCEEDED_ERR';
		break;

		case FileError.NOT_FOUND_ERR:
			msg = 'NOT_FOUND_ERR';
		break;

		case FileError.SECURITY_ERR:
			msg = 'SECURITY_ERR';
		break;

		case FileError.INVALID_MODIFICATION_ERR:
			msg = 'INVALID_MODIFICATION_ERR';
		break;

		case FileError.INVALID_STATE_ERR:
			msg = 'INVALID_STATE_ERR';
		break;

		default:
			msg = 'Unknown Error';
		break;
	};

	console.log( 'ConsoleFile.JS FileSystem error: ' + msg, e);
};