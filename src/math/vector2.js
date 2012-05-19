define(
  function(){

    /*
     * Constructor
     */
    function Vector(x, y) {

        // force instantiation
        if ( !(this instanceof arguments.callee) ){

            return new Vector( x,y );
        }

        this.set( x || 0, y || 0);
    }

    /**
     * Static functions
     */

    /** 
     * Return sum of two vectors
     */
    Vector.vadd = function(v1, v2) {

        return new Vector( v1.x + v2.x, v1.y + v2.y );
    };

    /** 
     * Subtract v2 from v1
     */
    Vector.vsub = function(v1, v2) {

        return new Vector( v1.x - v2.x, v1.y - v2.y );
    };

    /**
     * Multiply v1 by a scalar m
     */
    Vector.mult = function(m, v1){

        return new Vector( v1.x*m, v.y*m );
    };

    /** 
     * Project v1 onto v2
     */
    Vector.proj = function(v1, v2) {

        return Vector.mult( v1.dot(v2) / v2.normSq(), v2 );
    };


    /**
     * Methods
     */

    /**
     * Sets the components of this vector.
     */
    Vector.prototype.set = function(x, y) {

        this._norm = false;
        this._normSq = false;

        this.x = x;
        this.y = y;
        return this;
    };

    /**
     * Add vector to this
     */
    Vector.prototype.vadd = function(v) {

        this._norm = false;
        this._normSq = false;

        this.x += v.x;
        this.y += v.y;
        return this;
    };

    /**
     * Subtract vector from this
     */
    Vector.prototype.vsub = function(v) {

        this._norm = false;
        this._normSq = false;

        this.x -= v.x;
        this.y -= v.y;
        return this;
    };

    /**
     * Add scalars to vector's components
     */
    Vector.prototype.add = function(x, y){
        
        this._norm = false;
        this._normSq = false;

        this.x += x;
        this.y += y === undefined? x : y;
        return this;
    };

    /**
     * Subtract scalars to vector's components
     */
    Vector.prototype.sub = function(x, y){
        
        this._norm = false;
        this._normSq = false;

        this.x -= x;
        this.y -= y === undefined? x : y;
        return this;
    };

    /* 
     * Multiply by a scalar
     */
    Vector.prototype.mult = function(m) {
        
        if ( this._normSq ){

            this._normSq *= m;
            this._norm *= m;
        }

        this.x *= m;
        this.y *= m;
        return this;
    };

    /* 
     * Get the dot product
     */
    Vector.prototype.dot = function(v) {

        return (this.x * v.x) + (this.y * v.y);
    };

    /** 
     * Get the cross product
     */
    Vector.prototype.cross = function(v) {

        return (this.x * v.y) - (this.y * v.x);
    };

    /**
     * Get projection of this along v
     */
    Vector.prototype.proj = function(v){

        var m = this.dot( v ) / v.normSq();
        return this.clone( v ).mult( m );
    };

    /**
     * Get the norm (length)
     */
    Vector.prototype.norm = function() {

        return this._norm !== false? this._norm : this._norm = Math.sqrt( this._normSq = (this.x * this.x + this.y * this.y) );
    };

    /**
     * Get the norm squared
     */
    Vector.prototype.normSq = function() {

        return this._normSq !== false? this._normSq : this._normSq = (this.x * this.x) + (this.y * this.y);
    };

    /** 
     * Get distance to other vector
     */
    Vector.prototype.dist = function(v) {
      
        var dx, dy;
        return Math.sqrt(
            (dx = v.x - this.x) * dx + 
            (dy = v.y - this.y) * dy
        );
    };

    /**
     * Get distance squared to other vector
     */
    Vector.prototype.distSq = function(v) {

        var dx, dy;
        return (
            (dx = v.x - this.x) * dx + 
            (dy = v.y - this.y) * dy
        );
    };

    /**
     * Normalises this vector, making it a unit vector
     */
    Vector.prototype.normalize = function() {

        var m = this.norm();

        // means it's a zero vector
        if ( m === 0 ){
            return this;
        }

        this.x /= m;
        this.y /= m;

        this._norm = 1;
        this._normSq = 1;

        return this;
    };

    /**
     * Returns clone of current vector
     * Or clones provided vector to this one
     */
    Vector.prototype.clone = function(v) {
        
        if(v){
            
            this._norm = false;
            this._normSq = false;

            this.x = v.x;
            this.y = v.y;
            return this;
        }

        return new Vector( this.x, this.y );
    };

    /**
     * Create a litteral object
     */
    Vector.prototype.toNative = function(){

        return {
            x: this.x,
            y: this.y
        };
    };

    /**
     * Copies components of this vector to other vector
     */
    Vector.prototype.copyTo = function(v) {
        
        v.clone( this );
        return this;
    };

    
    /**
     * Zero the vector
     */
    Vector.prototype.zero = function() {

        this._norm = 0;
        this._normSq = 0;

        this.x = 0.0;
        this.y = 0.0;
        return this;
    };

    /**
     * Make this a vector in the opposite direction
     */
    Vector.prototype.negate = function(){

        this.x = -this.x;
        this.y = -this.y;
        return this;
    };

    /**
     * Render string
     */
    Vector.prototype.toString = function(){

        return this.x + ',' + this.y;
    };

    // return api
    return Vector;
  }
);