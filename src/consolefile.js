(function () {
	checkIfBrowserIsSupported();

	var instances = {};

	// request permission from browser
	(window.requestFileSystem || window.webkitRequestFileSystem)( window.PERSISTENT, 5 * 1024 * 1024, onInitFs, errorHandler );

	function onInitFs(fs) {

	  fs.root.getFile('log.txt', {create: true, exclusive: true}, function(fileEntry) {

	    // fileEntry.isFile === true
	    // fileEntry.name == 'log.txt'
	    // fileEntry.fullPath == '/log.txt'

	  }, errorHandler);

	}

	function errorHandler(e) {
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

	  console.log('Error: ' + msg, e);
	}

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