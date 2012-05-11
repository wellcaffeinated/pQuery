require.config({
    baseUrl: '../src/'
});

require(['pquery'], function(pQuery){
  
    window.jQuery && jQuery.noConflict();

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


    //center
    var c = new Shape();
    c.x = canvas.width/2;
    c.y = canvas.height/2;
    c.graphics.beginFill(Graphics.getRGB(50,50,255,1));
    c.graphics.drawCircle(0,0,5);
    stage.addChild(c);

    // plugin to update position of views
    pQuery.fn.extend({
        
        updateView: function(){

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
        }
    });

    function addCircle(x, y, r, vx, vy){

        var c = new Shape();
        c.x = x;
        c.y = y;
        c.graphics.beginFill(Graphics.getRGB(255,200,200,1));
        c.graphics.drawCircle(0,0,r);
        stage.addChild(c);

        return pQuery( '<sphere>' )
          .data( 'view', c )
          .appendTo( world )
          .position( x, y )
          .velocity( vx, vy );
        };
    }

    var world = pQuery('world').on('step', (function(){

        // cache spheres
        var spheres = world.find('sphere');

        return function(){

            spheres.updateView();

            stage.update();
        };

    })());

    for(var i = 0, n = 2; i < n; i++){
        addCircle( i*25%465+10+5*Math.random(), Math.floor((i*30+10)/465)*25+10+5*Math.random(), 10, 10*(Math.random()-0.5), Math.random() );

    spheres.interact(function( delta, sph, idx, list ){

        for(var i = idx+1, l = list.length; i < l; i++){
            // newtonian gravity
            var pos = sph.position()
                ,other = list[i].position()
                ,x = other.x - pos.x
                ,y = other.y - pos.y
                ,lensq = x*x + y*y
                ,len = Math.sqrt(lensq)
                ,g = 1/(lensq*len)
                ;

            sph.accelerate(x=x*g, y=y*g);
            list[i].accelerate(-x,-y);
        }

    });

    /*world.interact(function( delta, sph ){

    // earth gravity
    sph.accelerate(0, 0.001);

    // air friction
    var v = sph.velocity()
      l = 10000*Math.sqrt(v.x*v.x + v.y*v.y)
      ;
    sph.accelerate(-v.x/l,-v.y/l)

    }, 'sphere');*/

    world.interact('hard', function( delta, sph, idx, list ){

        // boundary
        sph.x = Math.min(Math.max(10, sph.x), 500-10);
        sph.y = Math.min(Math.max(10, sph.y), 500-10);

        if(sph.x === 10 || sph.x === 490){
            // collision disipation
            var v = sph.velocity()
                ,f=1.1
                ;

            sph.velocity(v.x/f, v.y/f);
        }

        if(sph.y === 0 || sph.y === 490){
            var v = sph.velocity()
                ,f=1.1
                ;

            sph.velocity(v.x/f,v.y/f);

        }

        // each other
        for(var i = idx+1, l = list.length; i < l; i++){

            var other = list[i]
                ,pos1 = sph.position()
                ,pos2 = other.position()
                ,x = pos2.x - pos1.x
                ,y = pos2.y - pos1.y
                ,len = Math.sqrt(x*x + y*y)
                ,target = 20 // radius x 2
                ;

            if(len < target){ 
                var factor = 0.5*(len-target)/len;
                // move the spheres away from each other
                // by half the conflicting length
                other.position(pos2.x - x*factor, pos2.y - y*factor);
                sph.position(pos1.x + x*factor, pos1.y + y*factor);

                var v = sph.velocity()
                ,f=1.002
                ;

                sph.velocity(v.x/f,v.y/f);

                v = other.velocity();
                other.velocity(v.x/f,v.y/f);
            }
        }
    }, 'sphere');

    var info = document.getElementById('info');

    pQuery.ticker.subscribe(function(time, delta){

        world.step(5, time);
        info.innerHTML = 'FPS: '+world[0].FPS+'<br/>steps: '+world[0].nsteps;

    });

    pQuery.ticker.start();

    var ss = document.getElementById('stopstart');
    ss.addEventListener('click', function(){

        if ( world.isPaused() ){

            world.unpause();
            ss.innerHTML = 'Start';        
            return;
        }

        ss.innerHTML = 'Stop';
        world.pause();

    });


});