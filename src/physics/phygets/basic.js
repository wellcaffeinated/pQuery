define(
	[
		'util/class',
		'physics/body'
	],
	function(
		Class,
		Body
	){

		var Basic = Class({
				
			_type: 'basic'
			
			,__constructor__: function(){

				this.x = this.y = this.z = 0;
				this.px = this.py = this.pz = 0;
				this.ax = this.ay = this.az = 0;

				Basic.prototype.__extends__.call( this );
			}

			,__extends__: Body

			// used in stepping process
			,resolveAcceleration: function( delta ){

				this.x += this.ax * (delta *= delta);
				this.y += this.ay * delta;
				this.z += this.az * delta;
				this.ax = this.ay = this.az = 0;
			}

			,resolveInertia: function( delta ){

				var x = this.x*2 - this.px
					,y = this.y*2 - this.py
					,z = this.z*2 - this.pz
					;

				this.px = this.x;
				this.py = this.y;
				this.pz = this.z;
				this.x = x;
				this.y = y;
				this.z = z;

			}

			,position: function( pos ){

				var type
					;

				if ( arguments.length > 0 ){

					type = typeof pos;

					if ( type === 'object' ){

						this.x = pos.x || this.x;
						this.y = pos.y || this.y;
						this.z = pos.z || this.z;

						this._fire( 'modified', [ [this], this, 'position' ] );

					} else {

						this.x = pos || this.x;
						this.y = arguments[1] || this.y;
						this.z = arguments[2] || this.z;

						this._fire( 'modified', [ [this], this, 'position' ] );
					}
				}

				return {
					x: this.x,
					y: this.y,
					z: this.z
				};
			}

			,accelerate: function( accel ){

				var type
					;

				if ( arguments.length > 0 ){

					type = typeof accel;

					if ( type === 'object' ){

						accel.x && this.ax += accel.x;
						accel.y && this.ay += accel.y;
						accel.z && this.az += accel.z;

						this._fire( 'modified', [ [this], this, 'acceleration' ] );

					} else {

						if ( accel ) this.ax += accel;
						if ( arguments[1] ) this.ay += arguments[1]
						if ( arguments[2] ) this.az += arguments[2]

						this._fire( 'modified', [ [this], this, 'acceleration' ] );
					}
				}

				return this;
			}

		});

		return Basic;
	}
);