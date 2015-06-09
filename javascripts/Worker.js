/**
 * Created by rye on 15-6-9.
 */

var ipc = require('ipc');
function work(scene) {
    var opt_path = ipc.sendSync('options', 'options');
    var options;
    console.log(opt_path);

    readFile('../' + opt_path, function (opt) {

        options = opt;
        var containerVolume = 0;
//			console.log(JSON.stringify(options));
        options = JSON.parse(options);
        var type = options.container.type;
        var use_engine = false || options.enable_simulation;
        var show_window = false || options.show_window;
        var recurCount = options.simulation_iter_count;
        var translate_iter_count = options.translate_iter_count;
        var simulation_interval = options.simulation_interval;
        var high_volume_ratio = options.high_volume_ratio;
        // Box only
        var edge_len = options.container.options.edge_len;
        var edge_height = options.container.options.edge_height;
        var edge_width = options.container.options.edge_width;

        // Cylinder only
        var radius = options.container.options.radius;
        var height = options.container.options.height;


        // Disable
        use_engine = false;
        high_volume_ratio = false;

        var box = {
            vertex3A: new THREE.Vector3(0, 0, 0),
            vertex3B: new THREE.Vector3(edge_len, edge_height, edge_width)
        };
        var boxVolume = calcVolumeOfBox(box);

        var cylinder_geometry = new THREE.CylinderGeometry(radius, radius, height, 36);
        var cylinder = new THREE.Mesh(cylinder_geometry);
        var cylinderVolume = calcVolumeOfCylinder(cylinder_geometry);

        var randomFunc, initFunc, container;

        if (type == "cylinder") {
            container = cylinder_geometry;
            containerVolume = calcVolumeOfCylinder(new THREE.CylinderGeometry(options.container.options.radius, options.container.options.radius, options.container.options.height));
            initFunc = initCylinderSceneThreejs;
            //requestAnimationFrame(render);
//				scene.simulate();
            randomFunc = randomGenAndPut;
            initFunc(options);

            if (high_volume_ratio) {
                output2Phisijs(randomGenAndPutInCylinder(options), containerVolume, use_engine);
            }
        } else {
            container = box;
            containerVolume = calcVolumeOfBox({
                vertex3A: new THREE.Vector3(0, 0, 0),
                vertex3B: new THREE.Vector3(edge_len, edge_height, edge_width)
            });
            initFunc = initBoxSceneThreejs;
            //requestAnimationFrame(render);
//				scene.simulate();
//				randomGenAndPutInSubBox3(options);
            randomFunc = randomGenAndPut;
            initFunc(options);
            if (high_volume_ratio) {
                output2Phisijs(randomGenAndPutInSubBox3(options), containerVolume, use_engine);
            }
        }


//			if (options.container.type == "cylinder") {
//
//			} else {
//				randomGenAndPut(options);
//				output2Phisijs(containerVolume);
//			}

        var mainFunc = function () {

            isPaused = true;

            console.log("Iter: " + recurCount);
            output2Phisijs(randomFunc(options), scene, containerVolume, options);
            recurCount--;
            // Get current geometries
            if (use_engine) {
                for (var i = 0; i < scene.children.length; i++) {
                    var curr = scene.children[i].geometry;
                    if (curr instanceof THREE.ConvexGeometry) {
                        var curr_matrix = scene.children[i].matrix;

                        curr.applyMatrix(curr_matrix);
//							if (type == "cylinder") {
//								if (isPolyhedronOutOfCylinder(cylinder_geometry, curr)) {
//									scene.children[i] = scene.children[scene.children.length - 1];
//									scene.children.pop();
//									allConvex[allConvex.indexOf(curr)] = allConvex[allConvex.length - 1];
//									allConvex.pop();
////									scene.children.splice(i, 1);
////									allConvex.splice(allConvex.indexOf(curr), 1);
//									i--;
//								}
//							} else {
//								if (isPolyhedronOutOfBox(box, curr)) {
//									scene.children[i] = scene.children[scene.children.length - 1];
//									scene.children.pop();
//									allConvex[allConvex.indexOf(curr)] = allConvex[allConvex.length - 1];
//									allConvex.pop();
////									scene.children.splice(i, 1);
////									allConvex.splice(allConvex.indexOf(curr), 1);
//									i--;
//								}
//							}
                    }
                }
            }

//				return function () {
            if (recurCount > 0) {
//						initFunc(options);
//						console.log("RecurCount: " + recurCount);
                scene.setGravity(new THREE.Vector3(randomBetween(-10, 10), randomBetween(-10, 10), randomBetween(-10, 10)));
                setTimeout(mainFunc, simulation_interval);
                unpauseSimulation();
            } else {
                output2Phisijs(randomFunc(options), scene, containerVolume, scene);
                writeResult2();
            }
//				}

        };

        function writeResult2() {

            var vols = 0;
            var rt = 0;

            var result = "";
            for (var i = 9; i < scene.children.length; i++) {
                var curr = scene.children[i].geometry;
                if (curr instanceof THREE.ConvexGeometry) {
                    var curr_matrix = scene.children[i].matrix;

                    curr.applyMatrix(curr_matrix);
                    if (type == "cylinder") {
                        if (isPolyhedronOutOfCylinder(cylinder_geometry, curr)) {
                            scene.children[i] = scene.children[scene.children.length - 1];
                            scene.children.pop();
//									scene.children.splice(i, 1);
//									allConvex.splice(allConvex.indexOf(curr), 1);
                            i--;
                            continue;
                        }
                    } else {
                        if (isPolyhedronOutOfBox(box, curr)) {
                            scene.children[i] = scene.children[scene.children.length - 1];
                            scene.children.pop();
//									scene.children.splice(i, 1);
//									allConvex.splice(allConvex.indexOf(curr), 1);
                            i--;
                            continue;
                        }
                    }
                    var points = [];
                    for (var j = 0; j < curr.vertices.length; j++) {
                        points.push([curr.vertices[j].x, curr.vertices[j].y, curr.vertices[j].z]);
                    }

                    var faces = [];
                    for (var j = 0; j < curr.faces.length; j++) {
                        faces.push([curr.faces[j].a, curr.faces[j].b, curr.faces[j].c]);
                    }

                    result +=
                        "polyhedron("
                        + "points="
                        + JSON.stringify(points)
                        + ","
                        + "faces="
                        + JSON.stringify(faces)
                        + ""
                        + ");\n";

                    vols += calculate(curr);
                    rt = (vols / containerVolume) * 100;
                    console.log("Final Rate: " + rt + "%");
                }


            }

            if (ipc.sendSync('synchronous-message', result) == "close") { // prints "pong"

//							window.close();
            }
        }


        function genAndTranslate(flags) {
//					console.log("Simulation iteration count: " + flags.recur);
            output2Threejs(randomFunc(options), scene, containerVolume, options);
//					for (var j = 0; j < translate_iter_count; j++) {
//						translate(allConvex, container, "left", 1);
//						translate(allConvex, container, "right", 1);
//						translate(allConvex, container, "down", 1);
//					}
            var z = 0, x = 0, y = 1;
            var theta = 0, alpha = 0;
            var fraction = 2;
            for (var j = 0; j < fraction / 2; j++) {
                for (var k = 0; k < fraction; k++) {
                    theta += j / (Math.PI * 2);
                    alpha += k / (Math.PI * 2);
                    z = Math.sin(theta) * Math.cos(alpha);
                    x = Math.sin(theta) * Math.sin(alpha);
                    y = Math.abs(Math.cos(theta));
                    var matrix = new THREE.Matrix4().makeTranslation(x, -y, z);
                    var minus_matrix = new THREE.Matrix4().makeTranslation(-x, y, -z);
//							var matrix = new THREE.Vector3(x, -y, z);
//							var minus_matrix = new THREE.Vector3(-x, y, -z);
                    translate(allConvex, container, "", translate_iter_count, matrix, minus_matrix);
                }
            }

            if (flags) {
                flags.recur--;
                if (flags.recur < 0) {
                    writeResult(options, containerVolume, allConvex);
                    // return;
                } else {
                    setTimeout(function () {
                        genAndTranslate(flags);
                    }, 1);
                }
            }
        }

        if (use_engine) {
//				mainFunc();
        } else {

            if (show_window) {

                var flags = {recur: recurCount};
                setTimeout(function () {
                    console.log("settimeout");
                    genAndTranslate(flags);
                }, 1);
            } else {
                for (var i = 0; i < recurCount; i++) {
                    genAndTranslate(false);
                }
                writeResult(options, containerVolume, allConvex);
            }
        }

    });
}

function output2Threejs(polys, scene, containerVolume, options) {

    var show_window = false || options.show_window;
    var use_engine = false || options.use_engine;
    // Output
    for (var i = 0; i < polys.length; i++) {

        var convex = polys[i];
        if (convex == undefined) continue;
        var volume = calculate(convex);
        //if (volume < 20) continue;
        totalVolume += volume;
        rate = (totalVolume / containerVolume) * 100;
        // console.log("Vertices: " + JSON.stringify(convex.vertices));
        // console.log("Current: " + volume);
        // console.log("Total: " + totalVolume);
        // console.log("containerVolume: " + containerVolume);
        //console.log("Intersection count : " +interectionCount);
        //var object = THREE.SceneUtils.createMultiMaterialObject(convex, materials);
        if (show_window) {

            var materials = [
                new THREE.MeshLambertMaterial({ambient: Math.random() * 16777215}),
                new THREE.MeshBasicMaterial({
                    color: Math.random() * 16777215,
                    wireframe: true,
                    transparent: true,
                    opacity: 1
                })
            ];
            var shape = THREE.SceneUtils.createMultiMaterialObject(convex, materials);

            scene.add(shape);
        }

    }
    //console.log("Rate: " + rate);

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

function output2Phisijs(polys, scene, containerVolume, options) {

    var show_window = false || options.show_window;
    var use_engine = false || options.use_engine;
    // Output
    for (var i = 0; i < polys.length; i++) {

        var convex = polys[i];
        if (convex == undefined) continue;
        var volume = calculate(convex);
        //if (volume < 20) continue;
        totalVolume += volume;
        rate = (totalVolume / containerVolume) * 100;
        // console.log("Vertices: " + JSON.stringify(convex.vertices));
        // console.log("Current: " + volume);
        // console.log("Total: " + totalVolume);
        // console.log("containerVolume: " + containerVolume);
        //console.log("Intersection count : " +interectionCount);
        //var object = THREE.SceneUtils.createMultiMaterialObject(convex, materials);
        if (show_window) {

            var materials = [
                new THREE.MeshLambertMaterial({ambient: Math.random() * 16777215}),
                new THREE.MeshBasicMaterial({
                    color: Math.random() * 16777215,
                    wireframe: true,
                    transparent: true,
                    opacity: 1
                })
            ];
            var shape = new Physijs.ConvexMesh(
                polys[i],
                materials[0]
            );
            shape.setCcdMotionThreshold(1);
            shape.setCcdSweptSphereRadius(0.2);

            shape.geometry.computeBoundingSphere();

            var pos = shape.geometry.boundingSphere.center;
            shape.position.set(pos.x, pos.y, pos.z);

            shape.__dirtyPosition = true;
            shape.__dirtyRotation = true;

            if (!use_engine) {
                var _vector = new THREE.Vector3;
                _vector.set( 0, 0, 0 );
                shape.setAngularFactor( _vector );
                shape.setAngularVelocity( _vector );
                shape.setLinearFactor( _vector );
                shape.setLinearVelocity( _vector );
            }

            scene.add(shape);
        }

    }
    //console.log("Rate: " + rate);

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


function writeResult(options, containerVolume, polys) {

    var vols = 0;
    var rt = 0;

    var result = "";
    var statistics = "";

    var levels = [];
    for (var r in options.polyhedrons) {
        levels.push(0);
    }

    for (var i = 9; i < polys.length; i++) {

        var curr = polys[i];

        var points = [];
        for (var j = 0; j < curr.vertices.length; j++) {
            points.push([curr.vertices[j].x, curr.vertices[j].y, curr.vertices[j].z]);
        }

        var faces = [];
        for (var j = 0; j < curr.faces.length; j++) {
            faces.push([curr.faces[j].a, curr.faces[j].b, curr.faces[j].c]);
        }

        result +=
            "polyhedron("
            + "points="
            + JSON.stringify(points)
            + ","
            + "faces="
            + JSON.stringify(faces)
            + ""
            + ");\n";

        vols += calculate(curr);
        rt = (vols / containerVolume) * 100;
        console.log("Final Rate: " + rt + "%");

        levels[curr.radius_level]++;

    }

    statistics += "rate: " + rt + "%\n";

    for (var r in options.polyhedrons) {
        var curr_radius = options.polyhedrons[r].radius;
        var curr_rate = (levels[r] / allConvex.length) * 100;
        statistics += "[" + curr_radius.min + ", " + curr_radius.max + "]: " + curr_rate + "%\n";
    }

    if (ipc.sendSync('synchronous-message', {result: result, statistics: statistics}) == "close") { // prints "pong"

        // window.close();
    }
}

function translate(polys, container, direction, iter_count, matrix, minus_matrix) {

    if (iter_count == undefined) {
        iter_count = 1;
    }

    var pointSortFunc = function(a, b) {
        if (direction == "left") {
            return a.x - b.x;
        } else if (direction == "down") {
            return a.y - b.y;
        } else if (direction == "right") {
            return a.z - b.z;
        }
    };
    var polySortFunc = function(a, b) {
        var pointsA = [];
        for (var i = 0; i < a.vertices.length; i++) {
            pointsA.push(a.vertices[i]);
        }
        pointsA.sort(pointSortFunc);
        var pointsB = [];
        for (var i = 0; i < b.vertices.length; i++) {
            pointsB.push(b.vertices[i]);
        }
        pointsB.sort(pointSortFunc);

        if (direction == "left") {
            return pointsA[0].x - pointsB[0].x;
        } else if (direction == "down") {
            return pointsA[0].y - pointsB[0].y;
        } else if (direction == "right") {
            return pointsA[0].z - pointsB[0].z;
        }
        //if (direction == "left") {
        //    return a.minX - b.minX;
        //} else if (direction == "down") {
        //    return a.minY - b.minY;
        //} else if (direction == "right") {
        //    return a.minZ - b.minZ;
        //}
    };

    if (matrix == undefined) {
        polys.sort(polySortFunc);
    }

    var min_step = -1;
    //var matrix, minus_matrix;
    if (direction == "left") {
        matrix = new THREE.Matrix4().makeTranslation(min_step, min_step, 0);
        minus_matrix = new THREE.Matrix4().makeTranslation(-min_step, -min_step, 0);
    } else if (direction == "down") {
        matrix = new THREE.Matrix4().makeTranslation(0, min_step, 0);
        minus_matrix = new THREE.Matrix4().makeTranslation(0, -min_step, 0);
    } else if (direction == "right") {
        matrix = new THREE.Matrix4().makeTranslation(0, min_step, min_step);
        minus_matrix = new THREE.Matrix4().makeTranslation(0, -min_step, -min_step);
    }

    console.log("Translating " + direction + " ...");
    for (var iter = 0; iter < iter_count; iter++) {
        //console.log("Translating " + direction + " " + iter + " ...");
        for (var i = 0; i < polys.length; i++) {

            var convex = polys[i];
            if (convex == undefined) continue;

            var out = false, inter = false;
            // Transform
            while (!out && !inter) {
                convex.applyMatrix(matrix);
                //movePolyhedronByVector(convex, matrix);
                convex.computeMinMax();

                if (container.vertex3A == undefined) {
                    out = isPolyhedronOutOfCylinder(container, convex)
                } else {
                    out = isPolyhedronOutOfBox(container, convex);
                }
                if (out) {
                    convex.applyMatrix(minus_matrix);
                    //movePolyhedronByVector(convex, minus_matrix);
                    convex.computeMinMax();
                    break;
                }
                inter = hasIntersection(allConvex, convex, areIntersectedPolyhedrons);
                if (inter) {
                    convex.applyMatrix(minus_matrix);
                    //movePolyhedronByVector(convex, minus_matrix);
                    convex.computeMinMax();
                    //console.log("Not Transformed " + iter + ": " + i);
                    break;
                }
                //console.log("Translated " + iter + ": " + i);

            }
        }
    }

    return polys;
}
