(function ( console ) {
function ConsoleFile ( fileName ) {
	this._getFileWriter( fileName );
	this._fileWriter = null;
	this._logsToWrite = [];
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

ConsoleFile.prototype._getFileWriter = function ( fileName ) {

};


	window.ConsoleFile = ConsoleFile;

}( console ) );
