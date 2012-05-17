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

		}, 'Point');

		return Point;
	}
);