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
    //optimize: 'none',

    paths: {
        almond: '../lib/almond'
    },
    
    // wrap in fake implementation of requirejs for module registration... not script loading
    wrap: {
        startFile: 'wrap/start.frag',
        endFile: 'wrap/end.frag'
    },

    onBuildWrite: (function(){

        var fs = require.nodeRequire('fs');
        var ver = fs.readFileSync('../version.txt');
        var tags = {
            '@VERSION': ver,
            '@DATE': new Date().toDateString()
        };
        var search = '';
        for(var tag in tags){
            search += '|'+tag;
        }

        function cb( match ){

            return tags[ match ];
        }

        search = new RegExp(search.substr(1), 'ig');

        return function (moduleName, path, contents) {

            return contents.replace( search, cb );
        }
    })()
    
})