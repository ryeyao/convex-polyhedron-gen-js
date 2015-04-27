// File: Pyramid.js
//
// JavaScript functions for Pyramid processing
//
// Pyramid constructor
function Pyramid(poly,pnt)
{
   var t = new Object();
   t.polygon = poly;
   t.point = pnt;
   t.height = getPyramidHeight
   t.volume = getPyramidVolume;
   t.baseArea = getPyramidBaseArea;
   t.toString = printPyramid;
   return t;
}

// Implementation of toString() returns a String
function printPyramid()
{
   return "Pyramid: " + this.polygon + " + " + this.point;
}

// Calculate the Pyramid's volume
function getPyramidVolume()
{
   // Calculate the perpendicular distance from the base to the top point
   var d = this.height();
 
   // Calculate the area of the base
   var baseArea = this.polygon.area();

   // Calculate the volume of the polygon's pyramid
   var volume = d * baseArea / 3.0;
   return volume;   
}

function getPyramidHeight()
{
   // Construct a vector from the Pyramid base to the top point
   var dx = this.point.x - this.polygon.points[0].x;
   var dy = this.point.y - this.polygon.points[0].y;
   var dz = this.point.z - this.polygon.points[0].z;
   var vt = new Vector(dx,dy,dz);   

   // Calculate the perpendicular distance from the base to the top point.
   // The distance d is the projection of vt in the normal direction.
   // Because a right-hand coordinate system is assumed, the value of d
   // may be negative, so the absolute value is returned.
   var norm = this.polygon.normal();    
   var d = norm.dotProduct(vt);
   var result = 0.0; 
   if( d < 0.0 )
      result = Math.abs(d);
   else
      result = d;
   return result;
}

function getPyramidBaseArea()
{
   return this.polygon.area();
}