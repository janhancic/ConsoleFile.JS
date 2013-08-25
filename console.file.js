(function () {
	checkIfBrowserIsSupported();

	var instances = {};

	// request permission from browser

	/**
	 *
	 */
	console.file = function ( fileName ) {
		if ( !fileName ) {
			fileName = 'default';
		}

		if ( !instances[fileName] ) {
			instances[fileName] = new ConsoleFile( fileName );
		}

		return instances[fileName];
	};

	ConsoleFile = function ( fileName ) {
		this._fileName = fileName;
	};

	ConsoleFile.prototype.log = function ( tmpString ) {
		console.log( 'logging to file: ' + this._fileName + ' #### ' + tmpString );
	};

	ConsoleFile.prototype.info = function () {

	};

	ConsoleFile.prototype.warn = function () {

	};

	ConsoleFile.prototype.error = function () {

	};

	// private utility functions

	function checkIfBrowserIsSupported () {
		if ( !window.console ) {
			throw new Error( 'Your browser does not support the console API. console.file.JS can\'t run.');
		}

		if ( !window.requestFileSystem && !window.webkitRequestFileSystem ) {
			throw new Error( 'Your browser does not support the FileSystem API. console.file.JS can\'t run.');
		}
	};

}() );