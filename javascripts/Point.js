// File: Point.js
//
// JavaScript functions for Point processing
//
// Point constructor
function Point(X,Y,Z)
{
   var p = new Object();
   p.x = X;
   p.y = Y;
   p.z = Z;
   p.toString = printPoint;
   return p;
}

// Implementation of toString() returns a String
function printPoint()
{
   return "Point: (" + this.x + "," + this.y + "," + this.z + ")";
}
