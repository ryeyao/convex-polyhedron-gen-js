/**
 *
 * Created by rye on 11/22/14.
 */

/*

 sphere : {
 radius : 0,
 center : THREE.vector3(0, 0, 0)
 }

 box : {
 vertex3A : THREE.vector3(0, 0, 0),
 vertex3B : THREE.vector3(100, 100, 100)
 objects : THREE object
 }
 */


function moveBox(box, deltaX, deltaY, deltaZ) {

    movePoint3(box.vertex3A, deltaX, deltaY, deltaZ);
    movePoint3(box.vertex3B, deltaX, deltaY, deltaZ);
}

function movePoint3(point, deltaX, deltaY, deltaZ) {
    point.x += deltaX;
    point.y += deltaY;
    point.z += deltaZ;
}

function movePoints(points, deltaX, deltaY, deltaZ) {
    for (var i = 0; i < points.length; i++) {
         movePoint3(points[i], deltaX, deltaY, deltaZ);
    }
}

function movePoint3ByVector(point, deltaVector3) {
    movePoint3(point, deltaVector3.x, deltaVector3.y, deltaVector3.z);
}


function areIntersectedSpheres(sphereA, sphereB) {

    var dist = sphereA.center.distanceTo(sphereB.center);
    return sphereA.radius + sphereB.radius > dist;
}

function areIntersectedPolyhedrons(polyhedronA, polyhedronB) {

    function whichSide(vertices, pointA, pointB) {
        // edge: (pointA, pointB)
        var positive = 0, negative = 0;
        for (var i = 0; i < vertices.length; i++) {
            var tmpV = new THREE.Vector3();
            var t = pointA.dot(tmpV.subVectors(vertices[i], pointB));
            if (t > 0) positive++;
            else if (t < 0) negative++;
            if (positive && negative) return 0;
        }
        return positive?+1:-1;
    }

    function extractFaces(faces, size) {
        var face3s = [];
        for (var i = 0; i < faces.length; i += size) {
            var faceVertices = faces.slice(i,i+size);
            var va = faceVertices[0],
            vb = faceVertices[1],
            vc = faceVertices[2];

            var normal = faceNormal(va, vb, vc);
            var face = new Face3(va, vb, vc, normal);
            face3s.push(face);
        }
        return face3s;
    }

    function extractEdges(pfaces, size) {
        
        function equalEdge(ea, eb) {

            return ea[0] === eb[1] && ea[1] === eb[0];

        }

        var faces = pfaces.slice();
        var hole = [];

        for (var f = 0; f < faces.length; f++) {

            var face = faces[f];

            for (var e = 0; e < 3; e++) {

                var edge = [face[e], face[( e + 1 ) % 3]];
                var boundary = true;

                // remove duplicated edges.
                for (var h = 0; h < hole.length; h++) {

                    if (equalEdge(hole[h], edge)) {

                        hole[h] = hole[hole.length - 1];
                        hole.pop();
                        boundary = false;
                        break;

                    }

                }

                if (boundary) {

                    hole.push(edge);

                }

            }

            // remove faces[ f ]
            faces[f] = faces[faces.length - 1];
            faces.pop();
        }

        return hole;
    }

    function testSide(pA, pB, fA, fB) {
        
        for (var i = 0; i < fA.length; i++) {
            var d = fA[i].normal;
            if (whichSide(pB.vertices, d, pA.vertices[fA[i].a]) > 0) {
                return false;
            }
        }
    }

    var size = 3;
    var facesA = polyhedronA.faces,
    facesB = polyhedronB.faces;

    if (testSide(polyhedronA, polyhedronB, facesA, facesB) == false) {
        return false;
    }
    if (testSide(polyhedronB, polyhedronA, facesB, facesA) == false) {
        return false;
    }

    var edgesA = extractEdges(facesA, size),
    edgesB = extractEdges(facesB, size);

    for (var i = 0; i < edgesA.length; i++) {
        for (var j = 0; j < edgesB.length; j++) {
            var tmpV = new THREE.Vector3();
            var d = tmpV.crossVectors(edgesA[i], edgesB[j]);

            var side0 = whichSide(polyhedronA.vertices, d, edgesA[i][0]);

            if (side0 == 0) {
                continue;
            }

            var side1 = whichSide(polyhedronB.vertices, d, edgesA[i][0]);
            if (side1 == 0) {
                continue;
            }

            if (side0 * side1 < 0) {
                return false;
            }
        }
    }
    
    return true;  
}

function faceNormal(va, vb, vc) {

        var cb = new THREE.Vector3();
        var ab = new THREE.Vector3();

        cb.subVectors(vc, vb);
        ab.subVectors(va, vb);
        cb.cross(ab);

        cb.normalize();

        return cb;

    }

function randomPoint3(minX, maxX, minY, maxY, minZ, maxZ) {
    return new THREE.Vector3(randomBetween(minX, maxX), randomBetween(minY, maxY), randomBetween(minZ, maxZ));
}

function randomPointInBox(box) {
    return randomPoint3(box.vertex3A.x, box.vertex3B.x, box.vertex3A.y, box.vertex3B.y, box.vertex3A.z, box.vertex3B.z);
}

function randomPointInCylinder(cylinder) {
    var x, y, z, radius, gama;

    radius = randomBetween(0, cylinder.parameters.radiusTop);
    gama = randomBetween(0, 2 * Math.PI);

    x = radius * Math.cos(gama);
    z = radius * Math.sin(gama);
    y = randomBetween(0, cylinder.parameters.height);
    return new THREE.Vector3(x, y, z);
}

function randomBetween(min, max) {
    var rand = min + Math.random() * (max - min);
    //rand = Math.round(rand);
    rand = parseFloat(rand.toFixed(2));
    return rand;
}

function randomSphereInBox(minR, maxR, box) {

    // Random central point
    var radius = randomBetween(minR, maxR);
    var innerBox = {
        vertex3A: new THREE.Vector3(box.vertex3A.x + radius, box.vertex3A.y + radius, box.vertex3A.z + radius),
        vertex3B: new THREE.Vector3(box.vertex3B.x - radius, box.vertex3B.y - radius, box.vertex3B.z - radius)
    };
    var centre = randomPointInBox(innerBox);

    return {radius: radius, center: centre};
}

function randomSphereInCylinder(minR, maxR, cylinder) {
    var radius = randomBetween(minR, maxR);
    var innerCylinder = new THREE.CylinderGeometry(cylinder.parameters.radiusTop - radius, cylinder.parameters.radiusBottom - radius, cylinder.parameters.height - radius*2, 32);
    var centre = randomPointInCylinder(innerCylinder);
    return {radius: radius, center: centre};
}

function randomSphereNonIntersected(minR, maxR, container, randomSphereFunc) {

    var spheres = [];
    var len_old = 0;
    var intersectionCount = 0;
    var MAX_ITER_COUNT = 10;

    return function () {
        for (var i = 0; i < MAX_ITER_COUNT; i++) {
            var sphere = randomSphereFunc(minR, maxR, container);
            if (spheres.length > 0 && hasIntersection(spheres, sphere, areIntersectedSpheres)) {
                intersectionCount++;
                //console.log(intersectionCount + ' intersection detected.');
                continue;
            }
            len_old = spheres.length;
            spheres.push(sphere);
            if (spheres.length < len_old) {
                console.log('Stack Overflow. Terminated.');
                return "Overflow";
            }
            console.log('Non-intersected spheres: ' + spheres.length);
            return sphere;
        }
    }

}

function randomConvexNonIntersected(minR, maxR, minVertices, maxVertices, container, randomSphereFunc) {
    var polyhedrons = [];
    var len_old = 0;
    var intersectionCount = 0;
    var MAX_ITER_COUNT = 10;

    return function() {
        for (var i = 0; i < MAX_ITER_COUNT; i++) {
            var sphere = randomSphereFunc(minR, maxR, container);
            var convex = randomConvexInSphere(minVertices, maxVertices, sphere);

            if (polyhedrons.length > 0 && hasIntersection(polyhedrons, convex, areIntersectedPolyhedrons)) {
                intersectionCount++;
                continue;
            }
          
            // convex.boundingSphere = sphere;

            polyhedrons.push(convex);

            if (polyhedrons.length < len_old) {
                console.log('Stack Overflow. Terminated.');
                return "Overflow";
            }
            console.log('Non-intersected polyhedrons: ' + polyhedrons.length);
            
            len_old = polyhedrons.length;
            return convex;
        }
    }
}

function hasIntersection(shapes, shape, intersectFunc) {
    for (var i in shapes) {
        if (intersectFunc(shape, shapes[i])) {
            return true;
        }
    }

    return false;
}

function randomPointInSphere(sphere) {

    var x, y, z, theta, gama;

    theta = randomBetween(0, Math.PI);
    gama = randomBetween(0, 2 * Math.PI);

    x = sphere.radius * Math.sin(theta) * Math.cos(gama);
    y = sphere.radius * Math.sin(theta) * Math.sin(gama);
    z = sphere.radius * Math.cos(theta);

    var point = new THREE.Vector3(x, y, z);

    movePoint3ByVector(point, sphere.center);

    return point;
}

function randomConvexInSphere(minVertices, maxVertices, sphere) {


    var verticesNum = randomBetween(minVertices, maxVertices);
    var points = [];
    for (var i = 0; i < verticesNum; i++) {

        points.push(randomPointInSphere(sphere));

    }

    return new THREE.ConvexGeometry(points);
}

function calcVolumeOfSphere(sphere) {
  return sphere.radius * sphere.radius * sphere.radius * 3.14 * 4 / 3;
}

function calcVolumeOfBox(box) {
  return (box.vertex3B.x - box.vertex3A.x) * (box.vertex3B.y - box.vertex3A.y) * (box.vertex3B.z - box.vertex3A.z);
}

function calcVolumeOfCylinder(cylinder) {
    return (cylinder.parameters.radiusTop * cylinder.parameters.radiusTop * 3.14 * cylinder.parameters.height);
}

var rate = 0;
var totalVolume = 0;

function randomGenAndPut() {

    var box = {
        vertex3A: new THREE.Vector3(0, 0, 0),
        vertex3B: new THREE.Vector3(150, 150, 150),
        objects: []
    };
    var boxVolume = calcVolumeOfBox(box);

    var cylinder_geometry = new THREE.CylinderGeometry(75, 75, 150, 32);
    var cylinder = new THREE.Mesh(cylinder_geometry);
    var cylinderVolume = calcVolumeOfCylinder(cylinder_geometry);
    // scene.add(cylinder);

    var container = box;
    var containerVolume = cylinderVolume;

    //moveBox(box, 100, 100, 100);

    var minR = 20, maxR = 30;
    var minVertices = 4, maxVertices = 4;

    // Randomly generate outbound sphere for the convex polyhedron to be generated

    // var randomSphere = randomSphereNonIntersected(minR, maxR, cylinder_geometry, randomSphereInCylinder);
    // var randomSphere = randomSphereNonIntersected(minR, maxR, box, randomSphereInBox);
    var randomConvex = randomConvexNonIntersected(minR, maxR, minVertices, maxVertices, container, randomSphereInBox);


    // Generate polyhedrons forever
    for (var i = 0; i < 100000; i++) {
    // while(true) {
        var materials = [
            //new THREE.MeshLambertMaterial( { ambient: 0xff0000}),//, map: map } ),
            new THREE.MeshLambertMaterial({ambient: Math.random() * 16777215}),
            new THREE.MeshBasicMaterial({color: Math.random() * 16777215, wireframe: true, transparent: true, opacity: 1})
        ];

        // var sphere;
        // sphere = randomSphere();
        // if (sphere == undefined) continue;
        // if (sphere == "Overflow") {
        //     return;
        // } 
        // if (sphere == undefined) continue;
        // var convex = randomConvexInSphere(minVertices, maxVertices, sphere);


        var convex = randomConvex();
        if (convex == undefined) continue;
        var volume = calculate(convex);
        if (volume < 1) continue;
        totalVolume += volume;
        rate = (totalVolume / containerVolume) * 100
        // console.log("Vertices: " + JSON.stringify(convex.vertices));
        console.log("Current: " + volume);
        console.log("Total: " + totalVolume);
        console.log("containerVolume: " + containerVolume);
        console.log("Rate: " + rate);
        console.log("IterCount: " + i);
        var object = THREE.SceneUtils.createMultiMaterialObject(convex, materials);
        // object.position.set(sphere.center.x, sphere.center.y, sphere.center.z);
        // object.position.set(convex.boundingSphere.center);
        // object.position.set(convex.boundingSphere.center.x, convex.boundingSphere.center.y, convex.boundingSphere.center.z)
        scene.add(object);
        box.objects.push(object);
        if (rate > 30) ;
        // setTimeout(randomGenAndPut);

    }

    // console.log("Box V: " + boxVolume);

    // return box;
}
