define(
	[
		'util/class',
		'util/tools',
		'util/callbacks'
	],
	function(
		Class,
		Tools,
		Callbacks
	){

		var idSeed = 'body' + (''+Math.random()).replace( /\D/g, "" )
			,lastId = 0
			,Body = Class({

				_type: 'body'

				,_events: ['modified', 'children.modified']
				
				,__constructor__: function( id ){

					this._id = id || null;
					this._classes = [];
					this._oldclasses = this._classes;
					this._parent = null;
					this._children = {};
					this._callbacks = {};
					this._bubble = {};
					this._data = {}; // arbitrary data storage

					var evt
						,self = this
						;

					for( var i = 0, l = this._events.length; i < l; i++ ){

						evt = this._events[i];

						!function(cb){

							self._bubble[ evt ] = function(){
								
								cb.fire.apply(cb, arguments );
							};

						}(this._callbacks[ evt ] = Callbacks());
					}
				}

				,_fire: function( evt, args ){
					
					this._callbacks[ evt ].fire( args );
					return this;
				}

				,subscribe: function( evt, callback ){

					var cb = this._callbacks[ evt ];

					if (cb) cb.add( callback );

					return this;
				}

				,unsubscribe: function( evt, callback ){

					var cb = this._callbacks[ evt ];
					
					if (cb) cb.remove( callback );

					return this;
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

						// TODO: NEED TO USE CALLBACKS
						if (par){

							par.remove( this );
							this._id = val;
							par.add( this );
							return this._id;
						}

						if ( this._id !== val ){

							// announce changed ( modifiedArray, origin, prop )
							this._fire( 'modified', [ [this], this, 'id' ] );
						}

						return this._id = val;
					}

					return this._id || (par? (this._id = par.requestUniqueId()) : null);
				}

				,addClass: function( str ){

					var oldlen = this._classes.length;

					this.removeClass( str );
				    this._classes.push.apply( this._classes, str.split(' ') );

				    if ( this._classes.length !== oldlen ){

				    	// announce changed ( modifiedArray, origin, prop )
						this._fire( 'modified', [ [this], this, 'classes' ] );
					}

					return this;
				}

				,removeClass: function( str ){

					var cls = str.split(' ')
						,classes = this._classes
						,idx
						,oldlen = this._classes.length
						;

				    for (var i = 0, l = cls.length; i < l; ++i){
				    	
				    	if( (idx = classes.indexOf( cls[i] )) >= 0 )
							classes.splice( idx, 1 );
				   	}

				   	if ( this._classes.length !== oldlen ){

				   		// announce changed ( modifiedArray, origin, prop )
						this._fire( 'modified', [ [this], this, 'classes' ] );
				   	}

					return this;
				}

				,toggleClass: function( str, stateVal ){

					var type = typeof str
						,isBool = typeof stateVal === 'boolean'
						;

					if ( type === 'string' ){

						var cls = str.split(' ')
							,c
							,state = stateVal
							,i = 0
							;

						while ( (c = cls[ i++ ]) ) {

							state = isBool ? state : !this.hasClass( c );
							this[ state ? "addClass" : "removeClass" ]( c );
						}

					// toggle all classes in this case
					} else if ( type === "undefined" || type === "boolean" ) {

						var l
							,old = this._classes
							;

						if ( l = this._classes.length ){

							this._oldclasses = this._classes;
						}

						this._classes = (l && str !== true) || str === false ? [] : this._oldclasses || [];

						if ( old !== this._classes ){

							// announce changed ( modifiedArray, origin, prop )
							this._fire( 'modified', [ [this], this, 'classes' ] );
						}
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
						
						body.subscribe( 'children.modified', this._bubble['children.modified'] );
						body.subscribe( 'modified', this._bubble['children.modified'] );

						// announce children changed ( modifiedArray, origin, prop )
						this._fire( 'children.modified', [ [body], this, 'children' ] );
					}

					return this;
				}

				,addTo: function( par ){

					par.add( this );
					return this;
				}

				,remove: function( body ){

					if (body.parent() === this){

						body.parent( null );
						delete this._children[ body.id() ];

						body.unsubscribe( 'children.modified', this._bubble['children.modified'] );	
						body.unsubscribe( 'modified', this._bubble['children.modified'] );

						// announce children changed ( modifiedArray, origin, prop )
						this._fire( 'children.modified', [ [body], this, 'children' ] );
					}
					
					return this;
				}

				// get or set
				,parent: function( par ){

					// parents can't be children (stop grandfather paradox :)
					if ( (par || par === null) && (this._parent !== par) && (this !== par) && (par.parents().indexOf(this) < 0) ){

						if ( this._parent ) this._parent.remove( this );
						this._parent = par;
						if ( par ) this._parent.add( this );
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
					narrow = false;

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

				,data: function( hash, val ){

					return val? (this._data[ hash ] = val) : this._data[ hash ];
				}

			})
			;

		Body.isBody = function( b ){

			return (b instanceof Body);

		};

		return Body;
	}
);