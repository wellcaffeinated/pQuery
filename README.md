# Overview

This project is at its infancy. It doesn't work yet.

# Proposed Usage

```javascript
	// create world (world === P)
	var world = pQuery(function(P){

		// create sphere
		var Psphere = P('<sphere id="my_sphere">').data(
				'el', $('#my_sphere')
			)
			;

		// set velocity, position, etc
		Psphere
			.velocity(2,3,5)
			.position(4,5,3)
			;

		// or
		Psphere.props({
			velocity: [2,3,5],
			hardness: 0.4
		});

		// draw
		Psphere.on('draw', function(){

			var self = this
				,pos = self.position('css')
				,$sphere = self.data('el')
				;

			// could do $(id)

			$sphere.css( pos ); // could also do $sphere.css('top', self.position()[0]).css(...)

		});

		// select all spheres
		P('sphere').each(function(){
			// ...
		});

		// select by id
		P('#my_sphere');//...

		// select by class
		P('.planets, .black-holes').each(function() {
			// ...
		});


		// if we want, we can set boundaries on our world
		P.width(100);
		P.dimensions({
			width: 100,
			height: 100//,
			//depth: 100 // if no depth is specified, work in 2d
		});
		P.dimensions([100, -1]); // any negative value means infinite


		// add physical laws
		// eg: linear acceleration (gravity)
		P.interact(
			
			// 'sphere', // could narrow by selector

			function(other){

			//the world will interact with a this body
			other.accelerate(0, -9.81, 0);
		});


		var G = 1500.0;
		var accel = function(pos1, pos2){
		    var direction = pos1.sub(pos2)
		    	,length = direction.length()
		    	,normal = direction.normalized()
		    	;

		    return normal.mul(G/Math.pow(length, 2));
		};

		// eg: n-body
		P('sphere.planets').interact(function(other){

			// this body and other body will interact
			var self = this
				,acc = accel(V(self.position()), V(other.position()))
				;

	        self.accelerate(acc.toArray());
	        other.accelerate(acc.imul(-1).toArray());
			
		});

		// create premade interactions
		// eg: collide spheres together
		P('sphere').interact(pQuery.interaction.collision);

		// collide (constrain) all bodies inside world
		P.interact(pQuery.interaction.collision);

	});

	world.on('step', function(time, delta) {
		updateFPS(delta);//or whatever
	});

	// create an animation loop... or use your own
	pQuery.timer.subscribe(function(time, delta) {

		var precision = 1/180;
		world.step(precision, time);

	});
```

