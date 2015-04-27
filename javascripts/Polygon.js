// File: Polygon.js
//
// JavaScript functions for Polygon processing
//
// Polygon constructor
function Polygon(a)
{
   var t = new Object();
   //t.points = a;
   t.points = new Array();
   for( k = 0; k < a.length; k++ )
      t.points[k] = a[k];
   t.toString = printPolygon;
   t.area = getPolygonArea;
   t.localCoordinates = getLocalCoordinates;
   t.normal = getNormal;
   return t;
}

// Implementation of toString()
function printPolygon()
{
   return "Polygon: " + this.points ;
}

// Calculate a polygon's area
function getPolygonArea()
{
   // Get the polygon in its own x-y coordinates (all z's should be 0)
   var polygonPrime = this.localCoordinates();
      
   // Apply the surveyor's formula
   len = polygonPrime.points.length;
   
   var result = 0.0;
   var dx = 0.0;
   var dy = 0.0;
   for( var k = 0; k < (len-1); k++ )
   {
      dx = polygonPrime.points[k+1].x - polygonPrime.points[k].x;
      dy = polygonPrime.points[k+1].y - polygonPrime.points[k].y; 
      result += polygonPrime.points[k].x * dy - polygonPrime.points[k].y * dx; 
   } 
   dx = polygonPrime.points[0].x - polygonPrime.points[len-1].x;
   dy = polygonPrime.points[0].y - polygonPrime.points[len-1].y; 
   result += polygonPrime.points[len-1].x * dy - polygonPrime.points[len-1].y * dx;  
   return result/2.0;
}

// Calculate a polygon's normal vector
function getNormal()
{
   // Construct a vector from points[0] to points[1]
   var dx = this.points[1].x - this.points[0].x;
   var dy = this.points[1].y - this.points[0].y;
   var dz = this.points[1].z - this.points[0].z;
   var v01 = new Vector( dx,dy,dz );
   
   // Construct a vector from points[1] to points[2]
   dx = this.points[2].x - this.points[1].x;
   dy = this.points[2].y - this.points[1].y;
   dz = this.points[2].z - this.points[1].z;
   var v12 = new Vector( dx,dy,dz );   
   
   // Get the cross product, which returns a vector in the normal direction
   norm = v01.crossProduct(v12);   
   
   // Make norm a unit vector
   norm = norm.unitVector();   
   
   return norm;
}

// Convert a Polygon in (x,y,z) to a polygon in (x',y',0)
function getLocalCoordinates()
{
   // Copy "this" Polygon
   var p = new Polygon( this.points );
   
   // Select p.points[0] as the displacement
   var Rx = p.points[0].x;
   var Ry = p.points[0].y;
   var Rz = p.points[0].z;

   // Subtract R from all the points of polygon p
   for( var k = 0; k < p.points.length; k++ )
   {
      p.points[k].x -= Rx;
      p.points[k].y -= Ry;
      p.points[k].z -= Rz;
   }

   // Select P0P1 as the x-direction
   var dx = p.points[1].x-p.points[0].x;
   var dy = p.points[1].y-p.points[0].y;
   var dz = p.points[1].z-p.points[0].z;
   var xprime = new Vector(dx,dy,dz);
   
   // Find a unit vector in the xprime direction
   var iprime = xprime.unitVector();

   // Find the vector P1P2
   dx = p.points[2].x-p.points[1].x;
   dy = p.points[2].y-p.points[1].y;
   dz = p.points[2].z-p.points[1].z;
   var p1p2 = new Vector(dx,dy,dz);

   // Find a vector kprime in the zprime direction
   var kprime = iprime.crossProduct(p1p2);
   
   // Make kprime a unitVector
   kprime = kprime.unitVector();

   // Find the vector jprime in the yprime direction
   var jprime = kprime.crossProduct(iprime);

   // For each point, calculate the projections on xprime, yprime, zprime
   // (All zprime values should be zero)
   for( var k = 0; k < p.points.length; k++ )
   {
      var pprime = new Point(0,0,0);
      var pv = new Vector( p.points[k].x, p.points[k].y, p.points[k].z );
      pprime.x = iprime.dotProduct(pv);
      pprime.y = jprime.dotProduct(pv);
      pprime.z = kprime.dotProduct(pv);
      p.points[k] = pprime;
   }

   // Return a polygon in its own local x'y'z' coordinates
   return p;
}
