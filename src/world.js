define(
	[
		'body'
	],
	function(
		Body
	){

		function World(){

			this.bodies = [];
		}

		World.prototype = {

			add: function( b ){

				if ( Body.isBody( b ) )
					this.bodies.push( b );
			}
		};

		World.isWorld = function( w ){

			return (w instanceof World);
		};

		return World;
	}
);