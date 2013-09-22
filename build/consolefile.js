(function ( console ) {
function ConsoleFileBase ( fileWriter ) {
	this._fileWriter = fileWriter;

	this._writeOptions = {
		logTime: true,
		stringifyObjects: true
	};
}

/**
 * Sets new options for how the log is written.
 * Available options:
 * 	- `logTime`: (boolean) add time to the each log line
 * 	- `stringifyObjects`: (boolean) if `true` non-primitive 
 * 	 values will be passed trough `JSON.stringify()` before 
 * 	 being written to the log.
 * @param {String} key Option name
 * @param {String} value Option value
 */
ConsoleFileBase.prototype.setSetting = function ( key, value ) {
	this._writeOptions[key] = value;
};

ConsoleFileBase.prototype.log = function () {
};

ConsoleFileBase.prototype.info = function () {
};

ConsoleFileBase.prototype.warn = function () {
};

ConsoleFileBase.prototype.error = function () {
};

function ConsoleFileBuffer ( fileWriter ) {
	ConsoleFileBase.call( this, file );

	this._buffer = {
		'log': []
	};
}
ConsoleFileBuffer.prototype = new ConsoleFileBase();
ConsoleFileBuffer.prototype.constructor = ConsoleFileBuffer;

ConsoleFileBuffer.prototype.getBuffer = function () {
	return this._buffer;
};

ConsoleFileBuffer.prototype.log = function () {
	var buffer = [];
	buffer.push( Array.prototype.slice.call( arguments ) );

	this._buffer.log.push( buffer );
};

/**
 * @class
 * @constructor
 * Constructs a new ConsoleFile. The construction is handled by the 
 * console.file(), as a user you never instantiate this class.
 * 
 * @param {Object} fileWriter FS FileWriter object
 */
function ConsoleFile ( fileWriter ) {
	ConsoleFileBase.call( this, file );
}
ConsoleFile.prototype = new ConsoleFileBase();
ConsoleFile.prototype.constructor = ConsoleFile;

ConsoleFile.prototype.log = function () {
	var args = Array.prototype.slice.call( arguments );
	args.unshift( 'LOG' );

	this._write.apply( this, args );
};

ConsoleFile.prototype._write = function ( prefix /*, arguments */ ) {
	var stringToWrite = '[' + prefix + '] ';

	if ( this._writeOptions.logTime === true ) {
		stringToWrite += Date() + ' ';
	}

	var args = Array.prototype.slice.call( arguments, 1 );
	args.forEach( function ( value, idx, arr ) {
		if ( this._writeOptions.stringifyObjects === true ) {
			if ( typeof value === 'object' ) {
				stringToWrite += JSON.stringify( value );
			} else {
				stringToWrite += value;
			}
		} else {
			stringToWrite += value;
		}

		if ( idx !== arr.length - 1 ) {
			stringToWrite += ', ';
		}

	}.bind( this ) );

	this._writeToFile ( stringToWrite );
};

ConsoleFile.prototype._writeToFile = function ( stringToWrite ) {
	this._fileWriter.seek( this._fileWriter.length );

	var blob = new Blob( [ stringToWrite ], { type: 'text/plain' } );
	this._fileWriter.write( blob );
	console.log('writing to disk');
};

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
function patchConsole () {
	var nopConsoleFile = new ConsoleFileBase();

	console.file = function () {
		return nopConsoleFile;
	};

	console.file.setSetting = nopConsoleFile.setSetting;
	console.file.log = nopConsoleFile.log;
	console.file.info = nopConsoleFile.info;
	console.file.warn = nopConsoleFile.warn;
	console.file.error = nopConsoleFile.error;
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

function getFileSystem ( onFSInitialisedCallback ) {
	var fs;

	navigator.webkitPersistentStorage.requestQuota(
		requestQuotaBytes,
		quotaGranted,
		function ( e ) {
			patchConsole();
			console.warn( 'ConsoleFile.JS cannot run as it can\'t allocate enough persistent storage. Tried to allocate: ' + requestQuotaBytes );
		}
	);

	function quotaGranted ( grantedBytes ) {
		window.webkitRequestFileSystem(
			window.PERSISTENT,
			grantedBytes,
			fileSystemInitialised,
			fsErrorHandler
		);
	}

	function fileSystemInitialised ( fsObject ) {
		fs = fsObject;

		// create "log" folder, then initialize the console.file()
		fs.root.getDirectory(
			'log',
			{ create: true },
			logDirectoryCreated,
			fsErrorHandler
		);
	}

	function logDirectoryCreated ( dirEntry ) {
		onFSInitialisedCallback( fs );
	}
}

// start glue code

// check browser support andif no support, use the ConsoleFileBase (a NOP class) for console.file() and console.file
if ( isBrowserSupported() === false ) {
	patchConsole();
	console.warn( 'ConsoleFile.JS cannot run under this browser.' );

	return;
}

var fs,
	cfObjects = {},
	requestQuotaBytes = 10 * 1024 * 1024; // 10MB

console.file = function ( fileName ) {
	if ( !fileName ) {
		fileName = 'default';
	}

	if ( !cfObjects[fileName] ) {
		if ( fs !== null ) {
			getFileWriter( fileName, onFileWriterCreated );
		}

		cfObjects[fileName] = new ConsoleFileBuffer();
	}

	return cfObjects[fileName];
};

// setup default
console.file( 'default' );

// get the FS
getFileSystem( onFileSystemInitialised );

function onFileSystemInitialised ( fileSystem ) {
	fs = fileSystem;
	
}

function onFileWriterCreated ( fileName, fileWriter ) {

};

/*
1. check browser support
	1.1 if no support, use the ConsoleFileBase (a NOP class) for console.file() and console.file
	1.2 return
2. create ConsoleFileBuffer on console.file() and console.file
3. start the get FS object process
	3.1 when FS object acquired, loop trough existing CFBs and start creating writers
	3.2 when fileWritter acquired, create new CF for that fileWritter
	3.3 loop trough the buffered calls and feed them to CF
	3.4 replace CFB with CF
*/

}( console ) );
