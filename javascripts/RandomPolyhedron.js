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

function isPointOutOfBox(box, point) {
    if (point.x <= box.vertex3A.x) return true;
    if (point.y <= box.vertex3A.y) return true;
    if (point.z <= box.vertex3A.z) return true;
    if (point.x >= box.vertex3B.x) return true;
    if (point.y >= box.vertex3B.y) return true;
    if (point.z >= box.vertex3B.z) return true;

    return false;
}

function isPointOutOfCylinder(cylinder, point) {
    var radius = cylinder.radiusTop;
    cylinder.radiusTop
}

function areOneOfPointsOutOfBox(box, points) {
    for (var i = 0; i < points.length; i++) {
        if (isPointOutOfBox(box, points[i])) {
            return true;
        }
    }

    return false;
}

function isPolyhedronOutOfBox(box, polyhedron) {
    return areOneOfPointsOutOfBox(box, polyhedron.vertices);
}

function areIntersectedSpheres(sphereA, sphereB) {

    var dist = sphereA.center.distanceTo(sphereB.center);
    return sphereA.radius + sphereB.radius > dist;
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
                if (e == 0) {
                    edge = [face.a, face.b];
                } else if (e == 1) {
                    edge = [face.b, face.c];
                } else {
                    edge = [face.c, face.a];
                }
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

    function testSide(pA, pB, fA) {
        
        for (var i = 0; i < fA.length; i++) {
            var d = fA[i].normal;
            if (whichSide(pB.vertices, d, pA.vertices[fA[i].a]) > 0) {
                return false;
            }
        }
    }

    var facesA = polyhedronA.faces,
    facesB = polyhedronB.faces;

    if (testSide(polyhedronA, polyhedronB, facesA) == false) {
        return false;
    }
    if (testSide(polyhedronB, polyhedronA, facesB) == false) {
        return false;
    }

    var edgesA = polyhedronA.edges,
    edgesB = polyhedronB.edges;
    // var edgesA = extractEdges(facesA, size),
    // edgesB = extractEdges(facesB, size);

    for (var i = 0; i < edgesA.length; i++) {
        for (var j = 0; j < edgesB.length; j++) {
            var tmpV = new THREE.Vector3();
            var evA = new THREE.Vector3().subVectors(polyhedronA.vertices[edgesA[i][1]], polyhedronA.vertices[edgesA[i][0]]);
            var evB = new THREE.Vector3().subVectors(polyhedronB.vertices[edgesB[j][1]], polyhedronB.vertices[edgesB[j][0]]);

            var d = tmpV.crossVectors(evA, evB);

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
            //console.log('Non-intersected spheres: ' + spheres.length);
            return sphere;
        }
    }

}

function randomConvexNonIntersected(minR, maxR, minVertices, maxVertices, container, randomSphereFunc, allpolyhedrons) {
    // make container geometry

    var polyhedrons = [];
    if (allpolyhedrons != undefined) {
        polyhedrons = allpolyhedrons;
    }
    var len_old = 0;
    var intersectionCount = 0;
    var MAX_ITER_COUNT = 1;
    var MAX_TRY_COUNT = 20;

    return function() {
        for (var i = 0; i < MAX_ITER_COUNT; i++) {
            var sphere = randomSphereFunc(minR, maxR, container);
            // var convex = randomConvexInSphere(minVertices, maxVertices, sphere);
            var convex;
            var needRegenerate = true;
            for (var j = 0; j < MAX_TRY_COUNT; j++) {


                if (needRegenerate) {
                    convex = getBaseTetrahedronInSphere(sphere);
                }
                convex.edges = extractEdges(convex.faces, 3);

                if (polyhedrons.length > 0 && hasIntersection(polyhedrons, convex, areIntersectedPolyhedrons)) {

                    // intersection happens
                    switch (THREE.Math.randInt(1, 2, 3)) {
                        case 1:
                            // try scale the sphere
                            sphere.radius *= randomBetween(0.8, 0.9);
                            needRegenerate = true;
                            break;

                        case 2:
                            // try rotate the convex
                            var xa = randomBetween(0, 10),
                            xb = randomBetween(0, 10),
                            xc = randomBetween(0, 10),
                            euler = new THREE.Euler(xa, xb, xc, 'XYZ'),

                            matrix = new THREE.Matrix4()
                                .makeTranslation(-sphere.center.x, -sphere.center.y, -sphere.center.z);
                            convex.applyMatrix(matrix);

                            matrix = new THREE.Matrix4()
                                .makeRotationFromEuler(euler)
                            convex.applyMatrix(matrix);

                            matrix = new THREE.Matrix4()
                                .makeTranslation(sphere.center.x, sphere.center.y, sphere.center.z);
                            convex.applyMatrix(matrix);
                            needRegenerate = false;
                            break;

                        case 3:
                            // try transform
                            var xt = randomBetween(-5, 5),
                            yt = randomBetween(-5, 5),
                            zt = randomBetween(-5, 5),

                            matrix = new THREE.Matrix4().makeTranslation(xt, yt, zt);
                            convex.applyMatrix(matrix);
                            if (isPolyhedronOutOfBox(container, convex)) {
                                needRegenerate = true;
                            } else {
                                needRegenerate = false;
                            }
                            break;

                        default:
                            break;
                    }
                    intersectionCount++;
                    continue;
                } 
                
                // convex.boundingSphere = sphere;

                polyhedrons.push(convex);

                if (polyhedrons.length < len_old) {
                    console.log('Stack Overflow. Terminated.');
                    return "Overflow";
                }
                //console.log('Non-intersected polyhedrons: ' + polyhedrons.length);
                
                len_old = polyhedrons.length;
                return convex;
            }
          
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

function randomPointInCircleInSphere(sphere) {
    var x, y, z, gama;

    gama = randomBetween(0, 2 * Math.PI);

    x = sphere.radius * Math.cos(gama);
    y = sphere.radius * Math.sin(gama);
    z = 0;

    var point = new THREE.Vector3(x, y, z);

    movePoint3ByVector(point, sphere.center);

    return point;
}

function randomTrangleInSphere(sphere) {
    var pointA = randomPointInCircleInSphere(sphere),
    pointB = randomPointInCircleInSphere(sphere);
    pointC = randomPointInCircleInSphere(sphere);

    // make sure the trangle is sharp
    while (pointA.distanceTo(pointB) > sphere.radius * 2 * randomBetween(0.6, 1)) {
        pointB = randomPointInCircleInSphere(sphere);
    }

    while (pointA.distanceTo(pointC) > sphere.radius * 2 * randomBetween(0.6, 1)) {
        pointC = randomPointInCircleInSphere(sphere);
    }

    return [pointA, pointB, pointC];

}

function randomConvexInSphere(minVertices, maxVertices, sphere) {


    var verticesNum = randomBetween(minVertices, maxVertices);
    var points = [];
    var tranglePoints = randomTrangleInSphere(sphere);

    for (var i = 0; i < 3; i++) {
        points.push(tranglePoints[i]);
    }

    for (var i = 0; i < verticesNum - 3; i++) {

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

function getBaseTetrahedronInSphere(sphere) {

    // a = 2 * square(3) / 3 * r
    var v1 = new THREE.Vector3(- 0.816 * sphere.radius, 0.577 * sphere.radius, 0);
    var v2 = new THREE.Vector3(- v1.x, v1.y, v1.z);
    var v3 = new THREE.Vector3(0, - v1.y, v1.x);
    var v4 = new THREE.Vector3(v3.x, v3.y, v2.x);

    var points = [
       v1.x, v1.y, v1.z,
       v2.x, v2.y, v2.z,
       v3.x, v3.y, v3.z,
       v4.x, v4.y, v4.z
    ];


    function randomIn(x, delta) {
        return randomBetween(x - Math.abs(delta), x + Math.abs(delta));
    }

    var factor = sphere.radius / 3;

    // var points = [v1, v2, v3, v4],
    var faces = [2,1,0,0,3,2,1,3,0,2,3,1];

    var vertices = []
    for (var i = 0; i < points.length; i+=3) {
        var x = randomIn(points[i], factor);
        var y = randomIn(points[i + 1], factor);
        var z = randomIn(points[i + 2], factor);

        var newV = new THREE.Vector3(x, y, z);
        // vertices.push(x);
        // vertices.push(y);
        // vertices.push(z);
        movePoint3ByVector(newV, sphere.center)
        vertices.push(newV);
    }

    // var newFaces = []
    // for (var i = 0; i < 4; i++) {
    //         var va = vertices[faces[i][0]],
    //         vb = vertices[faces[i][1]],
    //         vc = vertices[faces[i][2]];

    //         var normal = faceNormal(va, vb, vc);
    //         var face = new THREE.Face3(va, vb, vc, normal);
    //         newFaces.push(face);
    // }

    // var tetrahedron = new THREE.PolyhedronGeometry(vertices, faces);
    var tetrahedron = new THREE.ConvexGeometry(vertices);
    return tetrahedron;
}

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
    var containerVolume = boxVolume;

    //moveBox(box, 100, 100, 100);

    var minR = 5, maxR = 20;
    var minVertices = 4, maxVertices = 4;

    // Randomly generate outbound sphere for the convex polyhedron to be generated

    // var randomSphere = randomSphereNonIntersected(minR, maxR, cylinder_geometry, randomSphereInCylinder);
    // var randomSphere = randomSphereNonIntersected(minR, maxR, box, randomSphereInBox);
    var randomConvex = randomConvexNonIntersected(minR, maxR, minVertices, maxVertices, container, randomSphereInBox, allConvex);


    // Generate polyhedrons forever
    for (var i = 0; i < 1000; i++) {
        // console.log("IterCount: " + (i + 1));

    // while(true) {
        var materials = [
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
        if (volume < 20) continue;
        totalVolume += volume;
        rate = (totalVolume / containerVolume) * 100
        // console.log("Vertices: " + JSON.stringify(convex.vertices));
        // console.log("Current: " + volume);
        // console.log("Total: " + totalVolume);
        // console.log("containerVolume: " + containerVolume);
        console.log("Rate: " + rate);
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

function randomGenAndPutInSubBox() {

    var box = {
        vertex3A: new THREE.Vector3(0, 0, 0),
        vertex3B: new THREE.Vector3(150, 150, 150),
        objects: [],
        randomFunc: function(){}
    };
    var boxVolume = calcVolumeOfBox(box);

    var container = box;
    var containerVolume = boxVolume;

    //moveBox(box, 100, 100, 100);

    var minR = 5, maxR = 20;
    var minVertices = 4, maxVertices = 4;

    // Randomly generate outbound sphere for the convex polyhedron to be generated
    var subBoxes = [];
    var randomFuncs = [];
    var subStep = 50;
    var allConvex = [];


    for (var i = 0; i < container.vertex3B.x; i+=subStep) {

        for (var j = 0; j < container.vertex3B.x; j+=subStep) {

            for (var k = 0; k < container.vertex3B.x; k+=subStep) {

                var sub = {
                    vertex3A: new THREE.Vector3(i, j, k),
                    vertex3B: new THREE.Vector3(i + subStep, j + subStep, k + subStep)
                };
                randomFuncs.push(randomConvexNonIntersected(minR, maxR, minVertices, maxVertices, sub, randomSphereInBox));
                subBoxes.push(sub);
            }
        }
    }

    // var randomSphere = randomSphereNonIntersected(minR, maxR, cylinder_geometry, randomSphereInCylinder);
    // var randomSphere = randomSphereNonIntersected(minR, maxR, box, randomSphereInBox);


    // Random in each sub box
    //while (true) {
        for (var i = 0; i < subBoxes.length - 1; i++) {
            // Generate polyhedrons forever
            for (var j = 0; j < 200; j++) {
                // console.log("IterCount: " + (i + 1));

                // while(true) {
                var materials = [
                    new THREE.MeshLambertMaterial({ambient: Math.random() * 16777215}),
                    new THREE.MeshBasicMaterial({
                        color: Math.random() * 16777215,
                        wireframe: true,
                        transparent: true,
                        opacity: 1
                    })
                ];

                // var sphere;
                // sphere = randomSphere();
                // if (sphere == undefined) continue;
                // if (sphere == "Overflow") {
                //     return;
                // }
                // if (sphere == undefined) continue;
                // var convex = randomConvexInSphere(minVertices, maxVertices, sphere);

                var convex = randomFuncs[i]();
                if (convex == undefined) continue;
                allConvex.push(convex);
                var volume = calculate(convex);
                //if (volume < 20) continue;
                totalVolume += volume;
                rate = (totalVolume / containerVolume) * 100
                // console.log("Vertices: " + JSON.stringify(convex.vertices));
                // console.log("Current: " + volume);
                // console.log("Total: " + totalVolume);
                // console.log("containerVolume: " + containerVolume);
                console.log("Rate: " + rate);
                var object = THREE.SceneUtils.createMultiMaterialObject(convex, materials);
                // object.position.set(sphere.center.x, sphere.center.y, sphere.center.z);
                // object.position.set(convex.boundingSphere.center);
                // object.position.set(convex.boundingSphere.center.x, convex.boundingSphere.center.y, convex.boundingSphere.center.z)
                scene.add(object);
                //box.objects.push(object);
                if (rate > 30) ;
                // setTimeout(randomGenAndPut);
            }


        }
        randomFuncs.push(randomConvexNonIntersected(minR, maxR, minVertices, maxVertices, container, randomSphereInBox, allConvex));
        subBoxes.push(container);


        for (var j = 0; j < 1000; j++) {
            // console.log("IterCount: " + (i + 1));

            // while(true) {
            var materials = [
                new THREE.MeshLambertMaterial({ambient: Math.random() * 16777215}),
                new THREE.MeshBasicMaterial({
                    color: Math.random() * 16777215,
                    wireframe: true,
                    transparent: true,
                    opacity: 1
                })
            ];

            // var sphere;
            // sphere = randomSphere();
            // if (sphere == undefined) continue;
            // if (sphere == "Overflow") {
            //     return;
            // }
            // if (sphere == undefined) continue;
            // var convex = randomConvexInSphere(minVertices, maxVertices, sphere);

            var convex = randomFuncs[i]();
            if (convex == undefined) continue;
            var volume = calculate(convex);
            //if (volume < 20) continue;
            totalVolume += volume;
            rate = (totalVolume / containerVolume) * 100
            // console.log("Vertices: " + JSON.stringify(convex.vertices));
            // console.log("Current: " + volume);
            // console.log("Total: " + totalVolume);
            // console.log("containerVolume: " + containerVolume);
            console.log("Rate: " + rate);
            var object = THREE.SceneUtils.createMultiMaterialObject(convex, materials);
            // object.position.set(sphere.center.x, sphere.center.y, sphere.center.z);
            // object.position.set(convex.boundingSphere.center);
            // object.position.set(convex.boundingSphere.center.x, convex.boundingSphere.center.y, convex.boundingSphere.center.z)
            allConvex.push(convex);
            scene.add(object);
            //box.objects.push(object);
            if (rate > 30) ;
            // setTimeout(randomGenAndPut);
        }
    //}


    return allConvex;
    // console.log("Box V: " + boxVolume);

    // return box;
}

function splitBoxTo12Tetrahedrons(box) {

    var tetrahedrons = [];
    var len = box.vertex3B.x - box.vertex3A.x;

    var randDown = function() {
        return function() {
            return randomBetween(0.6, 0.9);
        }
    };
    var randUp = function() {
        return function() {
            return randomBetween(1.1, 1.4);
        }
    };

    var vertices1 = [];
    vertices1.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y, box.vertex3A.z));
    vertices1.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z));
    vertices1.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len, box.vertex3A.z));
    vertices1.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len/2, box.vertex3A.z + len/2));

    var vertices2 = [];
    vertices2.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y, box.vertex3A.z));
    vertices2.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z));
    vertices2.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y, box.vertex3A.z));
    vertices2.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y, box.vertex3A.z + len/2));

    var vertices3 = [];
    vertices3.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y, box.vertex3A.z));
    vertices3.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices3.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y, box.vertex3A.z + len));
    vertices3.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y, box.vertex3A.z + len/2));

    var vertices4 = [];
    vertices4.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len, box.vertex3A.z));
    vertices4.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len, box.vertex3A.z));
    vertices4.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z));
    vertices4.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len, box.vertex3A.z + len/2));

    var vertices5 = [];
    vertices5.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y, box.vertex3A.z));
    vertices5.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len, box.vertex3A.z));
    vertices5.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z));
    vertices5.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len/2, box.vertex3A.z + len/2));

    var vertices6 = [];
    vertices6.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len, box.vertex3A.z));
    vertices6.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len, box.vertex3A.z + len));
    vertices6.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len, box.vertex3A.z + len/2));
    vertices6.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len/2, box.vertex3A.z + len/2));

    var vertices7 = [];
    vertices7.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y, box.vertex3A.z));
    vertices7.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices7.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y, box.vertex3A.z + len));
    vertices7.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y, box.vertex3A.z + len/2));

    var vertices8 = [];
    vertices8.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len, box.vertex3A.z + len));
    vertices8.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y, box.vertex3A.z + len));
    vertices8.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices8.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len));

    var vertices9 = [];
    vertices9.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y, box.vertex3A.z + len));
    vertices9.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y, box.vertex3A.z + len));
    vertices9.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y, box.vertex3A.z + len/2));
    vertices9.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len));

    var vertices10 = [];
    vertices10.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len, box.vertex3A.z + len));
    vertices10.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len, box.vertex3A.z + len));
    vertices10.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len, box.vertex3A.z + len/2));
    vertices10.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len));

    var vertices11 = [];
    vertices11.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len, box.vertex3A.z));
    vertices11.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len, box.vertex3A.z + len));
    vertices11.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len, box.vertex3A.z + len/2));
    vertices11.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len/2, box.vertex3A.z + len/2));

    var vertices12 = [];
    vertices12.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len, box.vertex3A.z + len));
    vertices12.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y, box.vertex3A.z + len));
    vertices12.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices12.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len));

    tetrahedrons.push(new THREE.ConvexGeometry(vertices1));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices2));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices3));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices4));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices5));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices6));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices7));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices8));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices9));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices10));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices11));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices12));

    return tetrahedrons;
}

function splitBoxTo4Hexahedron(box) {

    var hexahedron = [];
    var len = box.vertex3B.x - box.vertex3A.x;

    var randDown = function() {
        return function() {
            return randomBetween(0.6, 0.9);
        }
    };
    var randUp = function() {
        return function() {
            return randomBetween(1.1, 1.4);
        }
    };

    // Left
    var vertices1 = [];
    vertices1.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y, box.vertex3A.z));
    vertices1.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len, box.vertex3A.z));
    vertices1.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len, box.vertex3A.z));
    vertices1.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len, box.vertex3A.z + len));
    vertices1.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len/2));

    // right
    var vertices2 = [];
    vertices2.push(box.vertex3B.clone());
    vertices2.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len, box.vertex3A.z));
    vertices2.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len, box.vertex3A.z + len));
    vertices2.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y, box.vertex3A.z + len));
    vertices2.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len/2));

    // front
    var vertices3 = [];
    vertices3.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y, box.vertex3A.z));
    vertices3.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y, box.vertex3A.z));
    vertices3.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len, box.vertex3A.z));
    vertices3.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y, box.vertex3A.z + len));
    vertices3.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len/2));

    // back
    var vertices4 = [];
    vertices4.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y, box.vertex3A.z));
    vertices4.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y, box.vertex3A.z + len));
    vertices4.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len, box.vertex3A.z + len));
    vertices4.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y, box.vertex3A.z + len));
    vertices4.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len/2));

    hexahedron.push(new THREE.ConvexGeometry(vertices1));
    hexahedron.push(new THREE.ConvexGeometry(vertices2));
    hexahedron.push(new THREE.ConvexGeometry(vertices3));
    hexahedron.push(new THREE.ConvexGeometry(vertices4));

    return hexahedron;
}

function splitBoxTo5Tetrahedrons(box) {

    var tetrahedrons = [];
    var len = box.vertex3B.x - box.vertex3A.x;

    var randDown = function() {
        return function() {
            return randomBetween(0.6, 0.9);
        }
    };
    var randUp = function() {
        return function() {
            return randomBetween(1.1, 1.4);
        }
    };

    // Left
    var vertices1 = [];
    vertices1.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y, box.vertex3A.z));
    vertices1.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len, box.vertex3A.z));
    vertices1.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len, box.vertex3A.z));
    vertices1.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len, box.vertex3A.z + len));

    // right
    var vertices2 = [];
    vertices2.push(box.vertex3B.clone());
    vertices2.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len, box.vertex3A.z));
    vertices2.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len, box.vertex3A.z + len));
    vertices2.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y, box.vertex3A.z + len));

    // front
    var vertices3 = [];
    vertices3.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y, box.vertex3A.z));
    vertices3.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y, box.vertex3A.z));
    vertices3.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len, box.vertex3A.z));
    vertices3.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y, box.vertex3A.z + len));

    // back
    var vertices4 = [];
    vertices4.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y, box.vertex3A.z));
    vertices4.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y, box.vertex3A.z + len));
    vertices4.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len, box.vertex3A.z + len));
    vertices4.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y, box.vertex3A.z + len));

    // middle
    var vertices5 = [];
    vertices5.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y, box.vertex3A.z));
    vertices5.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len, box.vertex3A.z));
    vertices5.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len, box.vertex3A.z + len));
    vertices5.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y, box.vertex3A.z + len));

    tetrahedrons.push(new THREE.ConvexGeometry(vertices1));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices2));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices3));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices4));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices5));

    return tetrahedrons;
}

function randomGenAndPutInSubBox2() {

    var box = {
        vertex3A: new THREE.Vector3(0, 0, 0),
        vertex3B: new THREE.Vector3(150, 150, 150),
        objects: [],
        randomFunc: function(){}
    };
    var boxVolume = calcVolumeOfBox(box);

    var container = box;
    var containerVolume = boxVolume;

    //moveBox(box, 100, 100, 100);

    var minR = 5, maxR = 10;
    var minVertices = 4, maxVertices = 4;

    // Randomly generate outbound sphere for the convex polyhedron to be generated
    var subBoxes = [];
    var randomFuncs = [];
    var subStep = 50;
    var allConvex = [];
    var interectionCount = 0;


    for (var i = 0; i < container.vertex3B.x; i+=subStep) {

        for (var j = 0; j < container.vertex3B.x; j+=subStep) {

            for (var k = 0; k < container.vertex3B.x; k+=subStep) {

                var sub = {
                    vertex3A: new THREE.Vector3(i, j, k),
                    vertex3B: new THREE.Vector3(i + subStep, j + subStep, k + subStep)
                };

                randomFuncs.push(randomConvexNonIntersected(minR, maxR, minVertices, maxVertices, sub, randomSphereInBox));
                subBoxes.push(sub);
                allConvex.push.apply(allConvex, splitBoxTo5Tetrahedrons(sub));
            }
        }
    }

    // Randomize all convexs
    for (var i = 0; i < allConvex.length; i++) {

        var curr = allConvex[i];

        // Compute sphere
        curr.computeBoundingSphere();
        var sphere = curr.boundingSphere;
        var originX = sphere.center.x,
            originY = sphere.center.y,
            originZ = sphere.center.z;

        //move to origin
        var matrix = new THREE.Matrix4()
            .makeTranslation(-originX, -originY, -originZ);
        curr.applyMatrix(matrix);

        // scale
        var x = randomBetween(0.6, 1);
        var y = randomBetween(0.6, 1);
        var z = randomBetween(0.6, 1);

        //y = x, z = x;

        matrix = new THREE.Matrix4()
            .makeScale(x, y, z);
        curr.applyMatrix(matrix);

        // move back
        matrix = new THREE.Matrix4()
            .makeTranslation(originX, originY, originZ);
        curr.applyMatrix(matrix);


        curr.edges = extractEdges(curr.faces, 3);
        curr.computeBoundingSphere();
        //if (hasIntersection(allConvex, curr, areIntersectedPolyhedrons)) {
        //    console.log("Intersection count : " + (++interectionCount));
        //
        //    // move to origin
        //    var matrix = new THREE.Matrix4()
        //        .makeTranslation(-originX, -originY, -originZ);
        //    curr.applyMatrix(matrix);
        //
        //    matrix = new THREE.Matrix4()
        //        .makeScale(1/x, 1/y, 1/z);
        //    curr.applyMatrix(matrix);
        //
        //    // move back
        //    matrix = new THREE.Matrix4()
        //        .makeTranslation(originX, originY, originZ);
        //    curr.applyMatrix(matrix);
        //}

    }

    var ITER_COUNT = 100;

    for (var i = 0; i < allConvex.length; i++) {

        //var curr = allConvex[i].clone();
        var curr = allConvex[i];
        curr.edges = allConvex[i].edges;

        var sphere = allConvex[i].boundingSphere;
        var originX = sphere.center.x,
            originY = sphere.center.y,
            originZ = sphere.center.z;
        for (var j = 0; j < ITER_COUNT; j++) {
            // intersection happens
            var success = false;
            switch (THREE.Math.randInt(1, 3)) {
                case 1:
                    // try rotate the convex
                    var xa = randomBetween(-15, 15),
                        xb = randomBetween(-15, 15),
                        xc = randomBetween(-15, 15),
                        euler = new THREE.Euler(xa, xb, xc, 'XYZ'),

                        matrix = new THREE.Matrix4()
                            .makeTranslation(-originX, -originY, -originZ);
                    curr.applyMatrix(matrix);

                    matrix = new THREE.Matrix4()
                        .makeRotationFromEuler(euler)
                    curr.applyMatrix(matrix);

                    matrix = new THREE.Matrix4()
                        .makeTranslation(originX, originY, originZ);
                    curr.applyMatrix(matrix);

                    //if (hasIntersection(allConvex, curr, areIntersectedPolyhedrons)) {
                    //    console.log("Intersection count : " + (++interectionCount));
                    //    euler = new THREE.Euler(-xa, -xb, -xc, 'ZYX');
                    //
                    //    matrix = new THREE.Matrix4()
                    //        .makeTranslation(-originX, -originY, -originZ);
                    //    curr.applyMatrix(matrix);
                    //
                    //    matrix = new THREE.Matrix4()
                    //        .makeRotationFromEuler(euler)
                    //    curr.applyMatrix(matrix);
                    //
                    //    matrix = new THREE.Matrix4()
                    //        .makeTranslation(originX, originY, originZ);
                    //    curr.applyMatrix(matrix);
                    //    continue;
                    //} else {
                    //    success = true;
                    //}
                    break;

                case 2:
                case 3:
                    // try transform
                    var xt = randomBetween(-15, 15),
                        yt = randomBetween(-15, 15),
                        zt = randomBetween(-15, 15),


                    matrix = new THREE.Matrix4().makeTranslation(xt, yt, zt);
                    curr.applyMatrix(matrix);
                    var out = isPolyhedronOutOfBox(container, curr);
                    var inter = hasIntersection(allConvex, curr, areIntersectedPolyhedrons);
                    if (!out && !inter) {

                        success = true;
                    } else {
                        console.log("Intersection count : " + (++interectionCount));
                        success = false;
                        matrix = new THREE.Matrix4().makeTranslation(-xt, -yt, -zt);
                        curr.applyMatrix(matrix);
                    }
                    break;


                default:
                    break;
            }

            if (success) break;
        }


    }

    return allConvex;

    // Output
    for (var i = 0; i < allConvex.length; i++) {

        var materials = [
            new THREE.MeshLambertMaterial({ambient: Math.random() * 16777215}),
            new THREE.MeshBasicMaterial({
                color: Math.random() * 16777215,
                wireframe: true,
                transparent: true,
                opacity: 1
            })
        ];


        var convex = allConvex[i];
        if (convex == undefined) continue;
        var volume = calculate(convex);
        //if (volume < 20) continue;
        totalVolume += volume;
        rate = (totalVolume / containerVolume) * 100
        // console.log("Vertices: " + JSON.stringify(convex.vertices));
        // console.log("Current: " + volume);
        // console.log("Total: " + totalVolume);
        // console.log("containerVolume: " + containerVolume);
        console.log("Rate: " + rate);
        console.log("Intersection count : " +interectionCount);
        var object = THREE.SceneUtils.createMultiMaterialObject(convex, materials);
        // object.position.set(sphere.center.x, sphere.center.y, sphere.center.z);
        // object.position.set(convex.boundingSphere.center);
        // object.position.set(convex.boundingSphere.center.x, convex.boundingSphere.center.y, convex.boundingSphere.center.z)
        scene.add(object);
        //box.objects.push(object);
        if (rate > 30) ;
        // setTimeout(randomGenAndPut);
    }

}

var allConvex = [];

function initBoxScene(options) {

    var edge_len = options.container.options.edge_len;
    var thickness = 11;


    // Ground
    ground = new Physijs.BoxMesh(
        new THREE.BoxGeometry(edge_len + thickness*2, thickness, edge_len + thickness*2),
        //new THREE.PlaneGeometry(50, 50),
        ground_material,
        0 // mass
    );
    ground.position.x = edge_len / 2;
    ground.position.y = -Math.ceil(thickness/2);
    ground.position.z = edge_len / 2;

    box_volume = Math.pow(edge_len, 3);

    ground.receiveShadow = true;
    scene.add( ground );
    scene.position.set(0, 0, 0);

    // Bumpers
    var bumper,
        bumper_geom = new THREE.BoxGeometry(thickness, edge_len + thickness*2, edge_len + thickness*2);

    // Back left
    bumper = new Physijs.BoxMesh( bumper_geom, ground_material, 0, { restitution: .2 } );
    bumper.position.y = edge_len/2;
    bumper.position.x = -Math.ceil(thickness/2);
    bumper.position.z = edge_len/2;
    bumper.receiveShadow = true;
    bumper.castShadow = true;
    scene.add( bumper );

    // Front right
    bumper = new Physijs.BoxMesh( bumper_geom, wall_material, 0, { restitution: .2 } );
    bumper.position.y = edge_len/2;
    bumper.position.x = edge_len + Math.ceil(thickness/2);
    bumper.position.z = edge_len/2;
    bumper.receiveShadow = true;
    bumper.castShadow = true;
    scene.add( bumper );

    // Back right
    bumper = new Physijs.BoxMesh( bumper_geom, ground_material, 0, { restitution: .2 } );
    bumper.position.y = edge_len/2;
    bumper.position.x = edge_len/2;
    bumper.position.z = -Math.ceil(thickness/2);
    bumper.rotation.y = Math.PI / 2;
    bumper.receiveShadow = true;
    bumper.castShadow = true;
    scene.add( bumper );

    // Front left
    bumper = new Physijs.BoxMesh( bumper_geom, wall_material, 0, { restitution: .2 } );
    bumper.position.y = edge_len/2;
    bumper.position.x = edge_len/2;
    bumper.position.z = edge_len + Math.ceil(thickness/2);
    bumper.rotation.y = Math.PI / 2;
    bumper.receiveShadow = true;
    bumper.castShadow = true;
    scene.add( bumper );

    // Top
    bumper = new Physijs.BoxMesh( bumper_geom, wall_material, 0, { restitution: .2 } );
    bumper.position.y = edge_len + Math.ceil(thickness/2);
    bumper.position.x = edge_len/2;
    bumper.position.z = edge_len/2;
    bumper.rotation.z = Math.PI / 2;
    bumper.receiveShadow = true;
    bumper.castShadow = true;
    scene.add( bumper );

}
function randomGenAndPutInSubBox3(options) {

    var edge_len = options.container.options.edge_len;
    var thickness = 11;
    var minR = options.polyhedron.radius.min,
        maxR = options.polyhedron.radius.max;
    var minVertices = 4, maxVertices = 4;

    var box = {
        vertex3A: new THREE.Vector3(0, 0, 0),
        vertex3B: new THREE.Vector3(edge_len, edge_len, edge_len),
        objects: [],
        randomFunc: function(){}
    };
    var boxVolume = calcVolumeOfBox(box);

    var container = box;
    var containerVolume = boxVolume;

    //moveBox(box, 100, 100, 100);


    // Randomly generate outbound sphere for the convex polyhedron to be generated
    var subBoxes = [];
    var randomFuncs = [];
    var subStep = 30;
    var interectionCount = 0;


    for (var i = 0; i < container.vertex3B.x; i+=subStep) {

        for (var j = 0; j < container.vertex3B.x; j+=subStep) {

            for (var k = 0; k < container.vertex3B.x; k+=subStep) {

                var sub = {
                    vertex3A: new THREE.Vector3(i, j, k),
                    vertex3B: new THREE.Vector3(i + subStep, j + subStep, k + subStep)
                };

                randomFuncs.push(randomConvexNonIntersected(minR, maxR, minVertices, maxVertices, sub, randomSphereInBox));
                subBoxes.push(sub);
                switch (THREE.Math.randInt(0, 3)) {
                    case 0:
                        allConvex.push.apply(allConvex, splitBoxTo5Tetrahedrons(sub));
                        break;
                    case 1:
                        allConvex.push.apply(allConvex, splitBoxTo12Tetrahedrons(sub));
                        break;
                    case 2:
                        allConvex.push.apply(allConvex, splitBoxTo4Hexahedron(sub));
                        break;
                    case 3:
                        break;

                }
            }
        }
    }

    // Randomize all convexs
    for (var i = 0; i < allConvex.length; i++) {

        var curr = allConvex[i];

        // Compute sphere
        curr.computeBoundingSphere();
        var sphere = curr.boundingSphere;
        var originX = sphere.center.x,
            originY = sphere.center.y,
            originZ = sphere.center.z;

        //move to origin
        var matrix = new THREE.Matrix4()
            .makeTranslation(-originX, -originY, -originZ);
        curr.applyMatrix(matrix);

        // scale
        var x = randomBetween(0.7, 0.9);
        var y = randomBetween(0.7, 0.9);
        var z = randomBetween(0.7, 0.9);

        //y = x, z = x;

        matrix = new THREE.Matrix4()
            .makeScale(x, y, z);
        curr.applyMatrix(matrix);

        // move back
        matrix = new THREE.Matrix4()
            .makeTranslation(originX, originY, originZ);
        curr.applyMatrix(matrix);


        curr.edges = extractEdges(curr.faces, 3);
        curr.computeBoundingSphere();
        //if (hasIntersection(allConvex, curr, areIntersectedPolyhedrons)) {
        //    console.log("Intersection count : " + (++interectionCount));
        //
        //    // move to origin
        //    var matrix = new THREE.Matrix4()
        //        .makeTranslation(-originX, -originY, -originZ);
        //    curr.applyMatrix(matrix);
        //
        //    matrix = new THREE.Matrix4()
        //        .makeScale(1/x, 1/y, 1/z);
        //    curr.applyMatrix(matrix);
        //
        //    // move back
        //    matrix = new THREE.Matrix4()
        //        .makeTranslation(originX, originY, originZ);
        //    curr.applyMatrix(matrix);
        //}

    }

    var ITER_COUNT = 100;

    for (var i = 0; i < allConvex.length; i++) {

        //var curr = allConvex[i].clone();
        var curr = allConvex[i];
        curr.edges = allConvex[i].edges;

        var sphere = allConvex[i].boundingSphere;
        var originX = sphere.center.x,
            originY = sphere.center.y,
            originZ = sphere.center.z;
        for (var j = 0; j < ITER_COUNT; j++) {
            // intersection happens
            var success = false;
            switch (THREE.Math.randInt(1, 2)) {
                case 1:
                    // try rotate the convex
                    var xa = randomBetween(-15, 15),
                        xb = randomBetween(-15, 15),
                        xc = randomBetween(-15, 15),
                        euler = new THREE.Euler(xa, xb, xc, 'XYZ'),

                        matrix = new THREE.Matrix4()
                            .makeTranslation(-originX, -originY, -originZ);
                    curr.applyMatrix(matrix);

                    matrix = new THREE.Matrix4()
                        .makeRotationFromEuler(euler)
                    curr.applyMatrix(matrix);

                    matrix = new THREE.Matrix4()
                        .makeTranslation(originX, originY, originZ);
                    curr.applyMatrix(matrix);

                    //if (hasIntersection(allConvex, curr, areIntersectedPolyhedrons)) {
                    //    console.log("Intersection count : " + (++interectionCount));
                    //    euler = new THREE.Euler(-xa, -xb, -xc, 'ZYX');
                    //
                    //    matrix = new THREE.Matrix4()
                    //        .makeTranslation(-originX, -originY, -originZ);
                    //    curr.applyMatrix(matrix);
                    //
                    //    matrix = new THREE.Matrix4()
                    //        .makeRotationFromEuler(euler)
                    //    curr.applyMatrix(matrix);
                    //
                    //    matrix = new THREE.Matrix4()
                    //        .makeTranslation(originX, originY, originZ);
                    //    curr.applyMatrix(matrix);
                    //    continue;
                    //} else {
                    //    success = true;
                    //}
                    break;

                case 2:
                    // try transform
                    var xt = randomBetween(-15, 15),
                        yt = randomBetween(-15, 15),
                        zt = randomBetween(-15, 15),


                        matrix = new THREE.Matrix4().makeTranslation(xt, yt, zt);
                    curr.applyMatrix(matrix);
                    var out = isPolyhedronOutOfBox(container, curr);
                    var inter = hasIntersection(allConvex, curr, areIntersectedPolyhedrons);
                    if (!out && !inter) {

                        success = true;
                    } else {
                        console.log("Intersection count : " + (++interectionCount));
                        success = false;
                        matrix = new THREE.Matrix4().makeTranslation(-xt, -yt, -zt);
                        curr.applyMatrix(matrix);
                    }
                    break;


                default:
                    break;
            }

            if (success) break;
        }


    }

    // Output
    for (var i = 0; i < allConvex.length; i++) {

        var materials = [
            new THREE.MeshLambertMaterial({ambient: Math.random() * 16777215}),
            new THREE.MeshBasicMaterial({
                color: Math.random() * 16777215,
                wireframe: true,
                transparent: true,
                opacity: 1
            })
        ];


        var convex = allConvex[i];
        if (convex == undefined) continue;
        var volume = calculate(convex);
        //if (volume < 20) continue;
        totalVolume += volume;
        rate = (totalVolume / containerVolume) * 100
        // console.log("Vertices: " + JSON.stringify(convex.vertices));
        // console.log("Current: " + volume);
        // console.log("Total: " + totalVolume);
        // console.log("containerVolume: " + containerVolume);
        console.log("Rate: " + rate);
        console.log("Intersection count : " +interectionCount);
        //var object = THREE.SceneUtils.createMultiMaterialObject(convex, materials);
        var shape = new Physijs.ConvexMesh(
            allConvex[i],
            materials[0]
        );

        shape.addEventListener('collision', function(other_object, linear_velocity) {
            var _vector = new THREE.Vector3;
            _vector.set( 0, 0, 0 );
            this.setAngularFactor( _vector );
            this.setAngularVelocity( _vector );
            this.setLinearFactor( _vector );
            this.setLinearVelocity( _vector );
        });
        scene.add(shape);
    }

    var interval = 4000;
    var g = 60;
    //setTimeout(function() {
    //
    //    scene.setGravity(new THREE.Vector3( 0, g, 0 ));
    //    setTimeout(function() {
    //        scene.setGravity(new THREE.Vector3( -g, 0, 0 ));
    //        setTimeout(function() {
    //            scene.setGravity(new THREE.Vector3(g, 0, 0));
    //            setTimeout(function() {
    //                scene.setGravity(new THREE.Vector3( 0, 0, -g ));
    //                setTimeout(function() {
    //                    scene.setGravity(new THREE.Vector3( 0, 0, g ));
    //                }, interval);
    //            }, interval);
    //        }, interval);
    //    }, interval);
    //}, interval);


}

function initCylinderScene(options) {

    var radius = options.container.options.radius;
    var height = options.container.options.height + 2;
    var path_dist = 0;
    var thickness = 11;
    var segments = 36;

    // Ground
    ground = new Physijs.BoxMesh(
        new THREE.BoxGeometry(radius * 2 + thickness, thickness, radius * 2 + thickness),
        //new THREE.PlaneGeometry(50, 50),
        ground_material,
        0 // mass
    );
    ground.position.x = radius;
    ground.position.y = 0;
    ground.position.z = radius;

    ground.receiveShadow = true;
    scene.add( ground );
    scene.position.set(0, 0, 0);

    // Bumpers
    var CustomSinCurve = THREE.Curve.create(
        function ( scale ) { //custom curve constructor
            this.scale = (scale === undefined) ? 1 : scale;
        },

        function ( t ) { //getPoint: t is between 0-1
            var tx = Math.cos(2 * Math.PI * t),
                ty = 0,
                tz = Math.sin(2 * Math.PI * t);

            return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
        }
    );

    var path = new THREE.LineCurve3( new THREE.Vector3(path_dist, 0, path_dist), new THREE.Vector3(path_dist, height, path_dist) );

    var bumper,
        bumper_geom = new THREE.BoxGeometry(1, height, Math.PI * radius * radius / segments);


    // Wall
    for (var i = 0; i < segments; i++) {
        bumper = new Physijs.BoxMesh(
            bumper_geom,
            wall_material,
            //ground_material,
            0 // mass

        );
        var grad = 2 * i * Math.PI / segments;
        bumper.position.x = radius + radius * Math.cos(grad);
        bumper.position.y = radius;
        bumper.position.z = radius + radius * Math.sin(grad);
        bumper.rotation.y = -grad;
        scene.add(bumper);
    }

    // Top

    bumper_geom = new THREE.CylinderGeometry(radius, radius, thickness, segments);
    bumper = new Physijs.CylinderMesh( bumper_geom, wall_material, 0, { restitution: .2 } );
    bumper.position.y = height + 6;
    bumper.position.x = radius;
    bumper.position.z = radius;
    //bumper.rotation.z = Math.PI / 2;
    bumper.receiveShadow = true;
    bumper.castShadow = true;
    scene.add( bumper );

}
function randomGenAndPutInCylinder(options) {

    var cylinder_geometry = new THREE.CylinderGeometry(75, 75, 150, 32);
    var cylinder = new THREE.Mesh(cylinder_geometry);
    var cylinderVolume = calcVolumeOfCylinder(cylinder_geometry);

    var box_len = 1.414 * cylinder_geometry.parameters.radiusTop;
    var box_origin = (1 - Math.sqrt(2)/2) * cylinder_geometry.parameters.radiusTop;
    var box_height = cylinder_geometry.parameters.height;
    var box = {
        vertex3A: new THREE.Vector3(box_origin, 0, box_origin),
        vertex3B: new THREE.Vector3(box_len, box_height, box_len),
        randomFunc: function(){}
    };

    var boxVolume = calcVolumeOfBox(box);

    var container = box;
    var containerVolume = cylinderVolume;


    var minR = 5, maxR = 10;
    var minVertices = 4, maxVertices = 4;

    var subBoxes = [];
    var randomFuncs = [];
    var subStep = 30;
    var interectionCount = 0;


    for (var i = box.vertex3A.x; i < container.vertex3B.x; i+=subStep) {

        for (var j = box.vertex3A.y; j < container.vertex3B.y; j+=subStep) {

            for (var k = box.vertex3A.z; k < container.vertex3B.z; k+=subStep) {

                var sub = {
                    vertex3A: new THREE.Vector3(i, j, k),
                    vertex3B: new THREE.Vector3(i + subStep, j + subStep, k + subStep)
                };

                randomFuncs.push(randomConvexNonIntersected(minR, maxR, minVertices, maxVertices, sub, randomSphereInBox));
                subBoxes.push(sub);
                switch (THREE.Math.randInt(0, 0)) {
                    case 0:
                        allConvex.push.apply(allConvex, splitBoxTo5Tetrahedrons(sub));
                        break;
                    case 1:
                        allConvex.push.apply(allConvex, splitBoxTo12Tetrahedrons(sub));
                        break;
                    case 2:
                        allConvex.push.apply(allConvex, splitBoxTo4Hexahedron(sub));
                        break;
                    case 3:
                        break;

                }
            }
        }
    }

    // Randomize all convexs
    for (var i = 0; i < allConvex.length; i++) {

        var curr = allConvex[i];

        // Compute sphere
        curr.computeBoundingSphere();
        var sphere = curr.boundingSphere;
        var originX = sphere.center.x,
            originY = sphere.center.y,
            originZ = sphere.center.z;

        //move to origin
        var matrix = new THREE.Matrix4()
            .makeTranslation(-originX, -originY, -originZ);
        //curr.applyMatrix(matrix);

        // scale
        var x = randomBetween(0.7, 0.9);
        var y = randomBetween(0.7, 0.9);
        var z = randomBetween(0.7, 0.9);

        //y = x, z = x;

        matrix = new THREE.Matrix4()
            .makeScale(x, y, z);
        //curr.applyMatrix(matrix);

        // move back
        matrix = new THREE.Matrix4()
            .makeTranslation(originX, originY, originZ);
        //curr.applyMatrix(matrix);


        curr.edges = extractEdges(curr.faces, 3);
        curr.computeBoundingSphere();
        //if (hasIntersection(allConvex, curr, areIntersectedPolyhedrons)) {
        //    console.log("Intersection count : " + (++interectionCount));
        //
        //    // move to origin
        //    var matrix = new THREE.Matrix4()
        //        .makeTranslation(-originX, -originY, -originZ);
        //    curr.applyMatrix(matrix);
        //
        //    matrix = new THREE.Matrix4()
        //        .makeScale(1/x, 1/y, 1/z);
        //    curr.applyMatrix(matrix);
        //
        //    // move back
        //    matrix = new THREE.Matrix4()
        //        .makeTranslation(originX, originY, originZ);
        //    curr.applyMatrix(matrix);
        //}

    }

    var ITER_COUNT = 100;

    for (var i = 0; i < allConvex.length; i++) {

        //var curr = allConvex[i].clone();
        var curr = allConvex[i];
        curr.edges = allConvex[i].edges;

        var sphere = allConvex[i].boundingSphere;
        var originX = sphere.center.x,
            originY = sphere.center.y,
            originZ = sphere.center.z;
        for (var j = 0; j < ITER_COUNT; j++) {
            // intersection happens
            var success = false;
            switch (THREE.Math.randInt(0, 0)) {
                case 1:
                    // try rotate the convex
                    var xa = randomBetween(-15, 15),
                        xb = randomBetween(-15, 15),
                        xc = randomBetween(-15, 15),
                        euler = new THREE.Euler(xa, xb, xc, 'XYZ'),

                        matrix = new THREE.Matrix4()
                            .makeTranslation(-originX, -originY, -originZ);
                    curr.applyMatrix(matrix);

                    matrix = new THREE.Matrix4()
                        .makeRotationFromEuler(euler)
                    curr.applyMatrix(matrix);

                    matrix = new THREE.Matrix4()
                        .makeTranslation(originX, originY, originZ);
                    curr.applyMatrix(matrix);

                    //if (hasIntersection(allConvex, curr, areIntersectedPolyhedrons)) {
                    //    console.log("Intersection count : " + (++interectionCount));
                    //    euler = new THREE.Euler(-xa, -xb, -xc, 'ZYX');
                    //
                    //    matrix = new THREE.Matrix4()
                    //        .makeTranslation(-originX, -originY, -originZ);
                    //    curr.applyMatrix(matrix);
                    //
                    //    matrix = new THREE.Matrix4()
                    //        .makeRotationFromEuler(euler)
                    //    curr.applyMatrix(matrix);
                    //
                    //    matrix = new THREE.Matrix4()
                    //        .makeTranslation(originX, originY, originZ);
                    //    curr.applyMatrix(matrix);
                    //    continue;
                    //} else {
                    //    success = true;
                    //}
                    break;

                case 2:
                    // try transform
                    var xt = randomBetween(-15, 15),
                        yt = randomBetween(-15, 15),
                        zt = randomBetween(-15, 15),


                        matrix = new THREE.Matrix4().makeTranslation(xt, yt, zt);
                    curr.applyMatrix(matrix);
                    var out = isPolyhedronOutOfBox(container, curr);
                    var inter = hasIntersection(allConvex, curr, areIntersectedPolyhedrons);
                    if (!out && !inter) {

                        success = true;
                    } else {
                        console.log("Intersection count : " + (++interectionCount));
                        success = false;
                        matrix = new THREE.Matrix4().makeTranslation(-xt, -yt, -zt);
                        curr.applyMatrix(matrix);
                    }
                    break;


                default:
                    break;
            }

            if (success) break;
        }


    }

    // Output
    for (var i = 0; i < allConvex.length; i++) {

        var materials = [
            new THREE.MeshLambertMaterial({ambient: Math.random() * 16777215}),
            new THREE.MeshBasicMaterial({
                color: Math.random() * 16777215,
                wireframe: true,
                transparent: true,
                opacity: 1
            })
        ];


        var convex = allConvex[i];
        if (convex == undefined) continue;
        var volume = calculate(convex);
        //if (volume < 20) continue;
        totalVolume += volume;
        rate = (totalVolume / containerVolume) * 100
        // console.log("Vertices: " + JSON.stringify(convex.vertices));
        // console.log("Current: " + volume);
        // console.log("Total: " + totalVolume);
        // console.log("containerVolume: " + containerVolume);
        console.log("Rate: " + rate);
        console.log("Intersection count : " +interectionCount);
        //var object = THREE.SceneUtils.createMultiMaterialObject(convex, materials);
        var shape = new Physijs.ConvexMesh(
            allConvex[i],
            materials[0]
        );

        shape.addEventListener('collision', function(other_object, linear_velocity) {
            var _vector = new THREE.Vector3;
            _vector.set( 0, 0, 0 );
            this.setAngularFactor( _vector );
            this.setAngularVelocity( _vector );
            this.setLinearFactor( _vector );
            this.setLinearVelocity( _vector );
        });
        scene.add(shape);
    }

    var interval = 4000;
    var g = 60;
    //setTimeout(function() {
    //
    //    scene.setGravity(new THREE.Vector3( 0, g, 0 ));
    //    setTimeout(function() {
    //        scene.setGravity(new THREE.Vector3( -g, 0, 0 ));
    //        setTimeout(function() {
    //            scene.setGravity(new THREE.Vector3(g, 0, 0));
    //            setTimeout(function() {
    //                scene.setGravity(new THREE.Vector3( 0, 0, -g ));
    //                setTimeout(function() {
    //                    scene.setGravity(new THREE.Vector3( 0, 0, g ));
    //                }, interval);
    //            }, interval);
    //        }, interval);
    //    }, interval);
    //}, interval);


}
