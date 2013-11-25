function ConsoleFile ( fileName ) {
	this._fsFile = null;
	this._logsToWrite = [];

	FileSystemUtil.getFsFile( fileName, this._storeFsFile.bind( this ) );
}

ConsoleFile.prototype.log = function ( thingToLog ) {
	if ( this._fsFile === null ) {
		console.log( 'logging to "cache"', thingToLog );
		this._logsToWrite.push( thingToLog );
	} else {
		console.log( 'fileWriter is ready', thingToLog );
		this._write( thingToLog );
	}
};

ConsoleFile.prototype._storeFsFile = function ( fsFile ) {
	this._fsFile = fsFile;
	console.log( 'got the fileWriter' );

	this._logsToWrite.forEach( function( logToWrite ) {
		this._write( logToWrite );
	}.bind( this ) );

	this._logsToWrite = [];
};

ConsoleFile.prototype._write = function ( thingToLog ) {
	this._fsFile.createWriter(
		function( fileWriter ) {
			fileWriter.seek( fileWriter.length );

			// TODO: for some reason only the last thing gets written to the file, dunno why
			var blob = new Blob( [ thingToLog ], { type: 'text/plain' } );
			fileWriter.write( blob );
			console.log( 'writing to disk', thingToLog );
		}.bind( this ),
		function () {
			throw new Error( 'Cant write log file' );
		}
	);
};
