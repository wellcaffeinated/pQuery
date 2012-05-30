/* 
 * build profile for pQuery
 * All config options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
 * node r.js -o ./pquery.build.js 
 */
({
	baseUrl: '../src',
    name: 'almond',
    include: ['pquery'],
    out: '../release/pquery.min.js',
    optimize: 'none',

    paths: {
        almond: '../lib/almond'
    },
    
    // wrap in fake implementation of requirejs for module registration... not script loading
    wrap: {
        startFile: 'wrap/start.frag',
        endFile: 'wrap/end.frag'
    }
    
})