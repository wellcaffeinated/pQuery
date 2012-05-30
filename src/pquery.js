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
		'./util/slick.parser',
		'./util/tools',
		'./util/callbacks',
		'./util/ticker',
		'./math/vector',
		'./physics/algorithms',
		'./physics/world',
		'./physics/phyget'
	],
	function(
		Slick,
		Tools,
		Callbacks,
		Ticker,
		Vector,
		Algorithms,
		World,
		Phyget
	){
		/*!
		 * Contains modified parts of jQuery JavaScript Library v1.7.2
		 * http://jquery.com/
		 *
		 * Copyright 2011, John Resig
		 * Dual licensed under the MIT or GPL Version 2 licenses.
		 * http://jquery.org/license
		 *
		 */
		var pQuery = function( selector, context ){

				return new pQuery.fn.init( selector, context, rootpQuery );
			}

			// placeholder for no context
			,noContext = false

			// A simple way to check for HTML strings or ID strings
			// Prioritize #id over <tag> 
			,quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/
			// Check if a string has a non-whitespace character in it
			,rnotwhite = /\S/

			// Used for trimming whitespace
			,trimLeft = /^\s+/
			,trimRight = /\s+$/

			// Match a standalone tag
			,rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/

			// A central reference to the root pQuery(world)
			,rootpQuery

			// to hold methods for world Api
			,worldMethods
			;

		pQuery.fn = pQuery.prototype = {

			constructor: pQuery,
			init: function( selector, context, rootpQuery ) {
				var match
					,elem
					,ret
					,doc
					;

				// Handle $(""), $(null), or $(undefined)
				if ( !selector ) {
					return this;
				}

				// Handle $(Body)
				if ( Phyget.isBody( selector ) ) {

					this.context = this[0] = selector;
					this.length = 1;
					return this;
				}

				// The world only exists once, optimize finding it
				if ( selector === "world" && !context ) {
					this.context = this.world;
					this[0] = this.world;
					this.selector = selector;
					this.length = 1;
					return this;
				}

				// Handle query strings
				if ( typeof selector === "string" ) {
					// Are we dealing with HTML style string or an ID?
					if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
						// Assume that strings that start and end with <> are HTML and skip the regex check
						match = [ null, selector, null ];

					} else {
						match = quickExpr.exec( selector );
					}

					// Verify a match, and that no context was specified for #id
					if ( match && match[1] ) {

						// HANDLE: $(html) -> $(array)
						if ( match[1] ) {
							context = context instanceof pQuery ? context[0] : context;
							doc = context || this.world;

							// If a single string is passed in and it's a single tag
							// just do a createPhyget and skip the rest
							ret = rsingleTag.exec( selector );

							if ( ret ) {

								selector = [ pQuery.createPhyget( ret[1] ) ];

							} else {
								
								// disable rich fragment creation
								pQuery.error('Only simple <tag> creation is supported');
								
							}

							return pQuery.merge( this, selector );

						} 

					// HANDLE: $(expr, $(...))
					} else if ( !context || context.pquery ) {
						return ( context || rootpQuery ).find( selector );

					// HANDLE: $(expr, context)
					// (which is just equivalent to: $(context).find(expr)
					} else {
						return this.constructor( context ).find( selector );
					}
				}

				if ( selector.selector !== undefined ) {
					this.selector = selector.selector;
					this.context = selector.context;
				}

				return pQuery.makeArray( selector, this );
			}

			// Start with an empty selector
			,selector: ''


			// The current version of pQuery being used
			,pquery: '0.1a'

			// The default length of a pQuery object is 0
			,length: 0

			// Execute a callback for every element in the matched set.
			// (You can seed the arguments with an array of args)
			,each: function( callback, args ) {
				return pQuery.each( this, callback, args );
			}

			// Take an array of elements and push it onto the stack
			// (returning the new matched element set)
			,pushStack: function( elems, name, selector ) {
				// Build a new pQuery matched element set
				var ret = this.constructor();

				if ( pQuery.isArray( elems ) ) {

					this.push.apply( ret, elems );

				} else {
					pQuery.merge( ret, elems );
				}

				// Add the old object onto the stack (as a reference)
				ret.prevObject = this;

				ret.context = this.context;

				if ( name === "find" ) {
					ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
				} else if ( name ) {
					ret.selector = this.selector + "." + name + "(" + selector + ")";
				}

				// Return the newly-formed element set
				return ret;
			}

			// internal use only
			,push: Array.prototype.push
		};

		// Give the init function the pQuery prototype for later instantiation
		pQuery.fn.init.prototype = pQuery.fn;

		pQuery.fn.extend = pQuery.extend = Tools.extend;

		pQuery.extend( Tools );

		pQuery.extend( Algorithms );

		pQuery.Callbacks = Callbacks;

		pQuery.Vector = Vector;

		// asset creation
		pQuery.extend({

			ticker: Ticker

			// create a new pQuery with a new world
			,sub: function() {
				function pQuerySub( selector, context ) {
					return new pQuerySub.fn.init( selector, context );
				}
				pQuery.extend( true, pQuerySub, this );
				pQuerySub.superclass = this;
				pQuerySub.fn = pQuerySub.prototype = this();
				pQuerySub.fn.constructor = pQuerySub;
				pQuerySub.fn.world = new World();
				pQuerySub.sub = this.sub;
				pQuerySub.fn.init = function init( selector, context ) {
					if ( context && context instanceof pQuery && !(context instanceof pQuerySub) ) {
						context = pQuerySub( context );
					}

					return pQuery.fn.init.call( this, selector, context, rootpQuerySub );
				};
				pQuerySub.fn.init.prototype = pQuerySub.fn;
				var rootpQuerySub = pQuerySub('world');
				return pQuerySub;
			}

			,createPhyget: function( type ){

				var ret = Phyget.create( type )
					;
				
				if ( !ret ){

					pQuery.error('Invalid phyget type: '+type);
				}

				return ret;
			}

		});

		!function(){

			function makeArray( array, results ) {
				array = Array.prototype.slice.call( array, 0 );

				if ( results ) {
					results.push.apply( results, array );
					return results;
				}

				return array;
			};

			// Finder
			pQuery.find = function( selector, context, results ){

				results = results || [];

				if ( !selector || typeof selector !== 'string' ){
					return results;
				}

				if ( !context ){
					// shouldn't need this... but just in case
					context = rootpQuery.world;
				}

				if ( context.type() === 'world' ){

					// allow placing "world" as first selector if this is the world context
					selector = selector.replace(/^world ?/, '');
				}

				var selectorObj = Slick.parse( selector )
					,expressions = selectorObj.expressions
					;

				function filter(child, id, parent) {

					var acceptParents
						,body
						,testid
						,check
						,comb //last combinator
						,last
						,j
						,currentBit
						;
					
					var i, currentExpression;
					search: for (i = 0; (currentExpression = expressions[i]); i++){
					
						acceptParents = {};

						body = child;
						testid = id;
						last = currentExpression.length - 1;
						j = last;
						currentBit = currentExpression[ j ];
						
						do {
							
							testid = body.id();
							
							// have we already checked and accepted this parent? if so, no need to keep going
							if ((j === currentExpression.length - 2) && acceptParents[testid]){

								return true;
							}

							// check id
							check = (!currentBit.id || currentBit.id === testid);

							// check classes
							check = check && (!currentBit.classList || body.hasClass.apply(body, currentBit.classList));

							// check type
							check = check && (!currentBit.tag || currentBit.tag === '*' || body.type() === currentBit.tag);

							// child
							if (j === last){
								
								// nope... maybe it will match another expression
								if(!check) continue search;

							// parents
							} else {

								if (comb === '>' && !check){

									// nope... maybe it will match another expression
									continue search;
								}

								if ( !check ){
									// maybe other parents will match so keep going
									continue;
								}
							}

							comb = currentBit.combinator;
							j--;
							currentBit = currentExpression[j];

							// no more bits to check?
							if ( !currentBit ){

								// also, if we request an immediate child as first combinator we should have reached the root element
								if ( comb === '>' && body.parent() !== context ){

									// oops. fail. continue.
									continue search;
								}

								// ok all tests passed

								// add immediate parent as acceptable for this test expression
								acceptParents[ child.parent().id() ] = true;

								// found it! no need to keep searching other expressions
								return true;
							}

						// only climb the tree until we reach our context
						} while ( (body = body.parent()) && body !== context );

						// ran out of parents before the test was done
						// keep checking other expressions
					}

					return false;

				}

				makeArray(context.children(filter, true), results);

				return results;
			};

		}();

		pQuery.contains = function( haystack, needle ){

			return haystack.contains( needle );
		};


		function inWorld( body, world ){

			var p = body.parents();
			return (p[ p.length-1 ] === world);
		}

		// collection methods
		pQuery.fn.extend({

			toArray: function() {
				return Array.prototype.slice.call( this, 0 );
			}

			// Get the Nth element in the matched body set OR
			// Get the whole matched body set as a clean array
			,get: function( num ) {
				return num == null ?

					// Return a 'clean' array
					this.toArray() :

					// Return just the object
					( num < 0 ? this[ this.length + num ] : this[ num ] );
			}

		});

		// tree manipulation and retrieval
		pQuery.fn.extend({

			world: new World()

			,find: function( selector ){

				var self = this,
					i, l;

				if ( typeof selector !== "string" ) {
					return pQuery( selector ).filter(function() {
						for ( i = 0, l = self.length; i < l; i++ ) {
							if ( pQuery.contains( self[ i ], this ) ) {
								return true;
							}
						}
					});
				}

				var ret = this.pushStack( "", "find", selector ),
					length, n, r;

				for ( i = 0, l = this.length; i < l; i++ ) {
					length = ret.length;
					pQuery.find( selector, this[i], ret );

					if ( i > 0 ) {
						// Make sure that the results are unique
						for ( n = length; n < ret.length; n++ ) {
							for ( r = 0; r < length; r++ ) {
								if ( ret[r] === ret[n] ) {
									ret.splice(n--, 1);
									break;
								}
							}
						}
					}
				}

				return ret;

			}

			,contains: function(){

				// TODO
			}

			,add: function( selector, context ) {
				var set = typeof selector === 'string' ?
						pQuery( selector, context ) :
						pQuery.makeArray( selector && Phyget.isBody( selector ) ? [ selector ] : selector )
					,all = pQuery.merge( this.get(), set )
					;
				
				return this.pushStack( !inWorld( set[0], this.world ) || !inWorld( all[0], this.world ) ?
					all :
					pQuery.unique( all ) );
			}

			,append: function(){

				return this.manip(arguments, function( body ){

					this.add( body );
				});
			}

			,appendTo: function(){

				return this.manip(arguments, function( body ){

					this.addTo( body );
				});
			}

			,manip: function( args, callback ){

				// TODO make this more general
				var value = args[0]
					,fragment = value.pquery? value[0] : value
					;

				if ( this[0] ){

					for( var i = 0, l = this.length; i < l; i++ ){

						callback.call(
							this[i],
							fragment
						);
					}	
				}

				return this;				
			}
		});

		// physics methods
		pQuery.fn.extend({
			
			// types: soft, hard, collision
			interact: function( types, sel, callback ){

				var bodies
					,type = types
					;

				// ( types-object, sel )
				if ( typeof types === 'object' ){

					for ( type in types ){
						this.interact( type, sel, types[ type ] );
					}
					return this;
				}

				// ( callback )
				if ( sel == null && callback == null ){

					callback = types;
					type = 'beforeAccel'; //assume we're applying acceleration

				// ( types, callback )
				} else if ( callback == null ){

					callback = sel;
					sel = undefined;
					type = types;
				}

				if ( !callback ){

					return this;
				}

				// use current bodies
				// don't delegate
				if ( !sel ){

					bodies = pQuery.makeArray( this );
					this.world.registerInteraction( type, bodies, callback );

				// delegate (refresh when needed)
				} else {

					for ( var i = 0, l = this.length; i < l; ++i ){
						
						bodies = (function( par ){

							var p = pQuery( par );

							return function(){

								// return children that match selector inside parent
								return pQuery.makeArray( p.find( sel ) );

							};

						})( this[i] );

						this.world.registerInteraction( type, bodies, callback, this[ i ] );
					}
				}
				
				return this;
			}

			,uninteract: function(){

				// TODO
			}

			,accelerate: function( accel ){

				var ch = this[0]
					,x
					,y
					,z
					;
				
				// make sure we actually want to loop through all of these
				if ( 
				    (
				     	typeof accel === 'object' &&
				     	(x = accel.x) !== 0 ||
				     	(y = accel.y) !== 0 ||
				     	(z = accel.z) !== 0
				    ) ||
				    (
				     	(x = accel) !== 0 ||
				     	(y = arguments[1]) !== 0 ||
				     	(z = arguments[2]) !== 0
				    )
				) {

					// set position for all
					for ( var i = this.length - 1; i > -1; i-- ){

						ch = this[i];
						ch.accelerate(x, y, z);

					}

				}

				return this;
			}
		});
	
		// world methods
		pQuery.fn.extend({

			step: function( now ){

				this.world.step( now );
				return this;
			}

			// get/set timestep
			,timeStep: function( dt ){

				if ( dt ){

					this.world.timeStep( dt );
					return this;
				}

				return this.world.timeStep();
			}

			,pause: function(){

            	this.world.pause();
            	return this;
            }

            ,unpause: function(){

            	this.world.unpause();
            	return this;
            }

            ,isPaused: function(){

            	return this.world.isPaused();
            }
		});

		// set up rootpQuery
		rootpQuery = pQuery('world');

		// setters
		pQuery.fn.extend({

			id: function( value ){

				if ( pQuery.isFunction( value ) ) {

					return pQuery.fn.id.call(this, value.call(this, 0, this[0]) );
				}

				if ( this[0] ){

					return this[0].id( value );
				}

				return null;
			}

			,addClass: function( value ){

				if ( pQuery.isFunction( value ) ) {

					return this.each(function( j ) {
						jQuery( this ).addClass( value.call(this, j, this.classes()) );
					});
				}

				if ( value && typeof value === 'string' ) {

					for ( var i = 0, l = this.length; i < l; ++i ){
						
						this[ i ].addClass( value );
					}
				}

				return this;
			}

			,removeClass: function( value ){

				if ( pQuery.isFunction( value ) ) {

					return this.each(function( j ) {
						jQuery( this ).removeClass( value.call(this, j, this.classes()) );
					});
				}

				if ( value && typeof value === 'string' ) {

					for ( var i = 0, l = this.length; i < l; ++i ){
						
						this[ i ].removeClass( value );
					}
				}

				return this;
			}

			,toggleClass: function( value, stateVal ){

				if ( pQuery.isFunction( value ) ) {
					return this.each(function( i ) {
						pQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
					});
				}

				for ( var i = 0, l = this.length; i < l; ++i ){
					
					this[ i ].toggleClass( value, stateVal );
				}

				return this;
			}

			,data: function( hash, val ){

				if ( !val ){

					if ( !this[0] ) return null;

					return this[0].data( hash );
				}

				for ( var i = 0, l = this.length; i < l; ++i ){

					this[ i ].data( hash, val );
				}

				return this;
			}
		});

		// getters
		pQuery.fn.extend({

			type: function(){

				var first = this[0];

				return first && first.type();
			}

			,classes: function(){

				var first = this[0];
				
				return first && first.classes();
			}

			,parents: function(){

				var ret
					,i
					,l
					,n
					;

				for( i = 0, l = this.length; i < l; i++ ){

					if ( i == 0 ){

						ret = this[i].parents();

					} else {

						ret.push.apply( ret, this[i].parents() );

						// Make sure that the results are unique
						for ( n = length; n < ret.length; n++ ) {
							for ( r = 0; r < length; r++ ) {
								if ( ret[r] === ret[n] ) {
									ret.splice(n--, 1);
									break;
								}
							}
						}
					}
				}

				return ret;
			}


			,position: function( pos ){

				var first = this[0];
				
				if ( typeof pos === 'string' ){
					
					// TODO define styles of return value	
				} else if ( arguments.length > 0 ) {

					// set position for all
					for ( var i = this.length - 1; i > -1; i-- ){

						first = this[i];
						first.position.apply( first, arguments );

					}

					return this;
				}

				// else return position of first
				return first && first.position && first.position();
			}

			,velocity: function( vel ){

				var first = this[0];
				
				if ( typeof pos === 'string' ){
					
					// TODO define styles of return value	
				} else if ( arguments.length > 0 ) {

					// set velocity for all
					for ( var i = this.length - 1; i > -1; i-- ){

						first = this[i];
						first.velocity.apply( first, arguments );

					}

					return this;
				}

				// else return velocity of first
				return first && first.velocity && first.velocity();
			}

			,dimensions: function( dims ){

				var type = typeof dims
					,first = this[0]
					;

				if ( type === 'object' ){

					for ( var i = 0, l = this.length; i < l; ++i ){

						this[ i ].dimensions( dims.width, dims.height, dims.depth );
					}

					return this;

				} else if ( pQuery.isNumeric( dims ) ){

					dims = {
						width: dims,
						height: arguments[1],
						depth: arguments[2]
					};

					for ( var i = 0, l = this.length; i < l; ++i ){
						
						this[ i ].dimensions( dims.width, dims.height, dims.depth );
					}
						
					return this;
				}

				return first.dimensions();
			}
		});

		// checkers
		pQuery.fn.extend({

			hasClass: function( value ){

				var first = this[0];

				return first && first.hasClass.apply( first, arguments );
			}
		});

		// events
		pQuery.fn.extend({

			// TODO improve
			on: function( evt, callback ){

				var i
					,el
					;

				for ( var i = this.length - 1; i > -1; i-- ){

					el = this[i];

					el.subscribe( evt, pQuery.proxy( callback, el ) );
				}

				return this;
			}
		});

		return pQuery;
	}
);