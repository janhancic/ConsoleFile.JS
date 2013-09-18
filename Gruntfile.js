module.exports = function( grunt ) {
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'build/consolefile.js',
				dest: 'build/consolefile.min.js'
			}
		},
		'http-server': {
			'dev': {
				root: '.',
				port: 8080,
				host: "127.0.0.1",
				showDir : true,
				autoIndex: true,
				defaultExt: "html",
			}
		},
		watch: {
			src: {
				files: [ 'src/*' ],
				tasks: [ 'stich-src-files' ],
			}
		}
	} );

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify' );
	grunt.loadNpmTasks('grunt-http-server');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task(s).
	grunt.registerTask( 'default', ['uglify'] );

	grunt.registerTask( 'stich-src-files', 'Stiches source file together', function () {
		var templateFileContents = grunt.file.read( 'src/build_template.js' );

		// matches: /*# FILE_NAME.js #*/
		var matchesToReplace = templateFileContents.match( /\/\*# (.*?)\.js #\*\//g );

		matchesToReplace.forEach( function ( match ) {
			var fileName = match.replace( '/*# ', '' ).replace( ' #*/', '' );
			var srcFileContents = grunt.file.read( 'src/' + fileName );

			templateFileContents = templateFileContents.replace( match, srcFileContents );
		} );

		grunt.file.write( 'build/consolefile.js', templateFileContents );
	} );
};