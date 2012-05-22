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
    var ctx = canvas.getContext('2d');

    //copy the canvas bounds to the bounds instance.
    //Note, if we resize the canvas, we need to reset
    //these bounds.
    bounds = new Rectangle();
    bounds.width = canvas.width;
    bounds.height = canvas.height;
    stage = new Stage(canvas);


    // plugin to update canvas drawing
    pQuery.fn.connectTheDots = function(){

        var last;

        return this.each(function(){

            var self = this;
            var pos = self.position();
            var view = self.data('view');
            if ( view ){

                view.x = pos.x;
                view.y = pos.y;

                if (last){

                    last = view.globalToLocal(last.x, last.y);

                    view.graphics
                        .clear()
                        .beginStroke("rgba(255,255,255,1)")
                        .moveTo(0, 0)
                        .lineTo(last.x, last.y)
                        .endStroke()
                        .draw(ctx);
                }
            }

            last = pos;

        });
    };

    // starting with a point... create a chain
    pQuery.fn.chain = function( len ){

        var target = 40;

        if ( len === undefined ) return this;
        if ( len <= 0 ){

            var c = new Shape();
            c.x = this.position().x;
            c.y = this.position().y;
            c.graphics.beginFill(Graphics.getRGB(255,233,233,1));
            c.graphics.drawCircle(0,0,4);
            stage.addChild(c);
            this[0].data('view', c);

            var p1 = pQuery.Vector();
            var p2 = pQuery.Vector();
            var diff = pQuery.Vector();

            this.addClass('chain');
            this[0].removeClass('chain');

            return this.interact('hard', function( dt, p, idx, pts ){

                if( idx ){

                    var l;
                    var prev = pts[idx-1];
                    p1.clone( p.position() );
                    p2.clone( prev.position() );

                    l = diff.clone(p2).vsub(p1).norm();
                    diff.mult( (l - target)/(2.1*l) );
                    
                    // only correct if prev is not first point
                    if ( idx !== 1 ){
                        p2.vsub( diff );
                        prev.position( p2 );
                    }

                    p1.vadd( diff );
                    p.position( p1 );

                }

            });
        }

        var pt = pQuery('<point>');
        var pos = this.position();
        var x = pos.x + Math.random()*5
        pt.position( x , pos.y ).velocity(0, 0);

        var c = new Shape();
        c.x = x;
        c.y = pos.y;
        c.graphics.beginFill(Graphics.getRGB(255,233,233,1));
        c.graphics.drawCircle(0,0,4);
        stage.addChild(c);
        pt.data('view', c);
        
        return this.add( pt ).chain( len - 1 );
    };

    // cache the world
    // set bounds
    var world = pQuery('world').dimensions( bounds.width, bounds.height );

    var chains = [];
    var numChains = 40;
    var dx = bounds.width/numChains;

    while(numChains--)
        chains.push(
            pQuery('<point>')
                .position(numChains*dx+dx/2, 20)
                .velocity(0, 0)
                .chain(10)
                .appendTo(world)
        );
    
    // what happens on each full step
    world.on('step', function(){

        pQuery.each(chains, function(){
            this.connectTheDots();
        });
        stage.update();
    });

    // define some interactions
    world
        .interact('soft', '.chain', function( dt, obj ){

            // earth gravity
            obj.accelerate(0, 0.0005);

        })
        ;

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