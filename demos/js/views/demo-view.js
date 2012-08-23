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
		'jquery',
		'kinetic'
	],
	function(
		$,
		Kinetic
	){

		var Cache = {};
		var current;

		function View( mediator ){

			if ( !(this instanceof View) ) return new View( mediator );

			this.mediator = mediator;

			var ss = $('#stopstart');

			this.bounds = {
                width: 500,
                height: 500
            };

            this.stage = new Kinetic.Stage({
              container: 'canvasWrap',
              width: this.bounds.width,
              height: this.bounds.height
            });

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

				var layer = Cache[id];

				if ( !layer ){

					layer = Cache[id] = new Kinetic.Layer();
				}

				this.stage.add(layer);

				current = id;
				this.mediator.publish( 'demoView/canvasReady', {
					layer: layer
				}, id );
			}
		};

		
		return View;
	}
);