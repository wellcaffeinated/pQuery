/*!
 * pQuery physics library v@VERSION
 * https://github.com/wellcaffeinated/pQuery
 * 
 * Copyright 2012, Jasper Palfree
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * 
 * Date: @DATE
 * @license
 */
define(
	[
		'./body',
		'./phygets/sphere',
		'./phygets/point'
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