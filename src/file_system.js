function getFileSystem ( onFSInitialisedCallback ) {
	var fs;

	navigator.webkitPersistentStorage.requestQuota(
		requestQuotaBytes,
		quotaGranted,
		function ( e ) {
			patchConsole();
			console.warn( 'ConsoleFile.JS cannot run as it can\'t allocate enough persistent storage. Tried to allocate: ' + requestQuotaBytes );
		}
	);

	function quotaGranted ( grantedBytes ) {
		window.webkitRequestFileSystem(
			window.PERSISTENT,
			grantedBytes,
			fileSystemInitialised,
			fsErrorHandler
		);
	}

	function fileSystemInitialised ( fsObject ) {
		fs = fsObject;

		// create "log" folder, then initialize the console.file()
		fs.root.getDirectory(
			'log',
			{ create: true },
			logDirectoryCreated,
			fsErrorHandler
		);
	}

	function logDirectoryCreated ( dirEntry ) {
		onFSInitialisedCallback( fs );
	}
}