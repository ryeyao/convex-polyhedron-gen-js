function calculate(polyhedron)
{
   // Read the number of faces and vertices
   var faces = polyhedron.vertices.length
   var vertices = polyhedron.faces.length
   
   // Read all the vertex coordinates
   // var vertex = new Array();   
   // for( var k = 0; k < vertices; k++ )
   // {
      // var vertexStr = document.getElementById("VERTEX"+k).value;      
      // var items = vertexStr.split(",");      
   //    vertex[k] = new Point( polyhedron.vertices[k].x, polyhedron.vertices[k].y, polyhedron.vertices[k].z);            
   // }
   
   // Process all the faces
   var totalVolume = 0.0;
   for( var k = 0; k < faces; k++ )
   {
      // Read the index numbers of the vertices for this face
      // var str = document.getElementById("FACEVERTICES" + k).value;
      // var indexStrings = str.split(",");
      // var indexNumbers = new Array();
      // for( var j = 0; j < vertices; j++ )
      //    indexNumbers[j] = j;
      
      // // Create an array of Points using the indexNumbers
      // verts = new Array();
      // for( var j = 0; j < vertices; j++ )
      // { 
      //    var index = indexNumbers[j];
      //    var x = vertex[index].x;
      //    var y = vertex[index].y;
      //    var z = vertex[index].z;
      //    verts[j] = new Point( x,y,z );
      // }
      
      var verts = new Array();
      for( var j = 0; j < 3; j++) {
         var x, y, z;
         if (j == 0) {
            x = polyhedron.vertices[polyhedron.faces[k].a].x;
            y = polyhedron.vertices[polyhedron.faces[k].a].y;
            z = polyhedron.vertices[polyhedron.faces[k].a].z;    
         } else if (j == 1) {
            x = polyhedron.vertices[polyhedron.faces[k].b].x;
            y = polyhedron.vertices[polyhedron.faces[k].b].y;
            z = polyhedron.vertices[polyhedron.faces[k].b].z;
         } else {
            x = polyhedron.vertices[polyhedron.faces[k].c].x;
            y = polyhedron.vertices[polyhedron.faces[k].c].y;
            z = polyhedron.vertices[polyhedron.faces[k].c].z;
         }
         verts[j] = new Point( x,y,z );
      }

      // Create a Polygon using the vertices
      var poly = new Polygon( verts );
      
      // Create a Pyramid using the Polygon
      // var pyrm = new Pyramid( poly, new Point(0.5,0.5,1.0) );
      // Create a Pyramid using the face Polygon and vertex[0]
      var pyrm = new Pyramid( poly, polyhedron.vertices[0] );
      
      // Get he Pyramid volume
      var vol = pyrm.volume();
      
      totalVolume += vol;
   }   
   return totalVolume;
   // Display the calculated volume
   // document.getElementById("VOLUME").value = totalVolume.toFixed(5);
   // console.log("Volume: " + totalVolume.toFixed(5));
}