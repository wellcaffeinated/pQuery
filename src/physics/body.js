define(
	[
		'util/class',
		'util/tools'
	],
	function(
		Class,
		Tools,
		undefined
	){

		var idSeed = 'body' + (''+Math.random()).replace( /\D/g, "" )
			,lastId = 0
			,Body = Class({

				_type: 'body'

				,__constructor__: function( id ){

					this._id = id || null;
					this._classes = [];
					this._parent = null;
					this._children = {};
				}

				,requestUniqueId: function(){

					return idSeed + (lastId++);
				}

				// get type
				,type: function(){

					return this._type;
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
				    this._classes.push.apply( this._classes, str.split(' ') );
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

					var args = [].slice.call( arguments )
						,a
						,ret = true
						;

					while( a = args.shift() ){

						ret = ret && (this._classes.indexOf( a ) >= 0);
					}

					return ret;
				}

				,add: function( body ) {
					
					// parent setting successful?
					if ( body.parent( this ) === this ){
						
						this._children[ body.id() ] = body;
						//this.refreshChildren();
					}

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

					// parents can't be children (stop grandfather paradox :)
					if ( par && (this._parent !== par) && (this !== par) && (par.parents().indexOf(this) < 0) ){

						if( this._parent ) this._parent.remove( this );
						this._parent = par;
						this._parent.add( this );
					}

					return this._parent;
				}

				// get list of parents
				,parents: function(){

					var par = this.parent()
						,ret
						;
					
					if (!par){

						return [];
					}

					ret = par.parents();
					ret.unshift( par );
					return ret;
				}

				// child management
				,children: function( narrow, deep ){

					var ret = []
						,retVal
						,c
						;

					deep = (narrow === true) || !!deep;

					// narrow can be a filter function( el, idx, parent ), simple selector string, or bool
					if ( !narrow ){

						for ( var id in this._children ){
							
							ret.push( c = this._children[id] );

							if ( deep ) ret.push.apply(ret, c.children( narrow, deep ));
						}

						return ret;

					} else if ( Tools.isFunction( narrow ) ){

						for ( var id in this._children ){
							
							retVal = !!narrow( c = this._children[id], id, this );

							if ( retVal ){

								ret.push( c );
							}

							if ( deep ) ret.push.apply(ret, c.children( narrow, deep ));
						}

						return ret;

					} else if ( typeof narrow === 'string' ){

						// match: maybe(hash or dot) with word characters
						retVal = /^(#|\.)?([\w]+)$/.exec( narrow );
						
						// invalid selector
						if ( !retVal ) return [];

						var prop = retVal[1]? ( retVal[1] === '#'? 'id' : 'hasClass' ) : 'type'
							,val = retVal[2]
							; 
						
						// like highlander... there can only be one
						if ( prop === 'id' ){

							c = this._children[ val ];
							
							if ( c ){

								return [ c ];
							}

							if ( deep ){

								for ( var id in this._children ){

									if ( c = this._children[id] ){

										return [ c ];
									}
								}
							}

							// no results
							return ret;
						}

						for ( var id in this._children ){
							
							c = this._children[id];

							retVal = c[ prop ]() === val;

							if ( retVal ){

								ret.push( c );
							}

							if ( deep ) ret.push.apply(ret, c.children( narrow, deep ));
						}
					}

					return ret;
				}

				,contains: function( child ) {
					
					if ( this === child ) return false;

					for ( var i = 0, l = this._children.length; i < l; ++i ){
						
						if (
						   child === this._children[i] ||
						   this._children[i].contains( child )
						){
							return true;
						}
					}

					return false;
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