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
		Phyget,
		
		//timer,

		undefined
	){
		var pQuery = function( selector, context ){

				var ret
					,w
					;

				if ( selector === true ) {
					return pQuery.createWorld();
				}
				
				// HANDLE: $(function)
				// Shortcut for context specific
				if ( !World.isWorld( selector ) && pQuery.isFunction( selector ) ) {
					ret = pQuery( true );
					selector( ret );
					return ret;
				}

				return new pQuery.fn.init( selector, context );
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

			,worlds = []

			,rootpQuery

			// to hold methods for world Api
			,worldMethods
			;

		pQuery.fn = pQuery.prototype = {

			constructor: pQuery,
			init: function( selector, context ) {
				var match
					,elem
					,ret
					,doc
					;

				// Handle $(""), $(null), or $(undefined)
				if ( !selector ) {
					return this;
				}

				// Handle $(World)
				if ( World.isWorld( selector ) ) {

					this.context = this[0] = selector;
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
							doc = context || noContext;

							// If a single string is passed in and it's a single tag
							// just do a createPhyget and skip the rest
							ret = rsingleTag.exec( selector );

							if ( ret ) {

								selector = [ pQuery.createPhyget( ret[1] ) ];

							} else {
								
								// disable rich fragment creation
								pQuery.error('Only simple <tag> creation is supported');
								
							}

							if ( doc ){
								
								// add to world if world is context
								pQuery.each( selector, function(){

									doc.add( this );

								});

								this.context = context;
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
		};

		// Give the init function the pQuery prototype for later instantiation
		pQuery.fn.init.prototype = pQuery.fn;

		pQuery.fn.extend = pQuery.extend = Tools.extend;

		pQuery.extend( Tools );

		// world methods
		worldMethods = {

			step: function( timestep, now ){

				this.context.step( timestep, now );
				return this;
			}
		};

		// asset creation
		pQuery.extend({

			createWorld: function(){
				var w;
				worlds.push( w = new World() );

				// reset rootpquery
				rootpQuery = pQuery( worlds );

				return pQuery.extend(function( s, c ){

						return pQuery( s, c || w );
					},
					worldMethods,
					pQuery( w )
				);
			}

			,createPhyget: function( type ){

				// TODO - more sophisticated creation
				var ret = new Phyget()
					;
				
				return ret;
			}

		});

		// Finder
		pQuery.find = function( selector, context, results ){

			var matches = []
				,selectorObj = Slick.parse( selector )
				,expressions = selectorObj.expressions
				;

			//context = context || worlds;

			var i, j, currentExpression, currentBit;
			for (i = 0; (currentExpression = expressions[i]); i++){
				for (j = 0; (currentBit = currentExpression[j]); j++){
					//TODO
					console.log(context, currentBit, currentExpression);
				}
			}

			return matches;
		};

		pQuery.contains = function( haystack, needle ){

			return haystack.contains( needle );
		};

		// physics methods
		pQuery.fn.extend({

			find: function( selector ){

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

			}

			,dimensions: function(){

				var dims = arguments[0]
					,type = pQuery.type(dims)
					;

				if ( type === 'object' ){

					return this.width( dims.width ).height( dims.height ).depth( dims.depth );
				}

				//TODO
			}
		});

		rootpQuery = pQuery( worlds );

		return pQuery;
	}
);