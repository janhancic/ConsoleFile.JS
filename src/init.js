var consoleFileMethods = [ 'log', 'warn', 'error', 'info', 'setSetting' ],
	instances = {},
	fs = null,
	requestQuotaBytes = 10 * 1024 * 1024; // 10MB

if ( isBrowserSupported() === false ) {
	patchConsole( consoleFileMethods );
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
		instances[fileName]._setFs( fs );
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
 * @return {ConsoleFile} A new (or existing) instance of the `ConsoleFile` 
 *  class for the given `fileName`.
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