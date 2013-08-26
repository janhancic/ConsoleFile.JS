module.exports = function( grunt ) {
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'src/consolefile.js',
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
		}
	} );

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify' );

	grunt.loadNpmTasks('grunt-http-server');

	// Default task(s).
	grunt.registerTask( 'default', ['uglify'] );
};