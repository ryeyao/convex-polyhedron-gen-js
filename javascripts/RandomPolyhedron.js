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

function movePolyhedron(polyhedron, deltaX, deltaY, deltaZ) {
    movePoints(polyhedron.vertices, deltaX, deltaY, deltaZ);
}

function movePolyhedronByVector(polyhedron, deltaVector3) {
    movePolyhedron(polyhedron, deltaVector3.x, deltaVector3.y, deltaVector3.z);

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
    var radius = cylinder.parameters.radiusTop;
    if (point.distanceTo(new THREE.Vector3(radius, point.y, radius)) > radius
        || point.y < 0 || point.y > cylinder.parameters.height) {
        return true;
    }
    return false;
}

function areOneOfPointsOutOfCylinder(cylinder, points) {
    for (var i = 0; i < points.length; i++) {
        if (isPointOutOfCylinder(cylinder, points[i])) {
            return true;
        }
    }

    return false;
}

function isPolyhedronOutOfCylinder(cylinder, polyhedron) {
    return areOneOfPointsOutOfCylinder(cylinder, polyhedron.vertices);
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

    // Check distance
    //polyhedronA.computeMinMax();
    //polyhedronB.computeMinMax();

    if (polyhedronA.maxX < polyhedronB.minX || polyhedronA.minX > polyhedronB.maxX
        || polyhedronA.maxY < polyhedronB.minY || polyhedronA.minY > polyhedronB.maxY
        || polyhedronA.maxZ < polyhedronB.minZ || polyhedronA.minZ > polyhedronB.maxZ) {
        return false;
    }

    // Check bounding sphere first
    polyhedronA.computeBoundingSphere();
    polyhedronB.computeBoundingSphere();
    if (!areIntersectedSpheres(polyhedronA.boundingSphere, polyhedronB.boundingSphere)) {
        return false;
    }

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

    var point = new THREE.Vector3(x, y, z);
    movePoint3ByVector(point, cylinder.center_bottom);
    return point;
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
    //var centre = randomPointInBox(innerBox);
    var centre = randomPointInBox(box);

    return {radius: radius, center: centre};
}

function randomSphereInCylinder(minR, maxR, cylinder) {
    var radius = randomBetween(minR, maxR);
    var innerCylinder = new THREE.CylinderGeometry(cylinder.parameters.radiusTop - radius, cylinder.parameters.radiusBottom - radius, cylinder.parameters.height - radius*2, 32);
    innerCylinder.center_bottom = cylinder.center_bottom;
    //var centre = randomPointInCylinder(innerCylinder);
    var centre = randomPointInCylinder(cylinder);
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
function scanConvexNonIntersected(minR, maxR, minSlenderness, maxSlenderness, container, randomSphereFunc, allpolyhedrons, step) {
    // make container geometry

    var polyhedrons = [];
    if (allpolyhedrons != undefined) {
        polyhedrons = allpolyhedrons;
    }
    var len_old = 0;
    var intersectionCount = 0;
    var MAX_ITER_COUNT = 1;
    var MAX_TRY_COUNT = 5;
    var min_scale = minR;

    if (step == undefined) {
        step = 1;
    }

    if (container.vertex3A == undefined) {

        return function () {
            for (var l = 0; l < container.parameters.height; l+=step) {
                for (var m = 0; m < container.parameters.radiusTop; m+=step) {
                    for (var n = 0; n < 360; n+=step) {
                        console.log(l + ":" + m + ":" + n);
                        var sphere = randomSphereFunc(minR, maxR, container);
                        sphere.center.x = m * Math.cos(n / (2 * Math.PI));
                        sphere.center.y = l;
                        sphere.center.z = m * Math.sin(n / (2 * Math.PI));
                        var convex;
                        var needRegenerate = true;
                        for (var j = 0; j < MAX_TRY_COUNT; j++) {


                            if (needRegenerate) {
                                convex = getBaseTetrahedronInSphere(sphere);
                                if (randomBetween(0, 1) < 0.5) {
                                    convex.vertices.push(randomPointInSphere(sphere));
                                    convex = new THREE.ConvexGeometry(convex.vertices);
                                }
                                convex.computeMinMax();

                            }
                            if (convex.slendernessRatio < minSlenderness || convex.slendernessRatio > maxSlenderness) {
                                // ignore it
                                needRegenerate = true;
                                continue;
                            }
                            convex.edges = extractEdges(convex.faces, 3);

                            if (isPolyhedronOutOfCylinder(container, convex)) {
                                needRegenerate = true;
                                continue;
                            } else {
                                needRegenerate = false;
                            }

                            if (polyhedrons.length > 0 && hasIntersection(polyhedrons, convex, areIntersectedPolyhedrons)) {

                                // intersection happens
                                switch (THREE.Math.randInt(1, 1)) {
                                    case 1:
                                        // try scale the sphere
                                        sphere.radius *= randomBetween(min_scale, sphere.radius);
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
                                            .makeRotationFromEuler(euler);
                                        convex.applyMatrix(matrix);

                                        matrix = new THREE.Matrix4()
                                            .makeTranslation(sphere.center.x, sphere.center.y, sphere.center.z);
                                        convex.applyMatrix(matrix);
                                        needRegenerate = false;
                                        break;

                                    case 3:
                                        // try translate
                                        var xt = randomBetween(-10, 10),
                                            yt = randomBetween(-10, 10),
                                            zt = randomBetween(-10, 10),

                                            matrix = new THREE.Matrix4().makeTranslation(xt, yt, zt);
                                        convex.applyMatrix(matrix);
                                        if (isPolyhedronOutOfCylinder(container, convex)) {
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
                            } else {

                            }

                            // convex.boundingSphere = sphere;

                            polyhedrons.push(convex);

                            if (polyhedrons.length < len_old) {
                                console.log('Stack Overflow. Terminated.');
                                return "Overflow";
                            }
                            //console.log('Non-intersected polyhedrons: ' + polyhedrons.length);

                            len_old = polyhedrons.length;
                            break;
                        }

                    }
                }
            }
        }
    } else {
        return function () {
            for (var l = 0; l < container.vertex3B.x; l+=step) {
                for (var m = 0; m < container.vertex3B.y; m+=step) {
                    for (var n = 0; n < container.vertex3B.z; n+=step) {
                        console.log(l + ":" + m + ":" + n);
                        var sphere = randomSphereFunc(minR, maxR, container);
                        sphere.center.x = l;
                        sphere.center.y = m;
                        sphere.center.z = n;
                        // var convex = randomConvexInSphere(minVertices, maxVertices, sphere);
                        var convex;
                        var needRegenerate = true;
                        for (var j = 0; j < MAX_TRY_COUNT; j++) {


                            if (needRegenerate) {
                                convex = getBaseTetrahedronInSphere(sphere);
                                if (randomBetween(0, 1) < 0.5) {
                                    convex.vertices.push(randomPointInSphere(sphere));
                                    convex = new THREE.ConvexGeometry(convex.vertices);
                                }
                                convex.computeMinMax();

                            }
                            if (convex.slendernessRatio < minSlenderness || convex.slendernessRatio > maxSlenderness) {
                                // ignore it
                                needRegenerate = true;
                                continue;
                            }
                            convex.edges = extractEdges(convex.faces, 3);

                            if (isPolyhedronOutOfBox(container, convex)) {
                                needRegenerate = true;
                                continue;
                            } else {
                                needRegenerate = false;
                            }

                            if (polyhedrons.length > 0 && hasIntersection(polyhedrons, convex, areIntersectedPolyhedrons)) {

                                // intersection happens
                                switch (THREE.Math.randInt(1, 1)) {
                                    case 1:
                                        // try scale the sphere
                                        sphere.radius *= randomBetween(min_scale, sphere.radius);
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
                                            .makeRotationFromEuler(euler);
                                        convex.applyMatrix(matrix);

                                        matrix = new THREE.Matrix4()
                                            .makeTranslation(sphere.center.x, sphere.center.y, sphere.center.z);
                                        convex.applyMatrix(matrix);
                                        needRegenerate = false;
                                        break;

                                    case 3:
                                        // try translate
                                        var xt = randomBetween(-10, 10),
                                            yt = randomBetween(-10, 10),
                                            zt = randomBetween(-10, 10),

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
                            } else {

                            }

                            // convex.boundingSphere = sphere;

                            polyhedrons.push(convex);

                            if (polyhedrons.length < len_old) {
                                console.log('Stack Overflow. Terminated.');
                                return "Overflow";
                            }
                            //console.log('Non-intersected polyhedrons: ' + polyhedrons.length);

                            len_old = polyhedrons.length;
                            //return convex;
                            break;
                        }

                    }
                }
            }
        }
    }
}

function randomConvexNonIntersectedWithOpts(options, container, randomSphereFunc, allpolyhedrons) {
    // make container geometry
    var minSlenderness = options.polyhedron.slenderness_ratio.min,
        maxSlenderness = options.polyhedron.slenderness_ratio.max;
    var edge_len = options.container.options.edge_len;
    var radius = options.container.options.radius,
        height = options.container.options.height;
    var minVertices = 4, maxVertices = 4;

    var cumulative_ratio = 0;
    var ratioes = [];

    for (var i = 0; i < options.polyhedrons.length; i++) {
        cumulative_ratio += options.polyhedrons[i].ratio;
        ratioes.push(cumulative_ratio);
    }
    if (cumulative_ratio != 1) {
        console.log("Warning: Cumulative ratio(" + cumulative_ratio + ") is not 1");
    }

    var polyhedrons = [];
    if (allpolyhedrons != undefined) {
        polyhedrons = allpolyhedrons;
    }
    var len_old = 0;
    var intersectionCount = 0;
    var MAX_ITER_COUNT = 10;
    var MAX_TRY_COUNT = 1;
    var min_scale = 0.5;

    return function () {
        for (var i = 0; i < MAX_ITER_COUNT; i++) {
            // Decide which to choose.
            var rand = Math.random();

            var sphere;
            var minR, maxR, radius;
            for (var r = 0; r < ratioes.length; r++) {
                if (rand <= ratioes[r]) {
                    minR = options.polyhedrons[r].radius.min;
                    maxR = options.polyhedrons[r].radius.max;
                    radius = maxR;
                    break;
                }
            }

            //sphere = randomSphereFunc(minR, maxR, container);
            sphere = randomSphereFunc(radius, radius, container);
            MAX_TRY_COUNT = maxR - minR;

            if (sphere == undefined) {
                var minR = options.polyhedrons[0].radius.min;
                var maxR = options.polyhedrons[0].radius.max;
                sphere = randomSphereFunc(minR, maxR, container);
            }

            // var convex = randomConvexInSphere(minVertices, maxVertices, sphere);
            var convex;
            var needRegenerate = true;
            for (var j = 0; j < MAX_TRY_COUNT; j++) {


                if (needRegenerate) {
                    if (sphere.radius < minR) {
                        continue;
                    }
                    convex = getBaseTetrahedronInSphere(sphere);
                    if (randomBetween(0, 1) < 0.5) {
                        convex.vertices.push(randomPointInSphere(sphere));
                        convex = new THREE.ConvexGeometry(convex.vertices);
                    }
                    convex.computeMinMax();
                }
                if (convex.slendernessRatio < minSlenderness || convex.slendernessRatio > maxSlenderness) {
                    // ignore it
                    needRegenerate = true;
                    continue;
                }
                convex.edges = extractEdges(convex.faces, 3);

                if (container.vertex3A == undefined) {
                    if (isPolyhedronOutOfCylinder(container, convex)) {
                        needRegenerate = true;
                        continue;
                    } else {
                        needRegenerate = false;
                    }
                } else {
                    if (isPolyhedronOutOfBox(container, convex)) {
                        needRegenerate = true;
                        continue;
                    } else {
                        needRegenerate = false;
                    }
                }

                if (polyhedrons.length > 0 && hasIntersection(polyhedrons, convex, areIntersectedPolyhedrons)) {

                    // intersection happens
                    switch (THREE.Math.randInt(1, 1)) {
                        case 1:
                            // try scale the sphere
                            //sphere.radius *= randomBetween(min_scale, sphere.radius);
                            sphere.radius -= 1;
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
                                .makeRotationFromEuler(euler);
                            convex.applyMatrix(matrix);

                            matrix = new THREE.Matrix4()
                                .makeTranslation(sphere.center.x, sphere.center.y, sphere.center.z);
                            convex.applyMatrix(matrix);
                            needRegenerate = false;
                            break;

                        case 3:
                            // try translate
                            var xt = randomBetween(-10, 10),
                                yt = randomBetween(-10, 10),
                                zt = randomBetween(-10, 10),

                                matrix = new THREE.Matrix4().makeTranslation(xt, yt, zt);
                            convex.applyMatrix(matrix);
                            if (container.vertex3A == undefined) {

                                if (isPolyhedronOutOfCylinder(container, convex)) {
                                    needRegenerate = true;
                                } else {
                                    needRegenerate = false;
                                }
                            } else {

                                if (isPolyhedronOutOfBox(container, convex)) {
                                    needRegenerate = true;
                                } else {
                                    needRegenerate = false;
                                }
                            }
                            break;

                        default:
                            break;
                    }
                    intersectionCount++;
                    continue;
                } else {

                }

                // convex.boundingSphere = sphere;

                convex.radius_level = r;
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

function randomConvexNonIntersected(minR, maxR, minSlenderness, maxSlenderness, container, randomSphereFunc, allpolyhedrons) {
    // make container geometry

    var polyhedrons = [];
    if (allpolyhedrons != undefined) {
        polyhedrons = allpolyhedrons;
    }
    var len_old = 0;
    var intersectionCount = 0;
    var MAX_ITER_COUNT = 10;
    var MAX_TRY_COUNT = 1;
    var min_scale = 0.5;

    return function () {
        for (var i = 0; i < MAX_ITER_COUNT; i++) {
            var sphere = randomSphereFunc(minR, maxR, container);
            // var convex = randomConvexInSphere(minVertices, maxVertices, sphere);
            var convex;
            var needRegenerate = true;
            for (var j = 0; j < MAX_TRY_COUNT; j++) {


                if (needRegenerate) {
                    convex = getBaseTetrahedronInSphere(sphere);
                    if (randomBetween(0, 1) < 0.5) {
                        convex.vertices.push(randomPointInSphere(sphere));
                        convex = new THREE.ConvexGeometry(convex.vertices);
                    }
                    convex.computeMinMax();
                }
                if (convex.slendernessRatio < minSlenderness || convex.slendernessRatio > maxSlenderness) {
                    // ignore it
                    needRegenerate = true;
                    continue;
                }
                convex.edges = extractEdges(convex.faces, 3);

                if (container.vertex3A == undefined) {
                    if (isPolyhedronOutOfCylinder(container, convex)) {
                        needRegenerate = true;
                        continue;
                    } else {
                        needRegenerate = false;
                    }
                } else {
                    if (isPolyhedronOutOfBox(container, convex)) {
                        needRegenerate = true;
                        continue;
                    } else {
                        needRegenerate = false;
                    }
                }

                if (polyhedrons.length > 0 && hasIntersection(polyhedrons, convex, areIntersectedPolyhedrons)) {

                    // intersection happens
                    switch (THREE.Math.randInt(1, 1)) {
                        case 1:
                            // try scale the sphere
                            sphere.radius *= randomBetween(min_scale, sphere.radius);
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
                                .makeRotationFromEuler(euler);
                            convex.applyMatrix(matrix);

                            matrix = new THREE.Matrix4()
                                .makeTranslation(sphere.center.x, sphere.center.y, sphere.center.z);
                            convex.applyMatrix(matrix);
                            needRegenerate = false;
                            break;

                        case 3:
                            // try translate
                            var xt = randomBetween(-10, 10),
                                yt = randomBetween(-10, 10),
                                zt = randomBetween(-10, 10),

                                matrix = new THREE.Matrix4().makeTranslation(xt, yt, zt);
                            convex.applyMatrix(matrix);
                            if (container.vertex3A == undefined) {

                                if (isPolyhedronOutOfCylinder(container, convex)) {
                                    needRegenerate = true;
                                } else {
                                    needRegenerate = false;
                                }
                            } else {

                                if (isPolyhedronOutOfBox(container, convex)) {
                                    needRegenerate = true;
                                } else {
                                    needRegenerate = false;
                                }
                            }
                            break;

                        default:
                            break;
                    }
                    intersectionCount++;
                    continue;
                } else {

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
        if (shape === shapes[i]) {
            continue;
        }
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
    // random rotation

    var originX = sphere.center.x,
        originY = sphere.center.y,
        originZ = sphere.center.z;

    var xa = randomBetween(-15, 15),
        xb = randomBetween(-15, 15),
        xc = randomBetween(-15, 15),
        euler = new THREE.Euler(xa, xb, xc, 'XYZ'),

        matrix = new THREE.Matrix4()
            .makeTranslation(-originX, -originY, -originZ);
    tetrahedron.applyMatrix(matrix);

    matrix = new THREE.Matrix4()
        .makeRotationFromEuler(euler)
    tetrahedron.applyMatrix(matrix);

    matrix = new THREE.Matrix4()
        .makeTranslation(originX, originY, originZ);
    tetrahedron.applyMatrix(matrix);
    return tetrahedron;
}

function randomGenAndPutForCylinder(options) {
    var minR = options.polyhedron.radius.min,
        maxR = options.polyhedron.radius.max;
    var minSlenderness = options.polyhedron.slenderness_ratio.min,
        maxSlenderness = options.polyhedron.slenderness_ratio.max;
    var edge_len = options.container.options.edge_len;
    var radius = options.container.options.radius,
        height = options.container.options.height;
    var minVertices = 4, maxVertices = 4;

    var polys = [];

    var box = {
        vertex3A: new THREE.Vector3(0, 0, 0),
        vertex3B: new THREE.Vector3(edge_len, edge_len, edge_len),
        objects: []
    };
    var boxVolume = calcVolumeOfBox(box);

    var cylinder_geometry = new THREE.CylinderGeometry(radius, radius, height, 36);
    var cylinder = new THREE.Mesh(cylinder_geometry);
    var cylinderVolume = calcVolumeOfCylinder(cylinder_geometry);
    // scene.add(cylinder);

    var container = box;
    var containerVolume = boxVolume;

    //moveBox(box, 100, 100, 100);


    // Randomly generate outbound sphere for the convex polyhedron to be generated

    // var randomSphere = randomSphereNonIntersected(minR, maxR, cylinder_geometry, randomSphereInCylinder);
    // var randomSphere = randomSphereNonIntersected(minR, maxR, box, randomSphereInBox);
    var randomConvex = randomConvexNonIntersected(minR, maxR, minSlenderness, maxSlenderness, container, randomSphereInCylinder, allConvex);


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
        rate = (totalVolume / containerVolume) * 100;
        // console.log("Vertices: " + JSON.stringify(convex.vertices));
        // console.log("Current: " + volume);
        // console.log("Total: " + totalVolume);
        // console.log("containerVolume: " + containerVolume);
        //console.log("Rate: " + rate);
        var object = THREE.SceneUtils.createMultiMaterialObject(convex, materials);
        polys.push(convex);
        allConvex.push(convex);
        // object.position.set(sphere.center.x, sphere.center.y, sphere.center.z);
        // object.position.set(convex.boundingSphere.center);
        // object.position.set(convex.boundingSphere.center.x, convex.boundingSphere.center.y, convex.boundingSphere.center.z)
        //scene.add(object);
        //box.objects.push(object);
        if (rate > 30) ;
        // setTimeout(randomGenAndPut);

    }

    // console.log("Box V: " + boxVolume);

    // return box;
    return polys;
}
function randomGenAndPut(options) {
    //var minR = options.polyhedron.radius.min,
    //    maxR = options.polyhedron.radius.max;
    var minSlenderness = options.polyhedron.slenderness_ratio.min,
        maxSlenderness = options.polyhedron.slenderness_ratio.max;
    // Box only
    var edge_len = options.container.options.edge_len;
    var edge_height = options.container.options.edge_height;
    var edge_width = options.container.options.edge_width;

    // Cylinder only
    var radius = options.container.options.radius,
        height = options.container.options.height;


    var type = options.container.type;
    var random_tier_count = options.random_iter_count;
    var step = options.scan_step;


    var minVertices = 4, maxVertices = 4;

    var polys = [];

    var box = {
        vertex3A: new THREE.Vector3(0, 0, 0),
        vertex3B: new THREE.Vector3(edge_len, edge_height, edge_width),
        objects: []
    };
    var boxVolume = calcVolumeOfBox(box);

    var cylinder_geometry = new THREE.CylinderGeometry(radius, radius, height, 36);
    var cylinder = new THREE.Mesh(cylinder_geometry);
    var cylinderVolume = calcVolumeOfCylinder(cylinder_geometry);

    var _totalVolume = 0, _rate = 0;

    var container;
    var randomConvex;
    var containerVolume;
    if (type == "cylinder") {
        container = cylinder_geometry;
        containerVolume = cylinderVolume;;

        var box_origin = (1 - Math.sqrt(2)/2) * radius;
        var box_height = height;
        var box_len = Math.sqrt(2) * radius;
        var box_inner = {
            vertex3A: new THREE.Vector3(box_origin, 0, box_origin),
            vertex3B: new THREE.Vector3(box_origin + box_len, box_height, box_origin + box_len),
            randomFunc: function(){}
        };
        container.center_bottom = new THREE.Vector3(radius, 0, radius);
        //randomConvex = randomConvexNonIntersected(minR, maxR, minSlenderness, maxSlenderness, container, randomSphereInCylinder, allConvex, step);
        //randomConvex = scanConvexNonIntersected(minR, maxR, minSlenderness, maxSlenderness, container, randomSphereInCylinder, allConvex, step);
        randomConvex = randomConvexNonIntersectedWithOpts(options, container, randomSphereInCylinder, allConvex);
    } else {
        container = box;
        containerVolume = boxVolume;
        //randomConvex = randomConvexNonIntersected(minR, maxR, minSlenderness, maxSlenderness, container, randomSphereInBox, allConvex);
        //randomConvex = scanConvexNonIntersected(minR, maxR, minSlenderness, maxSlenderness, container, randomSphereInBox, allConvex, step);
        randomConvex = randomConvexNonIntersectedWithOpts(options, container, randomSphereInBox, allConvex);
    }

    //moveBox(box, 100, 100, 100);


    // Randomly generate outbound sphere for the convex polyhedron to be generated

    // var randomSphere = randomSphereNonIntersected(minR, maxR, cylinder_geometry, randomSphereInCylinder);
    // var randomSphere = randomSphereNonIntersected(minR, maxR, box, randomSphereInBox);


    // Generate polyhedrons forever
    for (var i = 0; i < random_tier_count; i++) {
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
        //if (volume < 20) continue;
        _totalVolume += volume;
        _rate = (_totalVolume / containerVolume) * 100;
        // console.log("Vertices: " + JSON.stringify(convex.vertices));
        // console.log("Current: " + volume);
        // console.log("Total: " + totalVolume);
        // console.log("containerVolume: " + containerVolume);
        //console.log("_Rate: " + _rate);
        var object = THREE.SceneUtils.createMultiMaterialObject(convex, materials);
        polys.push(convex);

        // object.position.set(sphere.center.x, sphere.center.y, sphere.center.z);
        // object.position.set(convex.boundingSphere.center);
        // object.position.set(convex.boundingSphere.center.x, convex.boundingSphere.center.y, convex.boundingSphere.center.z)
        //scene.add(object);
        //box.objects.push(object);
        if (_rate > 30) ;
        // setTimeout(randomGenAndPut);

    }

    // console.log("Box V: " + boxVolume);

    // return box;
    return polys;
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

function splitBoxTo28Tetrahedrons(box) {

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






    var vertices13 = [];
    vertices13.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len, box.vertex3A.z));
    vertices13.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len, box.vertex3A.z + len/2));
    vertices13.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z));
    vertices13.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len/2, box.vertex3A.z + len/2));

    var vertices14 = [];
    vertices14.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len, box.vertex3A.z));
    vertices14.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len, box.vertex3A.z + len/2));
    vertices14.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len));
    vertices14.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len/2, box.vertex3A.z + len/2));

    var vertices15 = [];
    vertices15.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len, box.vertex3A.z + len));
    vertices15.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len, box.vertex3A.z + len/2));
    vertices15.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices15.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len));

    var vertices16 = [];
    vertices16.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len, box.vertex3A.z + len));
    vertices16.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len, box.vertex3A.z + len/2));
    vertices16.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices16.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len));

    var vertices17 = [];
    vertices17.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y, box.vertex3A.z));
    vertices17.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y, box.vertex3A.z + len/2));
    vertices17.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices17.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z));

    var vertices18 = [];
    vertices18.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y, box.vertex3A.z));
    vertices18.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y, box.vertex3A.z + len/2));
    vertices18.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z));
    vertices18.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len/2, box.vertex3A.z + len/2));

    var vertices19 = [];
    vertices19.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y, box.vertex3A.z + len));
    vertices19.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y, box.vertex3A.z + len/2));
    vertices19.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices19.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len));

    var vertices20 = [];
    vertices20.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y, box.vertex3A.z + len));
    vertices20.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y, box.vertex3A.z + len/2));
    vertices20.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices20.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len));




    var vertices21 = [];
    vertices21.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices21.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices21.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z));
    vertices21.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len, box.vertex3A.z + len/2));

    var vertices22 = [];
    vertices22.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices22.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z));
    vertices22.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices22.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len, box.vertex3A.z + len/2));

    var vertices23 = [];
    vertices23.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices23.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices23.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len));
    vertices23.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len, box.vertex3A.z + len/2));

    var vertices24 = [];
    vertices24.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices24.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len));
    vertices24.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices24.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len, box.vertex3A.z + len/2));

    var vertices25 = [];
    vertices25.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices25.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices25.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z));
    vertices25.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y, box.vertex3A.z + len/2));

    var vertices26 = [];
    vertices26.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices26.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z));
    vertices26.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices26.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y, box.vertex3A.z + len/2));

    var vertices27 = [];
    vertices27.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices27.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices27.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len));
    vertices27.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y, box.vertex3A.z + len/2));

    var vertices28 = [];
    vertices28.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices28.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y + len/2, box.vertex3A.z + len));
    vertices28.push(new THREE.Vector3(box.vertex3A.x, box.vertex3A.y + len/2, box.vertex3A.z + len/2));
    vertices28.push(new THREE.Vector3(box.vertex3A.x + len/2, box.vertex3A.y, box.vertex3A.z + len/2));

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
    tetrahedrons.push(new THREE.ConvexGeometry(vertices13));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices14));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices15));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices16));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices17));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices18));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices19));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices20));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices21));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices22));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices23));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices24));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices25));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices26));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices27));
    tetrahedrons.push(new THREE.ConvexGeometry(vertices28));

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
    vertices2.push(new THREE.Vector3(box.vertex3A.x + len, box.vertex3A.y + len, box.vertex3A.z + len));
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

    //// try rotate the convex
    //var xa = 0,
    //    xb = randomBetween(-15, 15),
    //    xc = 0,
    //    euler = new THREE.Euler(xa, xb, xc, 'XYZ'),
    //
    //    matrix = new THREE.Matrix4()
    //        .makeTranslation(-originX, -originY, -originZ);
    //
    //for (var i = 0; i < tetrahedrons.length; i++) {
    //    var curr = tetrahedrons[i];
    //
    //    curr.computeBoundingSphere();
    //    var originX = box.vertex3A.x + len/2,
    //        originY = box.vertex3A.y + len/2,
    //        originZ = box.vertex3A.z + len/2;
    //
    //    //move to origin
    //    var matrix = new THREE.Matrix4()
    //        .makeTranslation(-originX, -originY, -originZ);
    //    curr.applyMatrix(matrix);
    //
    //    // rotate
    //    matrix = new THREE.Matrix4()
    //        .makeRotationFromEuler(euler)
    //    curr.applyMatrix(matrix);
    //
    //    // move back
    //    matrix = new THREE.Matrix4()
    //        .makeTranslation(originX, originY, originZ);
    //    curr.applyMatrix(matrix);
    //}


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
                    // try translate
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

function randomGenAndPutInSubBox3(options) {

    var edge_len = options.container.options.edge_len;
    var thickness = 11;
    var minR = options.polyhedron.radius.min,
        maxR = options.polyhedron.radius.max;
    var minVertices = 4, maxVertices = 4;

    var minSlenderness = options.polyhedron.slenderness_ratio.min,
        maxSlenderness = options.polyhedron.slenderness_ratio.max;

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
    var randomFuncs = [];
    var subStep = Math.ceil(edge_len / randomBetween(minR * 2, maxR));
    var interectionCount = 0;
    var randomize = true;
    var polys = [];



    function splitBox(container, subStep) {
        var spolys = [];
        var c_edge_len = container.vertex3B.x - container.vertex3A.x;

        if (c_edge_len <= Math.floor(minR)) {
            return spolys;
        }
        //var subBoxes = [];
        // Iter through sub boxes

        var xitercount = Math.floor((container.vertex3B.x - container.vertex3A.x) / subStep),
            yitercount = Math.floor((container.vertex3B.y - container.vertex3A.y) / subStep),
            zitercount = Math.floor((container.vertex3B.z - container.vertex3A.z) / subStep);

        for (var i = 0; i < xitercount; i++) {

            for (var j = 0; j < yitercount; j++) {

                for (var k = 0; k < zitercount; k++) {

                    var sub = {
                        vertex3A: new THREE.Vector3(container.vertex3A.x + i * subStep, container.vertex3A.y + j * subStep, container.vertex3A.z + k * subStep),
                        vertex3B: new THREE.Vector3(container.vertex3A.x + (i + 1) * subStep, container.vertex3A.y + (j + 1) * subStep, container.vertex3A.z + (k + 1) * subStep)
                    };
                    var sub_edge_len = sub.vertex3B.x - sub.vertex3A.x;

                    //randomFuncs.push(randomConvexNonIntersected(minR, maxR, minVertices, maxVertices, sub, randomSphereInBox));
                    //subBoxes.push(sub);
                    //
                    switch (THREE.Math.randInt(0, 5)) {
                        //switch ((i * k * j) % 3) {
                        case 0:
                            //if (sub_edge_len > Math.ceil(maxR)) {
                            //    spolys.push.apply(spolys, splitBox(sub, subStep));
                            //
                            //} else {
                                spolys.push.apply(spolys, splitBoxTo5Tetrahedrons(sub));
                            //}
                            break;
                        case 1:
                            //if (sub_edge_len > Math.ceil(maxR)) {
                            //    spolys.push.apply(spolys, splitBox(sub, subStep));
                            //
                            //} else {
                                spolys.push.apply(spolys, splitBoxTo28Tetrahedrons(sub));
                            //}
                            break;
                        case 2:
                            //if (sub_edge_len > Math.ceil(maxR)) {
                            //    spolys.push.apply(spolys, splitBox(sub, subStep));
                            //
                            //} else {
                                spolys.push.apply(spolys, splitBoxTo4Hexahedron(sub));
                            //}
                            break;
                        default :
                            break;

                    }
                }
            }
        }

        return spolys;
    }
    polys.push.apply(polys, splitBox(container, subStep));


        // Randomize all convexs
        for (var i = 0; i < polys.length; i++) {

            var curr = polys[i];

            if (curr.slendernessRatio < minSlenderness || curr.slendernessRatio > maxSlenderness) {
                // remove it
                polys.splice(i, 1);
                i--;
                continue;
            }

            // Compute sphere
            curr.computeBoundingSphere();
            var sphere = curr.boundingSphere;
            var originX = sphere.center.x,
                originY = sphere.center.y,
                originZ = sphere.center.z;

            if (randomize) {
                //move to origin
                var matrix = new THREE.Matrix4()
                    .makeTranslation(-originX, -originY, -originZ);
                curr.applyMatrix(matrix);

                // scale
                var x = randomBetween(0.8, 1);
                var y = randomBetween(0.8, 1);
                var z = randomBetween(0.8, 1);

                //y = x, z = x;

                matrix = new THREE.Matrix4()
                    .makeScale(x, y, z);
                curr.applyMatrix(matrix);

                // move back
                matrix = new THREE.Matrix4()
                    .makeTranslation(originX, originY, originZ);
                curr.applyMatrix(matrix);
            }


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

        var ITER_COUNT = 10;

        for (var i = 0; i < polys.length; i++) {

            //var curr = allConvex[i].clone();
            var curr = polys[i];
            curr.edges = polys[i].edges;

            var sphere = polys[i].boundingSphere;
            var originX = sphere.center.x,
                originY = sphere.center.y,
                originZ = sphere.center.z;
            for (var j = 0; j < ITER_COUNT; j++) {
                // intersection happens
                var success = false;
                var choice = THREE.Math.randInt(1, 2);
                if (!randomize) {
                    choice = 3;
                }
                switch (choice) {
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

                        if (hasIntersection(allConvex, curr, areIntersectedPolyhedrons)) {
                            console.log("Intersection count : " + (++interectionCount));
                            euler = new THREE.Euler(-xa, -xb, -xc, 'ZYX');

                            matrix = new THREE.Matrix4()
                                .makeTranslation(-originX, -originY, -originZ);
                            curr.applyMatrix(matrix);

                            matrix = new THREE.Matrix4()
                                .makeRotationFromEuler(euler)
                            curr.applyMatrix(matrix);

                            matrix = new THREE.Matrix4()
                                .makeTranslation(originX, originY, originZ);
                            curr.applyMatrix(matrix);
                            continue;
                        } else {
                            success = true;
                        }
                        break;

                    case 2:
                        // try translate
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
                            //console.log("Intersection count : " + (++interectionCount));
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

    allConvex.push.apply(allConvex, polys);
    return polys;

}



function randomGenAndPutInCylinder(options) {

    var radius = options.container.options.radius;
    var height = options.container.options.height + 2;
    var path_dist = 0;
    var thickness = 11;
    var segments = 36;
    var minSlenderness = options.polyhedron.slenderness_ratio.min,
        maxSlenderness = options.polyhedron.slenderness_ratio.max;

    var polys = [];

    var cylinder_geometry = new THREE.CylinderGeometry(radius, radius, height, segments);
    //var cylinder = new THREE.Mesh(cylinder_geometry);
    var cylinderVolume = calcVolumeOfCylinder(cylinder_geometry);

    var box_len = Math.sqrt(2) * radius;
    var box_origin = (1 - Math.sqrt(2)/2) * radius;
    var box_height = height;
    var box = {
        vertex3A: new THREE.Vector3(box_origin, 0, box_origin),
        vertex3B: new THREE.Vector3(box_origin + box_len, box_height, box_origin + box_len),
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

    // Iter through sub boxes
    var xitercount = Math.floor((container.vertex3B.x - container.vertex3A.x) / subStep),
        yitercount = Math.floor((container.vertex3B.y - container.vertex3A.y) / subStep),
        zitercount = Math.floor((container.vertex3B.z - container.vertex3A.z) / subStep);

    for (var i = 0; i < xitercount; i++) {

        for (var j = 0; j < yitercount; j++) {

            for (var k = 0; k < zitercount; k++) {

                var sub = {
                    vertex3A: new THREE.Vector3(container.vertex3A.x + i * subStep, container.vertex3A.y + j * subStep, container.vertex3A.z + k * subStep),
                    vertex3B: new THREE.Vector3(container.vertex3A.x + (i + 1) * subStep, container.vertex3A.y + (j + 1) * subStep, container.vertex3A.z + (k + 1) * subStep)
                };

                randomFuncs.push(randomConvexNonIntersected(minR, maxR, minVertices, maxVertices, sub, randomSphereInBox));
                subBoxes.push(sub);
                switch (THREE.Math.randInt(0, 2)) {
                    case 0:
                        polys.push.apply(polys, splitBoxTo5Tetrahedrons(sub));
                        break;
                    case 1:
                        polys.push.apply(polys, splitBoxTo28Tetrahedrons(sub));
                        break;
                    case 2:
                        polys.push.apply(polys, splitBoxTo4Hexahedron(sub));
                        break;
                    case 3:
                        break;

                }
            }
        }
    }

    // Randomize all convexs
    for (var i = 0; i < polys.length; i++) {

        var curr = polys[i];
        if (curr.slendernessRatio < minSlenderness || curr.slendernessRatio > maxSlenderness) {
            // remove it
            polys.splice(i, 1);
            i--;
            continue;
        }

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
        var x = randomBetween(0.9, 1);
        var y = randomBetween(0.9, 1);
        var z = randomBetween(0.9, 1);

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

    for (var i = 0; i < polys.length; i++) {

        //var curr = allConvex[i].clone();
        var curr = polys[i];
        curr.edges = polys[i].edges;

        var sphere = polys[i].boundingSphere;
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
                    // try translate
                    var xt = randomBetween(-15, 15),
                        yt = randomBetween(-15, 15),
                        zt = randomBetween(-15, 15),


                        matrix = new THREE.Matrix4().makeTranslation(xt, yt, zt);
                    curr.applyMatrix(matrix);
                    var out = isPolyhedronOutOfCylinder(cylinder_geometry, curr);
                    var inter = hasIntersection(allConvex, curr, areIntersectedPolyhedrons);
                    if (!out && !inter) {

                        success = true;
                    } else {
                        //console.log("Intersection count : " + (++interectionCount));
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

    allConvex.push.apply(allConvex, polys);
    return polys;

    //// Output
    //for (var i = 0; i < allConvex.length; i++) {
    //
    //    var materials = [
    //        new THREE.MeshLambertMaterial({ambient: Math.random() * 16777215}),
    //        new THREE.MeshBasicMaterial({
    //            color: Math.random() * 16777215,
    //            wireframe: true,
    //            transparent: true,
    //            opacity: 1
    //        })
    //    ];
    //
    //
    //    var convex = allConvex[i];
    //    if (convex == undefined) continue;
    //    var volume = calculate(convex);
    //    //if (volume < 20) continue;
    //    totalVolume += volume;
    //    rate = (totalVolume / containerVolume) * 100
    //    // console.log("Vertices: " + JSON.stringify(convex.vertices));
    //    // console.log("Current: " + volume);
    //    // console.log("Total: " + totalVolume);
    //    // console.log("containerVolume: " + containerVolume);
    //    //console.log("Rate: " + rate);
    //    //console.log("Intersection count : " +interectionCount);
    //    //var object = THREE.SceneUtils.createMultiMaterialObject(convex, materials);
    //    var shape = new Physijs.ConvexMesh(
    //        allConvex[i],
    //        materials[0]
    //    );
    //
    //    //shape.addEventListener('collision', function(other_object, linear_velocity) {
    //    //    var _vector = new THREE.Vector3;
    //    //    _vector.set( 0, 0, 0 );
    //    //    this.setAngularFactor( _vector );
    //    //    this.setAngularVelocity( _vector );
    //    //    this.setLinearFactor( _vector );
    //    //    this.setLinearVelocity( _vector );
    //    //});
    //    scene.add(shape);
    //    console.log("Rate: " + rate);
    //}
    //
    //var interval = 4000;
    //var g = 60;
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
