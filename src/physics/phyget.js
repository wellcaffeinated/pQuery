define(
	[
		'util/class',
		'physics/body'
	],
	function(
		Class,
		Body
	){

		//temporary
		//TODO - remove and make this really work
		var PhygetRegistry = {};

		function create( type ){

			var Phyget = PhygetRegistry[type] || Class({
				
				_type: type
				
				,__constructor__: function(){

					this.__extends__.call( this );
				}

				,__extends__: Body
			});

			return new (PhygetRegistry[type] = Phyget);
		}
		
		function isBody( b ) {
			
			return (b instanceof Body);
		}

		return {
			create: create,
			isBody: isBody
		};
	}
);