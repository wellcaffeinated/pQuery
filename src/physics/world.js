define(
	[
		'../util/tools',
		'../util/class',
		'./body'
	],
	function(
		Tools,
		Class,
		Body
	){

		var World = Class({

			_type: 'world'

			,_events: Body.prototype._events.concat(['step'])
			
			,World: function(){

				World.prototype.__extends__.call( this );

				var _ = this._;

				_.interactions = {

					soft: [],
					hard: [],
					collision: []

				};

				_.childCache = null; // cache of all children in tree
				_.refreshChildren = true;
				this.subscribe('children.modified', function(){

					_.refreshChildren = true;
				});

				// start with infinite dimensions
				_.dimensions.set( 1/0, 1/0, 1/0 );

				// start with a default timestep
				_.dt = 8;
			}

			,__extends__: Body

			// worlds can't have parents
			,parent: function(){

				return false;
			}

			,registerInteraction: function( type, bodies, callback, par ){

				var _ = this._
					,intr = {}
					,p = par || this
					;

				if (type in _.interactions){

					if ( Tools.isFunction( bodies ) ){

						p.subscribe( 'children.modified', function( modified ){

							// TODO inefficient. calls this on every child modified
							intr.bodies = bodies( par );
						});

						intr.bodies = bodies( par );

					} else {

						intr.bodies = bodies;
					}

					intr.parent = par;
					intr.callback = callback;

					_.interactions[ type ].push( intr );
				}

				return this;
			}

			,doInteractions: function( type, dt ){

				var list = this._.interactions[ type ]
					,intr
					,bodies
					,par
					,ch
					,i
					,l
					,j
					,m
					;

				if (!list) return this;

				for ( i = 0, l = list.length; i < l; ++i ){
					
					intr = list[ i ];
					bodies = intr.bodies;
					par = intr.parent;

					for ( j = 0, m = bodies.length; j < m; ++j ){

						intr.callback.call((ch = bodies[ j ]), dt, ch, j, bodies, par );
					}
				}

				return this;
			}

			,resolveAcceleration: function( dt ){

				var children = this._.childCache
					,i = children.length - 1
					;

				for (; i > -1; i--){

					children[i].resolveAcceleration( dt );
				}
			}

			,resolveInertia: function( dt ){

				var children = this._.childCache
					,i = children.length - 1
					;

				for (; i > -1; i--){

					children[i].resolveInertia( dt );
				}
			}

			// internal method
			,onestep: function(){

				var _ = this._
					,dt = _.dt
					;

				if ( _.refreshChildren ){

					_.childCache = this.children( function( c ){

						c.timeStep( _.dt );
						return true;
					}, true );
					_.refreshChildren = false;
				}

                _.time += dt;

                this.doInteractions( 'soft', dt );
                this.resolveAcceleration( dt );
                this.doInteractions( 'collision', dt );
                this.resolveInertia( dt );
                this.doInteractions( 'hard', dt );
                //this.cleanup();

                return _.time;
            }

            ,timeStep: function( dt ){

            	if ( dt ){

            		this._.dt = dt;

            		if ( !this._.childCache ) return this;

            		var children = this._.childCache
						,i = children.length - 1
						;

					for (; i > -1; i--){

						children[i].timeStep( dt );
					}

            		return this;
            	}

            	return this._.dt;
            }

			,step: function( now ){
				
				if ( this.paused ){

					return this;
				}

				var _ = this._
					,time = _.time || (_.time = now)
					,diff = now - time
					;

				// set some stats
				this.FPS = 1000/diff;
				this.nsteps = Math.ceil(diff/_.dt);

				// prevent hiccups
                if ( now - time > 250 ){

                    _.time = now - 250;

                }

                while ( this.onestep() < now ){}

                this._fire('step', [ _.dt, _.time ]);
                return this;
            }

            ,pause: function(){

            	this.paused = true;
            	this._.time = false;
            	return this;
            }

            ,unpause: function(){

            	this.paused = false;
            	return this;
            }

            ,isPaused: function(){

            	return !!this.paused;
            }

		}, 'World');

		World.isWorld = function( w ){

			return (w instanceof World);
		};

		return World;
	}
);