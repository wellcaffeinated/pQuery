/*!
 * This file is included as part of:
 * pQuery physics library v@VERSION
 * https://github.com/wellcaffeinated/pQuery
 * 
 * Copyright 2012, Jasper Palfree
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * 
 * Date: @DATE
 * @license
 */
define(
	[
		'jquery'
	],
	function(
		$
	){

		//check and see if the canvas element is supported in
	    //the current browser
	    //http://diveintohtml5.org/detect.html#canvas
	    if(!(!!document.createElement('canvas').getContext))
	    {
	        var wrapper = $('#canvasWrap');
	        wrapper.html('Your browser does not appear to support the HTML5 Canvas element');
	        throw 'Canvas Not Supported';
	        return;
	    }

		var CanvasCache = {};
		var current;

		function View( mediator ){

			if ( !(this instanceof View) ) return new View( mediator );

			this.mediator = mediator;

			var ss = $('#stopstart');

		    // set up pause button
		    ss.on('click', function(e){

		    	e.preventDefault();

		        if ( ss.html() === 'Start' ){

		            mediator.publish( 'demoView/startClicked' );
		            return;
		        }

		        mediator.publish( 'demoView/stopClicked' );

		    });

		    mediator.subscribe( 'demoView/simulationStatus', function( status ){

		    	ss.html( status? 'Stop' : 'Start' );
		    });

		    $('#demoList li a').on('click', function(e){

		    	e.preventDefault();

		    	var demo = $(this).attr('href').substr(1);

		    	mediator.publish( 'demoView/demoRequested', demo );
		    });

		    mediator.subscribe( 'demoView/changeCanvas', $.proxy( this, 'changeCanvas' ) );

		}

		View.prototype = {

			changeCanvas: function( id ){

				var canvas = CanvasCache[id];

				if ( !canvas ){

					canvas = CanvasCache[id] = $('<canvas width="500" height="500"></canvas>');
					canvas.appendTo('#canvasWrap');

				}

				if(current) CanvasCache[current].hide();

				current = id;
				canvas.show();//appendTo('#canvasWrap');
				this.mediator.publish( 'demoView/canvasReady', canvas[0], id );
			}
		};

		
		return View;
	}
);