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
					this._classes = [];
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

					return this._id || (par? (this._id = par.requestUniqueId()) : null);
				}

				,addClass: function( str ){

					this.removeClass( str );
				    this._classes = this._classes.concat( str.split(' ') );
					return this;
				}

				,removeClass: function( str ){

					var cls = str.split(' ')
						,classes = this._classes
						,idx
						;

				    for (var i = 0, l = cls.length; i < l; ++i){
				    	
				    	if( (idx = classes.indexOf( cls[i] )) >= 0 )
							classes.splice( idx, 1 );
				   	}

					return this;
				}

				,classes: function( str ){

					if (str){

						this.addClass( str );
					}

					return this._classes.join(' ');
				}

				,hasClass: function( str ){

					return (this._classes.indexOf( str ) >= 0);
				}

				,add: function( body ) {
					
					body.parent( this );
					this._children[ body.id() ] = body;
					//this.refreshChildren();
					return this;
				}

				,addTo: function( par ){

					par.add( this );
					return this;
				}

				,remove: function( body ){

					body.parent( null );
					delete this._children[ body.id() ];
					//this.refreshChildren();
					return this;
				}

				// get or set
				,parent: function( par ){

					return par !== undefined? (this._parent = par) : this._parent;
				}

				// notify parent tree to refresh children if necessary
				// returns (bool) children changed?
				/*,refreshChildren: function(){

					var par = this.parent();
					if ( par ){

						par.refreshChildren();
					}

					return false;
				}*/

			})
			;

		Body.isBody = function( b ){

			return (b instanceof Body);

		};

		return Body;
	}
);