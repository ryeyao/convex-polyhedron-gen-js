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

    return {radius: radius, centre3: centre};
}

function randomSphereInCylinder(minR, maxR, cylinder) {
    var radius = randomBetween(minR, maxR);
    var innerCylinder = new THREE.CylinderGeometry(cylinder.parameters.radiusTop - radius, cylinder.parameters.radiusBottom - radius, cylinder.parameters.height - radius*2, 32);
    var centre = randomPointInCylinder(innerCylinder);
    return {radius: radius, centre3: centre};
}

function randomSphereNonIntersected(minR, maxR, container, randomSphereFunc) {

    var spheres = [];
    var len_old = 0;
    var intersectionCount = 0;
    var MAX_ITER_COUNT = 10;

    return function () {
        for (var i = 0; i < MAX_ITER_COUNT; i++) {
            var sphere = randomSphereFunc(minR, maxR, container);
            if (spheres.length > 0 && hasIntersection(spheres, sphere)) {
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

    var containerVolume = cylinderVolume;

    //moveBox(box, 100, 100, 100);

    var minR = 5, maxR = 30;
    var minVertices = 4, maxVertices = 4;
    // var randomSphere = randomSphereNonIntersected(minR, maxR, cylinder_geometry, randomSphereInCylinder);
    var randomSphere = randomSphereNonIntersected(minR, maxR, box, randomSphereInBox);



    // for (var i = 0; i < 100000; i++) {
    while(true) {
        var materials = [
            //new THREE.MeshLambertMaterial( { ambient: 0xff0000}),//, map: map } ),
            new THREE.MeshLambertMaterial({ambient: Math.random() * 16777215}),
            new THREE.MeshBasicMaterial({color: Math.random() * 16777215, wireframe: true, transparent: true, opacity: 1})
        ];
        // for (var i = 0; i < 1000; i++) {
        var sphere;
        while (true) {
            sphere = randomSphere();
            if (sphere == undefined) break;
            if (sphere == "Overflow") return;
            break;
        }
        if (sphere == undefined) continue;
        // totalVolume += calcVolumeOfSphere(sphere);

        var convex = randomConvexInSphere(minVertices, maxVertices, sphere);
        var volume = calculate(convex);
        if (volume < 1) continue;
        totalVolume += volume;
        rate = (totalVolume / containerVolume) * 100
        // console.log("Vertices: " + JSON.stringify(convex.vertices));
        console.log("Current: " + volume);
        console.log("Total: " + totalVolume);
        console.log("containerVolume: " + containerVolume);
        console.log("Rate: " + rate);
        var object = THREE.SceneUtils.createMultiMaterialObject(convex, materials);
        object.position.set(sphere.centre3.x, sphere.centre3.y, sphere.centre3.z);
        scene.add(object);
        box.objects.push(object);
        if (rate > 30) ;
        // setTimeout(randomGenAndPut);

    }

    // console.log("Box V: " + boxVolume);

    // return box;
}
