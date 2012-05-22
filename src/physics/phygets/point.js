define(
	[
		'../../util/class',
		'./basic'
	],
	function(
		Class,
		Basic
	){

		var Point = Class({
				
			_type: 'point'
			
			,Point: function(){

				Point.prototype.__extends__.call( this );
			}

			,__extends__: Basic

			,dimensions: function(){

				return {
					x: 0,
					y: 0,
					z: 0
				};
			}

		}, 'Point');

		return Point;
	}
);