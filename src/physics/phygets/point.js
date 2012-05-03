define(
	[
		'util/class',
		'physics/phygets/basic'
	],
	function(
		Class,
		Basic
	){

		var Point = Class({
				
			_type: 'point'
			
			,__constructor__: function(){

				Point.prototype.__extends__.call( this );
			}

			,__extends__: Basic

		});

		return Point;
	}
);