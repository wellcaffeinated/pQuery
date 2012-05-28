define(
	[
		'../../util/class',
		'../../util/tools',
		'../../math/vector',
		'../body'
	],
	function(
		Class,
		Tools,
		Vector,
		Body
	){
		
		var Basic = Class({
				
			_type: 'basic'

			,_events: Body.prototype._events.concat(['physics.modified'])
			
			,Basic: function(){

				Basic.prototype.__extends__.call( this );

				var _ = this._;

				// position
				_.pos = new Vector();
				// temp position
				_.mid = new Vector();
				// previous position
				_.prev = new Vector();
				// velocity
				_.v = new Vector();
				// acceleration
				_.a = new Vector();
				// timestep
				_.dt = 1;
				// dimensions of object	
				_.dimensions = new Vector();


				// flags inbetween integration (for verlet collision purposes)
				_.midInt = false;
				
			}

			,__extends__: Body

			// used in stepping process
			,resolveAcceleration: function( dt ){

				var _ = this._;

				_.midInt = true;

				_.mid.clone(_.pos);

				// verlet
				_.pos.vadd( _.a.mult( dt*dt ) );
				
				_.a.zero();
			}

			,resolveInertia: function( dt ){

				// Verlet
				// this method alows modifications to pos in interim to apply constraints
				var _ = this._;

				_.midInt = false;

				_.pos.vadd( _.mid ).vsub( _.prev );

				_.prev.clone( _.mid );
			}

			,dimensions: function( x, y, z ){

				var d = this._.dimensions;

				if ( arguments.length > 0 ){

					d.set(
						( x !== undefined )? x : d.x,
						( y !== undefined )? y : d.y,
						( z !== undefined )? z : d.z
					);
				}

				return d.toNative();
			}

			,position: function( pos ){

				var _ = this._
					,type
					,prev = false
					;

				if ( arguments.length > 0 ){

					type = typeof pos;

					if ( type === 'object' ){

						_.pos.set(
							( pos.x !== undefined )? pos.x : _.pos.x,
							( pos.y !== undefined )? pos.y : _.pos.y,
							( pos.z !== undefined )? pos.z : _.pos.z
						);

					} else {

						_.pos.set(
							( pos !== undefined )? pos : _.pos.x,
							( arguments[1] !== undefined )? arguments[1] : _.pos.y,
							( arguments[2] !== undefined )? arguments[2] : _.pos.z
						);

					}
				}

				return _.pos.toNative();
			}

			,velocity: function( vel ){

				var _ = this._
					,pos = _.pos
					,type
					;

				if ( arguments.length > 0 ){

					type = typeof vel;

					// reset temp position because we're fixing the velocity
					_.mid.clone(_.pos);

					if ( type === 'object' ){

						_.prev.clone(_.mid).vsub(
						    _.v.set(
								( vel.x !== undefined )? vel.x : 0,
								( vel.y !== undefined )? vel.y : 0,
								( vel.z !== undefined )? vel.z : 0
							).mult( _.dt )
						);

					} else {

						_.prev.clone(_.mid).vsub(
						    _.v.set(
								( vel !== undefined )? vel : 0,
								( arguments[1] !== undefined )? arguments[1] : 0,
								( arguments[2] !== undefined )? arguments[2] : 0
							).mult( _.dt )
						);

					}

					return _.v.mult( 1/_.dt ).toNative();
				}

				return _.v.clone(pos).vsub(_.prev).mult( 1/_.dt ).toNative();	
			}

			,accelerate: function( accel ){

				var _ = this._
					,type
					;

				if ( arguments.length > 0 ){

					type = typeof accel;

					if ( type === 'object' ){

						_.a.add(
							( accel.x !== undefined )? accel.x : 0,
							( accel.y !== undefined )? accel.y : 0,
							( accel.z !== undefined )? accel.z : 0
						);

					} else {

						_.a.add(
							( accel !== undefined )? accel : 0,
							( arguments[1] !== undefined )? arguments[1] : 0,
							( arguments[2] !== undefined )? arguments[2] : 0
						);

					}
				}

				return this;
			}

			,timeStep: function( dt ){

            	if ( dt ){

            		// rescale the velocity
            		var v = this.velocity();
            		this._.dt = dt;
            		this.velocity( v );
            		
            		return this;
            	}

            	return this._.dt;
            }

		}, 'Basic');

		return Basic;
	}
);