define(
	[
		'./request-anim-frame'
	],
	function(
		frame
	){
		
		var API
			,lastTime = 0
			,active = false
			,listeners = []
			;
		
		function each( arr, fn ){

			for(var i = 0, l = arr.length; i < l; ++i){

				if ( fn( arr[i++], i ) === false ){

					return false;
				}

			}

			return true;
		}

		function step( time ){

			if (!active){
				return;
			}

			frame.requestAnimationFrame( step );
			
			each( listeners, function( l ){

				l( time, time - lastTime );
			});

			lastTime = time;
		}
		
		function start(){
			
			lastTime = new Date().getTime();
			active = true;
			step();
			
			return API;
		}

		function stop(){

			active = false;

			return API;
		}

		function subscribe( listener ){

			function cb( l ){

				if ( l === listener )
					return false;
			}

			// if function and not already in listeners...
			if ( typeof listener === 'function' && each( listeners, cb ) ){

				// add it
				listeners.push( listener );

			}

			return API;

		}

		function unsubscribe( listener ){

			each( listeners, function( l, i ){

				if ( l === listener ){

					// remove it
					listeners.splice( i, 1 );
					return false;

				}

			});

			return API;
		}

		function isActive(){

			return !!active;
		}
		
		// API
		return API = {
			start: start,
			stop: stop,
			subscribe: subscribe,
			unsubscribe: unsubscribe,
			isActive: isActive
		};
	}
);