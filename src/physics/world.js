define(
	[
		'util/class',
		'physics/body'
	],
	function(
		Class,
		Body
	){

		var World = Class({

			type: 'World'
			,__constructor__: function(){

				this.__extends__.call( this );
			}

			,__extends__: Body

			// worlds can't have parents
			,parent: function(){

				return false;
			}
		});

		World.isWorld = function( w ){

			return (w instanceof World);
		};

		return World;
	}
);