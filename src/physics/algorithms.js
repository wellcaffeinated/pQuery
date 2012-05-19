define(
    [
        '../util/tools',
        '../math/vector'
    ],
    function(
        Tools,
        Vector
    ){

        return {
            interactions: {

                // strength of gravity
                NewtonianGravity: function( strength ){

                    var i, l, other, pos, otherpos = new Vector(), lensq, g;

                    return {

                        soft: function( dt, obj, idx, list ){

                            for(i = idx+1, l = list.length; i < l; i++){
                                
                                pos = obj.position();
                                other = list[ i ];
                                otherpos.clone(other.position());
                                otherpos.vsub( pos );

                                lensq = otherpos.normSq();
                                g = strength/lensq;

                                obj.accelerate( otherpos.normalize().mult( g ) );
                                other.accelerate( otherpos.negate() );
                            }
                        }
                    };
                }

                ,Friction: function( strength ){

                    var v = new Vector(), l, x, y, z;

                    // keep it between 1 and 0
                    strength = Math.max(Math.min(strength, 1), 0);

                    return {

                        soft: function( dt, obj, idx, list ){

                            v.clone( obj.velocity() );

                            // decrease velocity instead of applying acceleration
                            v.mult( 1 - strength );

                            obj.velocity( v );
                        }
                    };
                }

                ,SphereCollide: function( friction ){

                    var len
                        ,target
                        ,diff = new Vector()
                        ,pos1 = new Vector()
                        ,pos2 = new Vector()
                        ,r
                        ,i
                        ,l
                        ,v1 = new Vector()
                        ,v2 = new Vector()
                        ,other
                        ,factor
                        ,cache
                        ,cacheVal
                        ,v
                        ;

                    friction = Math.max(Math.min( friction , 1 ), 0);

                    return {

                        hard: function( dt, obj, idx, list ){

                            cacheVal = false;

                            if (!idx){

                                cache = {};
                            }

                            pos1.clone( obj.position() );
                            r = obj.dimensions().radius;

                            // each other
                            for ( i = idx+1, l = list.length; i < l; i++ ){

                                other = list[i];

                                diff.clone( pos2.clone( other.position() ) );
                                diff.vsub( pos1 );
                                
                                // sum of radii
                                target = r + other.dimensions().radius;
                                
                                if ( diff.x < target && diff.y < target && (len = diff.norm()) < target ){ 

                                    factor = 0.5*(len-target)/len;

                                    // recycle
                                    cacheVal = cacheVal || { v: obj.velocity(), list: [] };
                                    target = other.velocity();

                                    // move the spheres away from each other
                                    // by half the conflicting length
                                    other.position( pos2.vsub( diff.mult(factor) ) );
                                    obj.position( pos1.vadd(diff) );

                                    cacheVal.list.push({
                                        other: other,
                                        axis: diff.toNative(),
                                        v: target
                                    });

                                }
                            }

                            if ( cacheVal ){

                                cache[idx] = cacheVal;
                            }
                        }

                        ,collision: function( dt, obj, idx, list ){

                            if ( !(cacheVal = cache[idx]) ){

                                return;
                            }

                            pos1.clone( obj.position() );
                            r = obj.dimensions().radius;

                            // previous collisions
                            for ( i = 0, l = cacheVal.list.length; i < l; i++ ){

                                other = cacheVal.list[i].other;

                                diff.clone( pos2.clone( other.position() ) );
                                diff.vsub( pos1 );
                                
                                // sum of radii
                                target = r + other.dimensions().radius;
                                
                                if ( diff.x < target && diff.y < target && (len = diff.norm()) < target ){ 

                                    factor = 0.5*(len-target)/len;

                                    // move the spheres away from each other
                                    // by half the conflicting length
                                    other.position( pos2.vsub( diff.mult(factor) ) );
                                    obj.position( pos1.vadd(diff) );

                                } else continue;

                                v1.clone( cacheVal.v );
                                v2.clone( cacheVal.list[i].v );

                                diff.clone( cacheVal.list[i].axis ).normalize();

                                v = pos2.clone(v2).vsub(v1);
                                factor = v.dot(diff);
                                if ( factor >= 0 )continue;

                                // reduce velocity in direction along intersection axis
                                diff.mult( factor );

                                diff.vsub( v.mult( 0.5*friction ) );

                                v1.vadd( diff );
                                obj.velocity( v1 );
                            
                                v2.vsub( diff );
                                other.velocity( v2 );
                            }
                        }
                    };
                }

                ,ConstrainWithin: function( boundsOrParent, energyLoss ){

                    var pos
                        ,min
                        ,max
                        ,whd
                        ,upper
                        ,lower
                        ,count
                        ,fric
                        ;

                    if ( typeof boundsOrParent.dimensions === 'function' ){

                        if ( typeof boundsOrParent.position === 'function' ){

                            min = boundsOrParent.position();
                        }

                        min = min || {x:0, y:0, z:0};
                        whd = max = boundsOrParent.dimensions();

                    } else if ( typeof boundsOrParent === 'object' ) {

                        min = boundsOrParent;
                        whd = boundsOrParent;

                    } else {

                        min = whd = {};
                    }

                    min.x = Tools.isNumericQuick( min.x )? min.x : -1/0;
                    min.y = Tools.isNumericQuick( min.y )? min.y : -1/0;
                    min.z = Tools.isNumericQuick( min.z )? min.z : -1/0;
                    
                    max.x = min.x + whd.x;
                    max.y = min.y + whd.y;
                    max.z = min.z + whd.z;

                    max.x = Tools.isNumericQuick( max.x )? max.x : 1/0;
                    max.y = Tools.isNumericQuick( max.y )? max.y : 1/0;
                    max.z = Tools.isNumericQuick( max.z )? max.z : 1/0;

                    if ( energyLoss ){

                        // number between 1 and infinity
                        energyLoss = Math.tan(Math.max(Math.min(energyLoss,1),0)*Math.PI/4) + 1;

                        fric = function( delta, obj ){
                            var v = obj.velocity()
                                ;
                            
                            obj.velocity(v.x/energyLoss, v.y/energyLoss, v.z/energyLoss);
                        };
                        
                    }

                    return {

                        hard: function( delta, obj, idx, list, par ){

                            count = 1;
                            // with verlet physics, all we need to do is
                            // move the object to where it should be to constrain it
                            pos = obj.position();
                            whd = obj.dimensions();

                            if ( whd.radius ){
                                whd.x = whd.y = whd.z = whd.radius*2;
                            }

                            pos.x = pos.x > (upper = max.x - whd.x/2) ? 
                                (count++) && upper : 
                                (lower = min.x + whd.x/2) > pos.x ? 
                                    (count++) && lower : 
                                    pos.x;

                            pos.y = pos.y > (upper = max.y - whd.y/2) ? 
                                (count++) && upper : 
                                (lower = min.y + whd.y/2) > pos.y ? 
                                    (count++) && lower : 
                                    pos.y;

                            pos.z = pos.z > (upper = max.z - whd.z/2) ? 
                                (count++) && upper : 
                                (lower = min.z + whd.z/2) > pos.z ? 
                                    (count++) && lower : 
                                    pos.z;

                            obj.position( pos );

                            count--;

                            // collision friction for every collision
                            while(count-- && fric) fric( delta, obj, idx, list, par );

                        }
                    };
                }
            }
        };
    }
);