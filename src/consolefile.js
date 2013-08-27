(function () {
	if ( isBrowserSupported() === false ) {
		patchConsole();
		console.warn( 'ConsoleFile.JS cannot run under this browser.' );

		return;
	}

	var requestQuotaBytes = 10 * 1024 * 1024; // 10MB

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

	var instances = {};
	var fs = null;

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

	// TODO, create a list of functions, and dynamically add them to 
	// console.file & to the stubed version of console.file from patchCOnsole()
	// so I don't have to repeat them all the time, and potentially reduce the 
	// risk of errors
	console.file.log = function () {
		instances['default'].log.apply( instances['default'], arguments );
	};

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
	 * TODO
	 */
	ConsoleFile.prototype.log = function ( tmpString ) {
		// console.log( 'logging to file: ' + this._fileName + ' #### ' + tmpString );
		this._write( 'log ', tmpString );
	};

	ConsoleFile.prototype.setFs = function ( fs ) {
		this._fs = fs;
		this._initFile();
	};

	// TODO: think about taking the private methods off of prototype so users can't see/access them
	/** @private */
	ConsoleFile.prototype._write = function ( prefix, str ) {
		var stringToWrite = prefix + str + "\n";

		this._cache.push ( stringToWrite );
	};

	/** @private */
	ConsoleFile.prototype._flushCacheToFile = function () {
		// Create a FileWriter object for our FileEntry (log.txt).
		this._fsFile.createWriter(
			function( fileWriter ) {
				fileWriter.seek( fileWriter.length );

				// TODO for some reason this gets called but the thing isn't written into a file
				// maybe I can change this so that stuff is flushed into the file in a timeout, so 
				// I can have control over file operations (only one at a time) as to avoid writing to the file
				// from two different locations
				// NEEDS INVESTIGATING
				var blob = new Blob( this._cache, {type: 'text/plain'} );
				fileWriter.write( blob );
				console.log('flushing cache');

				this._cache = [];
			}.bind( this ),
			fsErrorHandler
		);
	};

	ConsoleFile.prototype._initFile = function () {
		this._fs.root.getFile(
			'log/' + this._fileName + '.log',
			{
				create: true,
				exclusive: false
			},
			function( fsFile ) {
				this._fsFile = fsFile;
				this._startFlushing();
			}.bind( this ),
			fsErrorHandler
		);
	};

	/** @private */
	ConsoleFile.prototype._startFlushing = function () {
		if ( this._isWriting === true ) {
			return;
		}

		this._isWriting = true;
		this._fsFile.createWriter(
			function( fileWriter ) {
				fileWriter.seek( fileWriter.length );

				var toWrite = this._cache.slice();
				this._cache = [];
				var blob = new Blob( toWrite, {type: 'text/plain'} );
				fileWriter.write( blob );
				console.log('writing to disk');

				this._isWriting = false;
				// TODO: this is no good ... just a first draft if you will
				// this flushing to disk needs to be smarter, as in, flush to disk, then don't start 
				// a new timeout until there is actually something to write in the _cache
				// and also handle so it doesn't flush after each call to _write() ... but only after X 
				// amounts of entries or after a certain amount of time.
				// or maybe, just after some time after something was written and then just reset the timeout
				// each time there is a new write or something like that. Have to test it out. writing 
				setTimeout( this._startFlushing.bind( this ), 50 );
			}.bind( this ),
			fsErrorHandler
		);
	};

	// ConsoleFile.prototype.info = function () {};
	// ConsoleFile.prototype.warn = function () {};
	// ConsoleFile.prototype.error = function () {};
	// };

	// private utility functions

	function isBrowserSupported () {
		if ( !navigator.webkitPersistentStorage ) {
			return false;
		}

		return true;
	};

	function patchConsole () {
		console.file = function () {
			var nopFunction = function () {};

			return {
				log: nopFunction,
				info: nopFunction,
				warn: nopFunction,
				error: nopFunction
			};
		};
	};

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

}() );