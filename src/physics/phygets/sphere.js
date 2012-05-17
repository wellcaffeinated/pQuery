define(
	[
		'../../util/class',
		'./basic'
	],
	function(
		Class,
		Basic
	){

		var Sphere = Class({
				
			_type: 'sphere'
			
			,Sphere: function(){

				Sphere.prototype.__extends__.call( this );
			}

			,__extends__: Basic

		}, 'Sphere');

		return Sphere;
	}
);