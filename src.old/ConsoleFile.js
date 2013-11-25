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