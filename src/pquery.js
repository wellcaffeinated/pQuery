define(
	[
		'util/slick.parser',
		'util/tools',
		'physics/world',
		'physics/phyget'
		
		//'timer'
	],
	function(
		Slick,
		Tools,
		World,
		Phyget
		
		//timer,
	){
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
					push.apply( ret, elems );

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

		// asset creation
		pQuery.extend({

			// create a new pQuery with a new world
			sub: function() {
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

				var selectorObj = Slick.parse( selector )
					,expressions = selectorObj.expressions
					,acceptParents
					;
				
				var i, currentExpression;
				for (i = 0; (currentExpression = expressions[i]); i++){
					
					acceptParents = {};

					function filter(child, id, parent) {

						var body = child
							,testid = id
							,check
							,comb //last combinator
							,last = currentExpression.length - 1
							,j = last
							,currentBit = currentExpression[ j ]
							;

						do {
							
							testid = body.id();
							
							// have we already checked and accepted this parent? if so, no need to keep going
							if ((j === currentExpression.length - 2) && acceptParents[testid]){

								return true;
							}

							//check id
							check = (!currentBit.id || currentBit.id === testid);

							//check classes
							check = check && (!currentBit.classList || body.hasClass.apply(body, currentBit.classList));

							//check type
							check = check && (!currentBit.tag || currentBit.tag === '*' || body.type() === currentBit.tag);

							// child
							if ((j === last)){
								
								if(!check) return false;

							// parents
							} else {

								if (comb === '>' && !check){

									return false;
								}

								if ( !check ){
									// maybe other parents will match so keep going
									continue;
								}
							}

							comb = currentBit.combinator;
							j--;
							currentBit = currentExpression[j];

							if (!currentBit){

								// ok all tests passed

								// add immediate parent as acceptable for this test expression
								acceptParents[ child.parent().id() ] = true;

								return true;
							}

						} while ( body = body.parent() );

						// ran out of parents before the test was done
						return false;
					}

					makeArray(context.children(filter, true), results);
				}

				return results;
			};

		}();

		pQuery.contains = function( haystack, needle ){

			return haystack.contains( needle );
		};

		// physics methods
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

			,interact: function(){

				// TODO
			}

			,dimensions: function(){

				var dims = arguments[0]
					,type = pQuery.type(dims)
					;

				if ( type === 'object' ){

					return this.width( dims.width ).height( dims.height ).depth( dims.depth );
				}

				// TODO
			}
		});

		// world methods
		pQuery.fn.extend({

			step: function( timestep, now ){

				this.world.step( timestep, now );
				return this;
			}
		});

		// set up world
		rootpQuery = pQuery('world');

		pQuery.fn.extend({

			append: function(){

				return this.manip(arguments, function( body ){

					this.add( body );
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

		return pQuery;
	}
);