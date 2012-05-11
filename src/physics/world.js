define(
	[
		'util/tools',
		'util/class',
		'physics/body'
	],
	function(
		Tools,
		Class,
		Body
	){

		var World = Class({

			_type: 'world'

			,_events: Body.prototype._events.concat(['step'])
			
			,__constructor__: function(){

				var self = this;

				World.prototype.__extends__.call( this );

				this._interactions = {

					soft: [],
					hard: [],
					collision: []

				};

				this._childCache = null; // cache of all children in tree
				this._refreshChildren = true;
				this.subscribe('children.modified', function(){

					self._refreshChildren = true;
				});
			}

			,__extends__: Body

			// worlds can't have parents
			,parent: function(){

				return false;
			}

			,registerInteraction: function( type, bodies, callback, par ){

				var intr = {}
					,p = par || this
					;

				if (type in this._interactions){

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

					this._interactions[ type ].push( intr );
				}

				return this;
			}

			,doInteractions: function( type, delta ){

				var list = this._interactions[ type ]
					,intr
					,bodies
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

					for ( j = 0, m = bodies.length; j < m; ++j ){

						intr.callback.call((ch = bodies[ j ]), delta, ch, j, bodies );
					}
				}

				return this;
			}

			,resolveAcceleration: function( delta ){

				var children = this._childCache
					,i = children.length - 1
					;

				for (; i > -1; i--){

					children[i].resolveAcceleration( delta );
				}
			}

			,resolveInertia: function( delta ){

				var children = this._childCache
					,i = children.length - 1
					;

				for (; i > -1; i--){

					children[i].resolveInertia( delta );
				}
			}

			// internal method
			,onestep: function( delta ){

				if (this._refreshChildren){

					this._childCache = this.children( true );
					this._refreshChildren = false;
				}

                this.time += delta;
                this.doInteractions( 'soft', delta );
                this.resolveAcceleration( delta );
                this.doInteractions( 'hard', delta );
                this.resolveInertia( delta );
				this.doInteractions( 'collision', delta );
                //this.cleanup();
            }

			,step: function( timestep, now ){
				
				if ( this.paused ){

					return this;
				}

				var time = this.time || (this.time = now)
					,diff
					;

				diff = (now - this.time);
				//timestep = diff/2;
				this.FPS = 1000/diff;
				this.nsteps = Math.ceil(diff/timestep);

                if ( now - time > 250 ){

                    time = now - 250;

                }

                while ( this.time < now ){

                    this.onestep( timestep );

                }

                diff = time - now;

                if ( diff > 0 ){

                    this.u = (timestep - diff)/timestep;

                } else {

                    this.u = 1.0;
                }

                this._fire('step', [ timestep, now ]);
                return this;
            }

            ,pause: function(){

            	this.paused = true;
            	this.time = false;
            	return this;
            }

            ,unpause: function(){

            	this.paused = false;
            	return this;
            }

            ,isPaused: function(){

            	return !!this.paused;
            }
		});

		World.isWorld = function( w ){

			return (w instanceof World);
		};

		return World;
	}
);