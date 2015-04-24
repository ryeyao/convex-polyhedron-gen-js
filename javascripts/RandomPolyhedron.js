/**
 *
 * Created by rye on 11/22/14.
 */

/*

 sphere : {
 radius : 0,
 centre3 : THREE.vector3(0, 0, 0)
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

function movePoint3ByVector(point, deltaVector3) {
    movePoint3(point, deltaVector3.x, deltaVector3.y, deltaVector3.z);
}


function areIntersectedSphere(sphereA, sphereB) {

    var dist = sphereA.centre3.distanceTo(sphereB.centre3);
    return sphereA.radius + sphereB.radius > dist;
}

function randomPoint3(minX, maxX, minY, maxY, minZ, maxZ) {
    return new THREE.Vector3(randomBetween(minX, maxX), randomBetween(minY, maxY), randomBetween(minZ, maxZ));
}

function randomPointInBox(box) {
    return randomPoint3(box.vertex3A.x, box.vertex3B.x, box.vertex3A.y, box.vertex3B.y, box.vertex3A.z, box.vertex3B.z);
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

    return {radius: radius, centre3: centre};
}

function randomSphereInBoxNonIntersected(minR, maxR, box) {

    var spheres = [];
    var intersectionCount = 0;
    var MAX_ITER_COUNT = 1000;

    return function () {
        for (var i = 0; i < MAX_ITER_COUNT; i++) {
            var sphere = randomSphereInBox(minR, maxR, box);
            if (spheres.length > 0 && hasIntersection(spheres, sphere)) {
                intersectionCount++;
                // console.log(intersectionCount + ' intersection detected.');
                continue;
            }

            spheres.push(sphere);
            // console.log('Non-intersected spheres: ' + spheres.length);
            return sphere;
        }
    }

}

function hasIntersection(spheres, sphere) {
    for (var i in spheres) {
        if (areIntersectedSphere(sphere, spheres[i])) {
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

    //movePoint3ByVector(point, sphere.centre3);

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

function randomGenAndPut() {

    var box = {
        vertex3A: new THREE.Vector3(0, 0, 0),
        vertex3B: new THREE.Vector3(500, 500, 500),
        objects: []
    };

    //moveBox(box, 100, 100, 100);

    var minR = 20, maxR = 30;
    var minVertices = 4, maxVertices = 30;
    var randomSphere = randomSphereInBoxNonIntersected(minR, maxR, box);

    for (var i = 0; i < 100; i++) {
        var materials = [
            //new THREE.MeshLambertMaterial( { ambient: 0xff0000}),//, map: map } ),
            new THREE.MeshLambertMaterial({ambient: Math.random() * 16777215}),
            new THREE.MeshBasicMaterial({color: Math.random() * 16777215, wireframe: true, transparent: true, opacity: 1})
        ];
        var sphere = randomSphere();
        var convex = randomConvexInSphere(minVertices, maxVertices, sphere);
        var object = THREE.SceneUtils.createMultiMaterialObject(convex, materials);
        object.position.set(sphere.centre3.x, sphere.centre3.y, sphere.centre3.z);
        scene.add(object);
        box.objects.push(object);
    }

    return box;
}
