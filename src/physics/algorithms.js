define(
    [
        'util/tools'
    ],
    function(
        Tools
    ){

        return {
            interactions: {

                // strength of gravity
                NewtonianGravity: function( strength ){

                    var i, l, other, pos, otherpos, x, y, z, lensq, len, g;

                    return {

                        soft: function( delta, obj, idx, list ){

                            for(i = idx+1, l = list.length; i < l; i++){
                                
                                pos = obj.position();
                                other = list[ i ];
                                otherpos = other.position();
                                x = otherpos.x - pos.x;
                                y = otherpos.y - pos.y;
                                z = otherpos.z - pos.z;
                                lensq = x*x + y*y + z*z;
                                len = Math.sqrt(lensq);
                                g = strength/(lensq*len);

                                obj.accelerate( x=x*g, y=y*g, z=z*g );
                                other.accelerate( -x, -y, -z );
                            }
                        }
                    };
                }

                ,Friction: function( strength ){

                    var p, l, x, y, z;

                    // keep it between 1 and 0
                    strength = Math.max(Math.min(strength, 1), 0);

                    return {

                        soft: function( delta, obj, idx, list ){

                            p = obj.position();

                            x = p.x - p.px;
                            y = p.y - p.py;
                            z = p.z - p.pz;
                            l = Math.sqrt(x*x+y*y+z*z);

                            // move previous position closer to slow it down proportionally
                            // to the strength
                            p.px += strength*x/l;
                            p.py += strength*y/l;
                            p.pz += strength*z/l;

                            obj.position( p );
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
                    
                    max.x = min.x + whd.width;
                    max.y = min.y + whd.height;
                    max.z = min.z + whd.depth;

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

                            pos.x = pos.x > (upper = max.x - whd.width) ? 
                                (count++) && upper : 
                                (lower = min.x + whd.width) > pos.x ? 
                                    (count++) && lower : 
                                    pos.x;

                            pos.y = pos.y > (upper = max.y - whd.height) ? 
                                (count++) && upper : 
                                (lower = min.y + whd.height) > pos.y ? 
                                    (count++) && lower : 
                                    pos.y;

                            pos.z = pos.z > (upper = max.z - whd.depth) ? 
                                (count++) && upper : 
                                (lower = min.z + whd.depth) > pos.z ? 
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