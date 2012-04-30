define(
	[
		//'util/tools',
		'util/class',
		'physics/body'
	],
	function(
		//Tools,
		Class,
		Body
	){

		var World = Class({

			_type: 'world'
			
			,__constructor__: function(){

				this.__extends__.call( this );

				this._phygets = [];
			}

			,__extends__: Body

			// worlds can't have parents
			,parent: function(){

				return false;
			}

			/*,refreshChildren: function(){

				return this.buildPhygetTree();
			}

			,buildPhygetTree: function( root ){

				if ( !root ){

					this._phygets = []
				}

				Tools.each( this._children, buildPhygetTree );

			}*/
		});

		World.isWorld = function( w ){

			return (w instanceof World);
		};

		return World;
	}
);