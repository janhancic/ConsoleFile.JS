// provide shortcut methods, so you can use console.file.log() instead of console.file().log()
consoleFileMethods.forEach( function ( methodName ) {
	console.file[methodName] = function () {
		instances['default'][methodName].apply( instances['default'], arguments );
	};
} );