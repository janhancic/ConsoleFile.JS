(function ( console ) {
	var consoleFileMethods = ['log', 'warn', 'error', 'info'],
		instances = {},
		fs = null,
		requestQuotaBytes = 10 * 1024 * 1024; // 10MB

	if ( isBrowserSupported() === false ) {
		patchConsole(consoleFileMethods);
		console.warn( 'ConsoleFile.JS cannot run under this browser.' );

		return;
	}

	navigator.webkitPersistentStorage.requestQuota(
		requestQuotaBytes,
		function( grantedBytes ) {
			window.webkitRequestFileSystem(
				window.PERSISTENT,
				grantedBytes,
				function ( fs ) {
					// create "log" folder, then initialize the console.file()
					fs.root.getDirectory(
						'log',
						{ create: true },
						function ( dirEntry ) {
							initFs( fs );
						},
						fsErrorHandler
					);
				},
				fsErrorHandler
			);
		},
		function ( e ) {
			patchConsole();
			console.warn( 'ConsoleFile.JS cannot run as it can\'t allocate enough persistent storage. Tried to allocate: ' + requestQuotaBytes );
		}
	);

	function initFs ( fileSystem ) {
		fs = fileSystem;
		// file system initialized, go trough all instances and set the fs object so they can start writing to files.
		Object.keys( instances ).forEach( function ( fileName ) {
			instances[fileName].setFs( fs );
		} );
	};

	// ConsoleFile object used as the default log file (console.file.log())
	instances['default'] = new ConsoleFile( fs, 'default' );

	/**
	 * Starting point of ConsoleFile.JS
	 * 
	 * Can be used as a function to which you pass the name of the log file,
	 * and it will return a ConsoleFile object that has methods such as .log(), 
	 * .warn(), ...
	 *
	 * Or can be used as a property of the console object, which in turn contains 
	 * the same methods as the ConsoleFile. This form basically allows you to omit 
	 * the () when you want to log to the default file.
	 * In other words, this are all equivalent:
	 * <code>
	 * console.file( 'default' ).log( 'something' );
	 * console.file().log( 'something' );
	 * console.file.log( 'something' );
	 * </code>
	 *
	 * @param {String} File name of the log file to use for the ConsoleFile object 
	 *  that is returned from this function. Defaults to 'default'.
	 */
	console.file = function ( fileName ) {
		if ( !fileName ) {
			fileName = 'default';
		}

		if ( !instances[fileName] ) {
			instances[fileName] = new ConsoleFile( fs, fileName );
		}

		return instances[fileName];
	};

	var consoleFilePrivate = {
		/**
		 * Holds the logic for writing to file for .log(), .warn(), ...
		 * @param {String} prefix the prefix to put before each log line
		 * @param {String} the string to write to the log file
		 */
		write: function ( cf, prefix, str ) {
			var stringToWrite = prefix + str + "\n";

			cf._cache.push ( stringToWrite );
		},
		/**
		 * Called when the FS is ready. It will obtain the file 
		 *  object for the log file, and kick off flushing to the 
		 *  file. 
		 */
		initFile: function ( cf ) {
			cf._fs.root.getFile(
				'log/' + cf._fileName + '.log',
				{
					create: true,
					exclusive: false
				},
				function( fsFile ) {
					cf._fsFile = fsFile;
					consoleFilePrivate.startFlushing( cf );
				},
				fsErrorHandler
			);
		},
		startFlushing: function ( cf ) {
			if ( cf._isWriting === true ) {
				return;
			}

			cf._isWriting = true;
			cf._fsFile.createWriter(
				function( fileWriter ) {
					fileWriter.seek( fileWriter.length );

					var toWrite = cf._cache.slice();
					cf._cache = [];
					var blob = new Blob( toWrite, {type: 'text/plain'} );
					fileWriter.write( blob );
					console.log('writing to disk');

					cf._isWriting = false;
					// TODO: this is no good ... just a first draft if you will
					// this flushing to disk needs to be smarter, as in, flush to disk, then don't start 
					// a new timeout until there is actually something to write in the _cache
					// and also handle so it doesn't flush after each call to _write() ... but only after X 
					// amounts of entries or after a certain amount of time.
					// or maybe, just after some time after something was written and then just reset the timeout
					// each time there is a new write or something like that. Have to test it out. writing 
					setTimeout( function () { consoleFilePrivate.startFlushing( cf ); }, 50 );
				},
				fsErrorHandler
			);
		}
	};

	/**
	 * @class
	 * @constructor
	 * Constructs a new ConsoleFile. The construction is handled by the 
	 * console.file(), as a user you never instantiate this class.
	 * 
	 * @param {Object} fs FileSystem object
	 * @param {String} fileName Name of the log file to use
	 */
	function ConsoleFile ( fs, fileName ) {
		this._fileName = fileName;

		this._fs = null;
		this._fsFile = null;
		this._isWriting = false;
		this._cache = [];

		if ( this._fs !== null ) {
			this.setFs( fs );
		}
	};

	/**
	 * Writes the arguments you pass into a log file.
	 */
	ConsoleFile.prototype.log = function ( tmpString ) {
		// console.log( 'logging to file: ' + this._fileName + ' #### ' + tmpString );
		consoleFilePrivate.write( this, 'log ', tmpString );
	};

	// TODO: this should be private
	ConsoleFile.prototype.setFs = function ( fs ) {
		this._fs = fs;
		consoleFilePrivate.initFile( this );
	};

	// ConsoleFile.prototype.info = function () {};
	// ConsoleFile.prototype.warn = function () {};
	// ConsoleFile.prototype.error = function () {};
	// };

	// provide shortcut methods, so you can use console.file.log() instead of console.file().log()
	consoleFileMethods.forEach( function ( methodName ) {
		console.file[methodName] = function () {
			instances['default'][methodName].apply( instances['default'], arguments );
		};
	} );

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

		console.log( 'ConsoleFile.JS FileSystem error: ' + msg, e) ;
	};

}( console ) );
