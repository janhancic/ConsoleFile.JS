(function ( console ) {
function FileSystemUtil () {
	var requestQuotaBytes = 10 * 1024 * 1024; // 10MB

	this._fs = null;
	this._pendingFileWriterRequests = [];

	setTimeout(
		function () {
			this._fsRequestQuota( requestQuotaBytes );
		}.bind( this ),
		500
	);
};

FileSystemUtil.prototype.getFsFile = function( fileName, callBack ) {
	if ( this._fs === null ) {
		console.log( 'file system not ready, cant request writter yet');
		this._pendingFileWriterRequests.push( {
			fileName: fileName,
			callBack: callBack
		} );
	} else {
		this._getFsFile( fileName, callBack );
	}
};

FileSystemUtil.prototype._getFsFile = function( fileName, callBack ) {
	this._fs.root.getFile(
		'log/' + fileName + '.log',
		{
			create: true,
			exclusive: false
		},
		function( fsFile ) {
			callBack( fsFile );
		}.bind( this ),
		this._fsErrorHandler
	);
};

FileSystemUtil.prototype._fsRequestQuota = function( requestQuotaBytes ) {
	navigator.webkitPersistentStorage.requestQuota(
		requestQuotaBytes,
		this._fsQuotaGranted.bind( this ),
		function (/* e */) {
			var errorMsg = 'ConsoleFile.JS cannot run as it can\'t allocate enough persistent storage.';
			errorMsg += ' Tried to allocate: ' + requestQuotaBytes;
			throw new Error( errorMsg );
		}
	);
};

FileSystemUtil.prototype._fsQuotaGranted = function( grantedBytes ) {
	window.webkitRequestFileSystem(
		window.PERSISTENT,
		grantedBytes,
		this._fsFileSystemReady.bind( this ),
		this._fsErrorHandler
	);
};

FileSystemUtil.prototype._fsFileSystemReady = function ( fs ) {
	fs.root.getDirectory(
		'log',
		{ create: true },
		this._fsLogFolderCreated.bind( this, fs ),
		this._fsErrorHandler
	);
};

FileSystemUtil.prototype._fsLogFolderCreated = function ( fs ) {
	this._fs = fs;

	this._pendingFileWriterRequests.forEach( function ( pending ) {
		this._getFsFile( pending.fileName, pending.callBack );
	}.bind( this ) );

	this._pendingFileWriterRequests = [];
};

FileSystemUtil.prototype._fsErrorHandler = function ( error ) {
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

	// TODO: figure out where "e" comes from
	throw new Error( 'ConsoleFile.JS FileSystem error: ' + msg, e );
};

FileSystemUtil = new FileSystemUtil();
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


	window.ConsoleFile = ConsoleFile;

}( console ) );
