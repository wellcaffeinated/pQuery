/*
 * pQuery physics library v@VERSION
 * https://github.com/wellcaffeinated/pQuery
 * 
 * Copyright 2012, Jasper Palfree
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
define(
	[
		'../util/class',
		'../util/tools',
		'../util/callbacks'
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
				
				,Body: function( id ){

					// storage for privates (aka boxer shorts)
					var _ = this._ = {};

					_.id = id || null;
					_.classes = [];
					_.oldclasses = this._classes;
					_.parent = null;
					_.children = {};
					_.callbacks = {};
					_.bubble = {};
					_.attr = {};
					_.data = {}; // arbitrary data storage

					var evt
						,self = this
						;

					for( var i = 0, l = this._events.length; i < l; i++ ){

						evt = this._events[i];

						!function(cb){

							_.bubble[ evt ] = function(){
								
								cb.fire.apply( cb, arguments );
							};

						}(_.callbacks[ evt ] = Callbacks());
					}
				}

				,_fire: function( evt, args ){
					
					this._.callbacks[ evt ].fire( args );
					return this;
				}

				,subscribe: function( evt, callback ){

					var cb = this._.callbacks[ evt ];

					if (cb) cb.add( callback );

					return this;
				}

				,unsubscribe: function( evt, callback ){

					var cb = this._.callbacks[ evt ];
					
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
					
					var _ = this._
						,par = this.parent()
						;

					if ( val && typeof val === 'string'){

						// TODO: NEED TO USE CALLBACKS
						if (par){

							par.remove( this );
							_.id = val;
							par.add( this );
							return _.id;
						}

						if ( _.id !== val ){

							// announce changed ( modifiedArray, origin, prop )
							this._fire( 'modified', [ [this], this, 'id' ] );
						}

						return _.id = val;
					}

					return _.id || (par? (_.id = par.requestUniqueId()) : null);
				}

				,addClass: function( str ){

					var _ = this._
						,oldlen = _.classes.length
						;

					this.removeClass( str );
				    _.classes.push.apply( _.classes, str.split(' ') );

				    if ( _.classes.length !== oldlen ){

				    	// announce changed ( modifiedArray, origin, prop )
						this._fire( 'modified', [ [this], this, 'classes' ] );
					}

					return this;
				}

				,removeClass: function( str ){

					var _ = this._
						,cls = str.split(' ')
						,classes = _.classes
						,idx
						,oldlen = _.classes.length
						;

				    for (var i = 0, l = cls.length; i < l; ++i){
				    	
				    	if( (idx = classes.indexOf( cls[i] )) >= 0 )
							classes.splice( idx, 1 );
				   	}

				   	if ( _.classes.length !== oldlen ){

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

						var _ = this._
							,l
							,old = _.classes
							;

						if ( l = _.classes.length ){

							_.oldclasses = _.classes;
						}

						_.classes = (l && str !== true) || str === false ? [] : _.oldclasses || [];

						if ( old !== _.classes ){

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

					return this._.classes.join(' ');
				}

				,hasClass: function( str ){

					var args = [].slice.call( arguments )
						,a
						,ret = true
						;

					while( a = args.shift() ){

						ret = ret && (this._.classes.indexOf( a ) >= 0);
					}

					return ret;
				}

				,add: function( body ) {
					
					var _ = this._;

					// parent setting successful?
					if ( body.parent( this ) === this ){
						
						_.children[ body.id() ] = body;
						
						body.subscribe( 'children.modified', _.bubble['children.modified'] );
						body.subscribe( 'modified', _.bubble['children.modified'] );

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

					var _ = this._;

					if (body.parent() === this){

						body.parent( null );
						delete _.children[ body.id() ];

						body.unsubscribe( 'children.modified', _.bubble['children.modified'] );	
						body.unsubscribe( 'modified', _.bubble['children.modified'] );

						// announce children changed ( modifiedArray, origin, prop )
						this._fire( 'children.modified', [ [body], this, 'children' ] );
					}
					
					return this;
				}

				// get or set
				,parent: function( par ){

					var _ = this._;

					// parents can't be children (stop grandfather paradox :)
					if ( (par || par === null) && (_.parent !== par) && (this !== par) && (par.parents().indexOf(this) < 0) ){

						if ( _.parent ) _.parent.remove( this );
						_.parent = par;
						if ( par ) _.parent.add( this );
					}

					return _.parent;
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

					var _ = this._
						,ret = []
						,retVal
						,c
						;

					deep = (narrow === true) || !!deep;
					narrow = (typeof narrow === 'boolean')? false : narrow;

					// narrow can be a filter function( el, idx, parent ), simple selector string, or bool
					if ( !narrow ){

						for ( var id in _.children ){
							
							ret.push( c = _.children[id] );

							if ( deep ) ret.push.apply(ret, c.children( narrow, deep ));
						}

						return ret;

					} else if ( Tools.isFunction( narrow ) ){

						for ( var id in _.children ){
							
							retVal = !!narrow( c = _.children[id], id, this );

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

						var _ = this._
							,prop = retVal[1]? ( retVal[1] === '#'? 'id' : 'hasClass' ) : 'type'
							,val = retVal[2]
							; 
						
						// like highlander... there can only be one
						if ( prop === 'id' ){

							c = _.children[ val ];
							
							if ( c ){

								return [ c ];
							}

							if ( deep ){

								for ( var id in _.children ){

									if ( c = _.children[id] ){

										return [ c ];
									}
								}
							}

							// no results
							return ret;
						}

						for ( var id in _.children ){
							
							c = _.children[id];

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

					var _ = this._;

					for ( var i = 0, l = _.children.length; i < l; ++i ){
						
						if (
						   child === _.children[i] ||
						   _.children[i].contains( child )
						){
							return true;
						}
					}

					return false;
				}

				,attr: function( key, val ){

					return val !== undefined? (this._.attr[ key ] = val) : this._.attr[ key ];
				}

				,data: function( hash, val ){

					return val !== undefined? (this._.data[ hash ] = val) : this._.data[ hash ];
				}

			}, 'Body')
			;

		Body.isBody = function( b ){

			return (b instanceof Body);

		};

		return Body;
	}
);