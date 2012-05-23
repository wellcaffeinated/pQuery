require(['../src/pquery'], function(pQuery){
    
    var stage, bounds;

    //check and see if the canvas element is supported in
    //the current browser
    //http://diveintohtml5.org/detect.html#canvas
    if(!(!!document.createElement('canvas').getContext))
    {
        var wrapper = document.getElementById("wrapper");
        wrapper.innerHTML = "Your browser does not appear to support " +
        "the HTML5 Canvas element";
        return;
    }

    //get a reference to the canvas element
    var canvas = document.getElementById("world");

    //copy the canvas bounds to the bounds instance.
    //Note, if we resize the canvas, we need to reset
    //these bounds.
    bounds = new Rectangle();
    bounds.width = canvas.width;
    bounds.height = canvas.height;
    stage = new Stage(canvas);


    // plugin to update position of views
    pQuery.fn.updateView = function(){

        return this.each(function(){

            var self = pQuery(this)
                ,view = self.data('view')
                ,pos
                ;

            if (view){

                pos = self.position();
                view.x = pos.x;
                view.y = pos.y;

            }

        });
    };

    // create and return a sphere with a canvas view
    function newCircle(x, y, r, vx, vy){

        var c = new Shape();
        c.x = x;
        c.y = y;
        c.graphics.beginFill(Graphics.getRGB(255,200,200,1));
        c.graphics.drawCircle(0,0,r);
        stage.addChild(c);

        return pQuery( '<sphere>' )
            .data( 'view', c )
            .dimensions( r )
            .position( x, y )
            .velocity( vx, vy );
    }

    var spheres = pQuery(null);

    // create some spheres
    while(spheres.length < 100){
        var x = Math.random() * (500-50) + 25
            ,y = Math.random() * (500-50) + 25
            ,r = Math.random() * 20 + 5
            ;

        var collides = false;
        for(var i = 0, l = spheres.length; i < l; i++){
                var other = spheres[i];
                var pos = pQuery.Vector(x,y);
                pos.vsub(other.position());
                
                if(pos.norm() < other.dimensions().radius + r){
                        collides = true;
                        break;
                }
        }

        if(!collides){
            spheres = spheres.add(newCircle( 
                x, 
                y, 
                r,
                0*(Math.random()-0.5), 
                0*Math.random()
            ));
        }
    }

    // cache the world
    // set bounds
    var world = pQuery('world').dimensions( bounds.width, bounds.height );

    // put spheres into world
    spheres.appendTo(world);

    // what happens on each full step
    world.on('step', function(){

        spheres.updateView();
        stage.update();
    });

    // define some interactions
    world
        .interact('soft', 'sphere', function( delta, sph ){

            // earth gravity
            sph.accelerate(0, 0.0005);

        })
        .interact( pQuery.interactions.SphereCollide( 0.1 ), 'sphere' )
        .interact( pQuery.interactions.ConstrainWithin( world, 0.3 ), 'sphere' )
        ;

    // other fun things
    // spheres.interact( pQuery.interactions.NewtonianGravity( 1 ) );
    // spheres.interact( pQuery.interactions.Drag( 1/10000 ) );

    // subscribe to the timer
    pQuery.ticker.subscribe(function(time, dt){

        world.step(time);

    });

    // get some ui elements
    var info = document.getElementById('info');
    var v = pQuery.Vector();
    var ss = document.getElementById('stopstart');

    // set up pause button
    ss.addEventListener('click', function(){

        if ( world.isPaused() ){

            world.unpause();
            ss.innerHTML = 'Stop';        
            return;
        }

        ss.innerHTML = 'Start';
        world.pause();

    });


    world.on('step', function(){
        //monitor energy
        var E = 0;
        
        spheres.each(function(){
            E += 0.5*v.clone(this.velocity()).normSq();
            var self = this
                , r = this.position()
                ;
            
            // gravitational potential energy
            E -= 0.001*this.position().y;
            
            // n-body gravity potential
            // spheres.each(function(){

            //   if ( this === self )return;
            //   E -= 0.5/v.clone(this.position()).vsub(r).norm();

            // });

        });
            
        info.innerHTML = 'FPS: '+world[0].FPS+
            '<br/>steps: '+world[0].nsteps+
            '<br/>Energy: '+ E;

            ;
    })
    
    // set timestep size
    world.timeStep( 16 );

    // start the madness!
    pQuery.ticker.start();

});