define(
	[
		'util/class'
	],
	function(
		Class
		,undefined
	){

		var idSeed = 'body' + (''+Math.random()).replace( /\D/g, "" )
			,lastId = 0
			,Body = Class({

				type: 'Body'
				,__constructor__: function( id ){

					this._id = id || null;
					this._parent = null;
					this._children = {};
				}

				,requestUniqueId: function(){

					return idSeed + (lastId++);
				}

				// get or set id
				,id: function( val ) {
					
					var par = this.parent();

					if ( val && typeof val === 'string'){

						if (par){

							par.remove( this );
							this._id = val;
							par.add( this );
							return this._id;
						}

						return this._id = val;
					}

					return this._id || par? (this._id = par.requestUniqueId()) : null;
				}

				,add: function( body ) {
					
					body.parent( this );
					this._children[ body.id() ] = body;
					return this;
				}

				,addTo: function( par ){

					par.add( this );
					return this;
				}

				,remove: function( body ){

					body.parent( null );
					delete this._children[ body.id() ];
					return this;
				}

				// get or set
				,parent: function( par ){

					return par !== undefined? (this._parent = par) : this._parent;
				}

			})
			;

		Body.isBody = function( b ){

			return (b instanceof Body);

		};

		return Body;
	}
);