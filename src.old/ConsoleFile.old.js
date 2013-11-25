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
		this._setFs( fs );
	}

	this._writeOptions = {
		logTime: true,
		stringifyObjects: true
	};
};

/**
 * Writes the arguments you pass into a log file.
 */
ConsoleFile.prototype.log = function () {
	var args = Array.prototype.slice.call( arguments );
	args.unshift( 'LOG' );

	this._write.apply( this, args );
};

ConsoleFile.prototype.info = function () {
	var args = Array.prototype.slice.call( arguments );
	args.unshift( 'INFO' );

	this._write.apply( this, args );
};

ConsoleFile.prototype.warn = function () {
	var args = Array.prototype.slice.call( arguments );
	args.unshift( 'WARN' );

	this._write.apply( this, args );
};

ConsoleFile.prototype.error = function () {
	var args = Array.prototype.slice.call( arguments );
	args.unshift( 'ERROR' );

	this._write.apply( this, args );
};

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
ConsoleFile.prototype.setSetting = function ( key, value ) {
	this._writeOptions[key] = value;
};

/**
 * @private
 * This method will be called from the outside, but is 
 *  not part of the public API.
 */
ConsoleFile.prototype._setFs = function ( fs ) {
	this._fs = fs;
	this._initFile();
};

/**
 * @private
 * Holds the logic for writing to file for .log(), .warn(), ...
 * @param {String} prefix the prefix to put before each log line
 * @param {String} the string to write to the log file
 */
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

	this._cache.push ( stringToWrite );
};

/**
 * @private
 * Called when the FS is ready. It will obtain the file 
 *  object for the log file, and kick off flushing to the 
 *  file. 
 */
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
			JJJ= toWrite;
			this._cache = [];
			var blob = new Blob( toWrite, { type: 'text/plain' } );
			fileWriter.write( blob );
			console.log('writing to disk');

			this._isWriting = false;
			// TODO: this is no good ... just a first draft if you will
			// this flushing to disk needs to be smarter, as in, flush to disk, then don't start 
			// a new timeout until there is actually something to write in the _cache
			// and also handle so it doesn't flush after each call to _write() ... but only after X 
			// amounts of entries or after a certain amount of time.
			// or maybe, just after some time after something was written and then just reset the timeout
			// each time there is a new write or something like that. Have to test it out. 
			// setTimeout( this._startFlushing.bind( this ), 50 );
		}.bind( this ),
		fsErrorHandler
	);
};