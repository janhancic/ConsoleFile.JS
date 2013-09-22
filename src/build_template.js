(function ( console ) {
/*# ConsoleFileBase.js #*/

/*# ConsoleFileBuffer.js #*/

/*# ConsoleFile.js #*/

/*# auxiliary.js #*/

/*# file_system.js #*/

// start glue code

// check browser support andif no support, use the ConsoleFileBase (a NOP class) for console.file() and console.file
if ( isBrowserSupported() === false ) {
	patchConsole();
	console.warn( 'ConsoleFile.JS cannot run under this browser.' );

	return;
}

var fs,
	cfObjects = {},
	requestQuotaBytes = 10 * 1024 * 1024; // 10MB

console.file = function ( fileName ) {
	if ( !fileName ) {
		fileName = 'default';
	}

	if ( !cfObjects[fileName] ) {
		if ( fs !== null ) {
			getFileWriter( fileName, onFileWriterCreated );
		}

		cfObjects[fileName] = new ConsoleFileBuffer();
	}

	return cfObjects[fileName];
};

// setup default
console.file( 'default' );

// get the FS
getFileSystem( onFileSystemInitialised );

function onFileSystemInitialised ( fileSystem ) {
	fs = fileSystem;
	
}

function onFileWriterCreated ( fileName, fileWriter ) {

};

/*
1. check browser support
	1.1 if no support, use the ConsoleFileBase (a NOP class) for console.file() and console.file
	1.2 return
2. create ConsoleFileBuffer on console.file() and console.file
3. start the get FS object process
	3.1 when FS object acquired, loop trough existing CFBs and start creating writers
	3.2 when fileWritter acquired, create new CF for that fileWritter
	3.3 loop trough the buffered calls and feed them to CF
	3.4 replace CFB with CF
*/

}( console ) );
