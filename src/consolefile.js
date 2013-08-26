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
							initConsoleFile( fs );
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

	function initConsoleFile ( fs ) {
		var instances = {};

		/**
		 *
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

		function ConsoleFile ( fs, fileName ) {
			this._fs = fs;
			this._fileName = fileName;

			this._fsIsReady = false;
			this._fsCache = [];

			fs.root.getFile(
				'log/' + this._fileName + '.log',
				{
					create: true,
					exclusive: false
				},
				function( fsFile ) {
					this._fsIsReady = true;
					this._fsFile = fsFile;
					this._flushCacheToFile();
				}.bind( this ),
				fsErrorHandler
			);
		};

		/**
		 * TODO
		 */
		ConsoleFile.prototype.log = function ( tmpString ) {
			// console.log( 'logging to file: ' + this._fileName + ' #### ' + tmpString );
			this._write( 'log ', tmpString );
		};

		/** @private */
		ConsoleFile.prototype._write = function ( prefix, str ) {
			var stringToWrite = prefix + str + "\n";

			if ( this._fsIsReady === false ) {
				// if we don't yet have a handle to a log file, we will write to this 
				// cache, and then once the file handle has been obtained, the contents 
				// of this cache will be written to disk
				this._fsCache.push ( stringToWrite );
				console.log( 'writing to cache ', str );
			} else {
				console.log( 'writing to file ', str );
				this._fsFile.createWriter(
					function( fileWriter ) {
						fileWriter.seek( fileWriter.length );

						var blob = new Blob( [stringToWrite], {type: 'text/plain'} );
						fileWriter.write( blob );
					}.bind( this ),
					fsErrorHandler
				);
			}
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
					var blob = new Blob( this._fsCache, {type: 'text/plain'} );
					fileWriter.write( blob );

					this._fsCache = [];
				}.bind( this ),
				fsErrorHandler
			);
		};

		// ConsoleFile.prototype.info = function () {};
		// ConsoleFile.prototype.warn = function () {};
		// ConsoleFile.prototype.error = function () {};
	};

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