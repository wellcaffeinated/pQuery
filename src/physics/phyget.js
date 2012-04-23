define(
	[
		'util/class',
		'physics/body'
	],
	function(
		Class,
		Body
	){

		var Phyget = Class({
			
			type: 'Phyget'
			,__constructor__: function(){

				this.__extends__.call( this );
			}

			,__extends__: Body
		});


		return Phyget;
	}
);