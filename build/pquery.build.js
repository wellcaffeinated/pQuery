/* 
 * build profile for pQuery
 * All config options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
 * r.js -o ./pquery.build.js 
 */
({
	appDir: '../src',
    baseUrl: './',
    dir: '../build/pquery-built',
    optimize: 'uglify',

    // wrap in fake implementation of requirejs for module registration... not script loading
    wrap: {
        startFile: 'wrap/start.frag',
        endFile: 'wrap/end.frag'
    },
    modules: [
    	{
    		name: 'pquery',
    		include: [
    			'pquery'
    		]
    	}
    ]
})