define(
	[
		'util/class',
		'physics/phygets/basic'
	],
	function(
		Class,
		Basic
	){

		var Sphere = Class({
				
			_type: 'sphere'
			
			,__constructor__: function(){

				Sphere.prototype.__extends__.call( this );
			}

			,__extends__: Basic

		});

		return Sphere;
	}
);