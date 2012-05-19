function IntegrationTest(count, time) {
    this.count = count||100;
    this.a = 9.81;
    this.t = time||1;
    this.dt = this.t/this.count;
}

IntegrationTest.prototype = {

    log: window.console&&console.log? function(){

        console.log.apply(console, arguments);
    } : function(){}

    ,AnalyticSolution: function(){

        var x = 0.5*this.a*this.t*this.t;
        var v = this.a*this.t;

        this.log('AnalyticSolution', x, v);
    }

    ,SimpleEuler: function(){
        
        var x = 0, v = 0, i, a = this.a, dt = this.dt, count = this.count;
        for (i=0; i < count; i++) {
            x += v*dt;
            v += a*dt;
        } // for

        this.log('SimpleEuler', x, v);
    }

    ,AccurateEuler: function(){
        
        var x = 0, v = 0, i, a = this.a, dt = this.dt, count = this.count;
        for (i=0; i < count; i++) {
            x += v*dt + .5*a*dt*dt;
            v += a*dt;
        } // for

        this.log('AccurateEuler', x, v);
    }

    ,NSV: function(){
        
        var x = 0, v = 0, i, a = this.a, dt = this.dt, count = this.count;
        for (i=0; i < count; i++) {
            v += a*dt;
            x += v*dt;
        } // for

        this.log('NSF', x, v);
    }

    ,Verlet: function(){
        
        var xc = 0, xo = 0, v = 0, i, a = this.a, dt = this.dt, count = this.count;
        var dt2 = dt*dt;
        for (i=0; i < count; i++) {
            v = xc - xo + a*dt2;
            xo = xc;
            xc += v;
        } // for

        this.log('Verlet', xo, xc, v);
    }

    ,NSV2: function(){

        var x = 0, v = 0, i, a = this.a, dt = this.dt, count = this.count;
        var dt2 = dt*dt;
        for (i=0; i < count; i++) {
            v += a*dt2;
            x += v; // v is prescaled: really a displacement.
        } // for

        this.log('NSV2', x, v);
    }

    ,VelocityVerlet: function(){
        
        var x = 0, v = 0, i, a = this.a, dt = this.dt, count = this.count;
        var oldAccel = a; //0; // May be self-starting issues...
        var dt2 = dt*dt;
        for (i=0; i < count; i++) {
            x += v*dt + .5*oldAccel*dt2;
            v +=        .5*(oldAccel+a)*dt;
            oldAccel = a;
        } // for

        this.log('VelocityVerlet', x, v);
    }
};