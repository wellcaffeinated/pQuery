define(
	[
		//'util/tools',
		'util/class',
		'physics/body'
	],
	function(
		//Tools,
		Class,
		Body
	){

		var World = Class({

			_type: 'world'

			,_events: Body.prototype._events.concat(['step'])
			
			,__constructor__: function(){

				var self = this;

				World.prototype.__extends__.call( this );

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

			,resolveAcceleration: function( delta ){

				var children = this._childCache
					,i = children.length - 1
					;

				for (; i > -1; i--){

					children[i].resolveInertia();
				}
			}

			,resolveInertia: function(){

				var children = this._childCache
					,i = children.length - 1
					;

				for (; i > -1; i--){

					children[i].resolveInertia();
				}
			}

			// internal method
			,onestep: function( delta ){

				if (this._refreshChildren){

					this._childCache = this.children(true);
				}

                this.time += delta;
                //this.doInteractions(delta);
                this.resolveAcceleration(delta);
                //this.collide(false);
                this.resolveInertia();
                //this.collide(true);
                //this.cleanup();
            }

			,step: function( timestep, now ){

				var time = this.time
					,diff
					;

                if ( now - time > 0.25 ){

                    time = now - 0.25;

                }

                while ( time < now ){

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
		});

		World.isWorld = function( w ){

			return (w instanceof World);
		};

		return World;
	}
);