function ConsoleFile ( fileName ) {
	this._fileWriter = null;
	this._logsToWrite = [];

	FileSystemUtil.getFileWriter( fileName, this._storeFileWriter.bind( this ) );
}

ConsoleFile.prototype.log = function ( thingToLog ) {
	if ( this._fileWriter === null ) {
		console.log( 'logging to "cache"' );
		console.log( thingToLog );
		this._logsToWrite.push( thingToLog );
	} else {
		console.log( 'fileWriter is ready' );
	}
};

ConsoleFile.prototype._storeFileWriter = function ( fileWriter ) {
	this._fileWriter = fileWriter;
	console.log( 'got the fileWriter' );
};
