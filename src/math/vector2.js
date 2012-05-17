define(
  function(){

    /*
     * Constructor
     */
    function Vector(x, y) {

        this.x = x || 0.0;
        this.y = y || 0.0;
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

        return Vector.mult( v1.dot(v2) / v1.normSq(), v2 );
    };


    /**
     * Methods
     */

    /**
     * Sets the components of this vector.
     */
    Vector.prototype.set = function(x, y) {

      this.x = x;
      this.y = y;
      return this;
    };

    /**
     * Add vector to this
     */
    Vector.prototype.vadd = function(v) {

      this.x += v.x;
      this.y += v.y;
      return this;
    };

    /**
     * Subtract vector from this
     */
    Vector.prototype.vsub = function(v) {

      this.x -= v.x;
      this.y -= v.y;
      return this;
    };

    /**
     * Add scalars to vector's components
     */
    Vector.prototype.add = function(x, y){

        this.x += x;
        this.y += y === undefined? x : y;
        return this;
    };

    /**
     * Subtract scalars to vector's components
     */
    Vector.prototype.sub = function(x, y){

        this.x -= x;
        this.y -= y === undefined? x : y;
        return this;
    };

    /* 
     * Multiply by a scalar
     */
    Vector.prototype.mult = function(m) {
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
     * Get the norm (length)
     */
    Vector.prototype.norm = function() {

        return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    /**
     * Get the norm squared
     */
    Vector.prototype.magSq = function() {

        return (this.x * this.x) + (this.y * this.y);
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

        var m;
        this.x /= (m = Math.sqrt(this.x * this.x + this.y * this.y));
        this.y /= m;
        return this;
    };

    /**
     * Returns clone of current vector
     * Or clones provided vector to this one
     */
    Vector.prototype.clone = function(v) {
        
        if(v){
         
            this.x = v.x;
            this.y = v.y;
            return this;
        }

        return new Vector( this.x, this.y );
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
    Vector.prototype.clear = function() {

        this.x = 0.0;
        this.y = 0.0;
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