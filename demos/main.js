
require.config({
	baseUrl: 'js/'
});

require(
	[
		'mediator',
		'views/demo-view'
	],
	function(
		mediator,
		demoView
	){	

		var simCache = {};
		var current;

		function loadSim( sim ){

			if ( current && current === simCache[sim] ) return;

			mediator.publish( 'simulation/stop' );

			if ( !simCache[sim] ){

				require(['simulations/'+sim], function( factory ){

					simCache[sim] = {
						factory: factory
					};

					mediator.publish( 'demoView/changeCanvas', sim );

				});

			} else {

				mediator.publish( 'demoView/changeCanvas', sim );
			}
		}

		// create demo view
		new demoView( mediator );
		mediator
			.subscribe( 'demoView/stopClicked', 'simulation/stop' )
			.subscribe( 'demoView/startClicked', 'simulation/start' )
			.subscribe( 'demoView/demoRequested', 'simulation/load' )
			.subscribe( 'demoView/canvasReady', function(canvas, sim){

				if (canvas){

					current = simCache[sim].instance;

					if ( !current ){

						current = simCache[sim].instance = new simCache[sim].factory( mediator, canvas );
					}

					location.hash = '#'+sim;

					mediator.publish( 'simulation/start' );
					
				} else {

					throw 'No canvas element provided';
				}
			})
			;

		mediator
			.subscribe( 'simulation/load', loadSim )
			.subscribe( 'simulation/start', function(){

				current && current.start();
				mediator.publish( 'demoView/simulationStatus', true );

			})
			.subscribe( 'simulation/stop', function(){

				current && current.stop();
				mediator.publish( 'demoView/simulationStatus', false );
				
			})
			;

		// check current hash for simulation to load
		var sim = location.hash.substr(1);
		if( sim.length ) mediator.publish( 'simulation/load', sim );
	}
);