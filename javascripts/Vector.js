// File: Vector.js
//
// JavaScript functions for Vector processing
//
// Vector constructor
function Vector(X,Y,Z)
{
   var p = new Object();
   p.x = X;
   p.y = Y;
   p.z = Z;
   p.toString = printVector;
   p.magnitude = getMagnitude;
   p.dotProduct = getDotProduct;
   p.crossProduct = getCrossProduct;
   p.unitVector = getUnitVector;
   p.subtract = subtractVectors;
   p.add = addVectors;
   return p;
}

// Implementation of toString() returns a String
function printVector()
{
   return "Vector: (" + this.x + "," + this.y + "," + this.z + ")";
}

// Vector magnitude
function getMagnitude()
{
   var sum = this.x*this.x + this.y*this.y + this.z*this.z;
   var result = 0.0;
   if( sum > 0.0 ) {
      result = Math.pow( sum, 0.5 );
   }
   else
      result = 0.0;
   return result;
}

// Vector dot product
function getDotProduct(B)
{
   var result = this.x * B.x + this.y * B.y + this.z * B.z;
   return result;
}

// Vector cross product
function getCrossProduct(B)
{
   var c = new Vector(0,0,0);
   c.x = this.y * B.z - B.y * this.z;
   c.y = this.z * B.x - B.z * this.x;
   c.z = this.x * B.y - B.x * this.y;
   return c;
}

// Vector unit vector
function getUnitVector()
{
   var mag = this.magnitude();
   
   if( mag <= 0.0 )
      //alert("Error: Attempt to use mag <= 0 in getUnitVector()");
      console.log("Error: Attempt to use mag = " + mag + " <= 0 in getUnitVector()");
      
   var v = new Vector( this.x, this.y, this.z );
   v.x = v.x / mag;
   v.y = v.y / mag;
   v.z = v.z / mag;
   return v;
}

// Subtract two vectors
function subtractVectors(B)
{
   var u = new Vector( 0,0,0 );
   u.x = this.x - B.x;
   u.y = this.y - B.y;
   u.z = this.z - B.z;
   return u;
}

// Add two vectors
function addVectors(B)
{
   var u = new Vector( 0,0,0 );
   u.x = this.x + B.x;
   u.y = this.y + B.y;
   u.z = this.z + B.z;
   return u;
}
