define(
	[
		'physics/body',
		'physics/phygets/sphere',
		'physics/phygets/point'
	],
	function(
	    Body,
		Sphere,
		Point
	){

		var PhygetRegistry = {

			'sphere': Sphere,
			'point': Point
		};

		function create( type ){

			return new PhygetRegistry[ type ]();
		}
		
		function isBody( b ) {
			
			var bdy = b
				,ret = false
				;

			while( bdy && !(ret = bdy instanceof Body) ){

				bdy = bdy.__extends__;
			}

			return ret;
		}

		return {
			create: create,
			isBody: isBody
		};
	}
);