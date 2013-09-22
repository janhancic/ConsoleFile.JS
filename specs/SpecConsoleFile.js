describe( 'ConsoleFile.JS', function() {

	beforeEach( function () {
		// mock out the FileSystem API
		navigator.webkitPersistentStorage.requestQuota = function ( requestQuotaBytes, callback ) {
			callback( requestQuotaBytes );
		};

		window.webkitRequestFileSystem = function ( type, grantedBytes, callback ) {
			var fs = {
				root: {
					getDirectory: function ( name, options, callback ) {
						callback( fs );
					},
					getFile: function ( fileName, options, callback ) {
						var fsFile = {
							createWriter: function ( callback ) {
								var fileWriter = {
									seek: function () {},
									write: function () {}
								};

								callback( fileWriter );
							}
						};

						callback( fsFile );
					}
				}
			};

			callback( fs );
		};
	} );

	it( 'todo', function () {
		expect( true ).toBe( true );
	} );

} );