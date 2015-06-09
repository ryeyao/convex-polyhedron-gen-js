/**
 *
 * Created by rye on 15-6-9.
 */

window.ThreejsView = (function() {

    var View = {};

    var renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );

    window.onload = function() {
        document.getElementById( 'viewport' ).appendChild( renderer.domElement );
    };

    var camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 5000 );
    // camera.position.z = 400;
    //camera.position.set(250,220,250);
    // camera.position.set(500,1000,500);
    var controls = new THREE.OrbitControls( camera, renderer.domElement );



    scene = new THREE.Scene();
    // scene.position.x = -500;
    // scene.position.y = -500;
    scene.position.x = 0;
    scene.position.y = 0;
    scene.position.z = 0;
    //scene.position.z = -500;
    camera.lookAt(scene.position);

    View.animate = function() {

        requestAnimationFrame( View.animate );

        View.render();
        //stats.update();

    };

    View.render = function() {

        var timer = Date.now() * 0.0009;

        // camera.position.x = Math.cos( timer ) * 200;
        // camera.position.y = Math.sin( timer ) * 200;
        // camera.position.z = Math.sin( timer ) * 200;
        // camera.position.x = 75;
        // camera.position.y = 800;
        // camera.position.z = 75;

        camera.lookAt( scene.position );
        // camera.lookAt({x: 75, y: 75, z: 75});

        //for ( var i = 0, l = scene.children.length; i < l; i ++ ) {
        //
        //    var object = scene.children[ i ];
        //
        //    object.rotation.x = timer * 5;
        //    object.rotation.y = timer * 2.5;
        //
        //}

        renderer.render( scene, camera );

    };

    controls.addEventListener( 'change', View.render );


    View.scene = scene;
    View.camera = camera;

    return View;
});

window.PhysijsView = (function() {
    var View = {};

    Physijs.scripts.worker = 'javascripts/physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';

    var
        renderer, render_stats, physics_stats, scene, light, ground, ground_material, wall_material, camera, axis, isPaused, unpauseSimulation;

    var total_volume = 0.0;
    var box_volume = 0.0;
    var rate = 0.0;

    View.initScene = function() {
        TWEEN.start();

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;
        document.getElementById( 'viewport' ).appendChild( renderer.domElement );

        render_stats = new Stats();
        render_stats.domElement.style.position = 'absolute';
        render_stats.domElement.style.top = '0px';
        render_stats.domElement.style.zIndex = 100;
        document.getElementById( 'viewport' ).appendChild( render_stats.domElement );

        physics_stats = new Stats();
        physics_stats.domElement.style.position = 'absolute';
        physics_stats.domElement.style.top = '50px';
        physics_stats.domElement.style.zIndex = 100;
        document.getElementById( 'viewport' ).appendChild( physics_stats.domElement );

        scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });
//		scene.setGravity(new THREE.Vector3( -30, -30, -30 ));
//		scene.addEventListener(
//			'update',
//			function() {
//				scene.simulate( undefined, 2 );
//				physics_stats.update();
//			}
//		);

        camera = new THREE.PerspectiveCamera(
            35,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );

        camera.lookAt( scene.position );
        scene.add( camera );

        // Axis
        axis = new THREE.AxisHelper( 190 );
        axis.position.set( 0, 0, 0 );
        scene.add( axis );

        // Light
        light = new THREE.DirectionalLight( 0xFFFFFF );
        light.position.set( 100, 100, -15 );
        light.target.position.copy( scene.position );
        light.castShadow = false;
        light.shadowCameraLeft = -60;
        light.shadowCameraTop = -60;
        light.shadowCameraRight = 60;
        light.shadowCameraBottom = 60;
        light.shadowCameraNear = 20;
        light.shadowCameraFar = 200;
        light.shadowBias = -.0001
        light.shadowMapWidth = light.shadowMapHeight = 2048;
        light.shadowDarkness = .7;
        scene.add( light );

        // Materials
        View.wall_material = Physijs.createMaterial(
            //new THREE.MeshLambertMaterial( { ambient: 0xf6f6f6, transparent: true}),//, map: map } ),
            new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, transparent: true, opacity: 1 } )
        );
        View.ground_material = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( 'images/rocks.jpg' ) }),
            .8, // high friction
            .4 // low restitution
        );
        View.ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
        View.ground_material.map.repeat.set( 2.5, 2.5 );

    };

    View.render = function() {
        var timer = Date.now() * 0.0006;

        // camera.position.x = Math.cos( timer ) * 650;
        //camera.position.y = Math.sin( timer ) * 200;
        // // camera.position.y = 0;
        // camera.position.z = Math.sin( timer ) * 650;
        //camera.position.x = 800;
        //camera.position.z = 800;

        //camera.lookAt( scene.position );
        // camera.lookAt({x: 75, y: 75, z: 75});

        if (!isPaused) {
            scene.simulate();
        }
        requestAnimationFrame( View.render );
        renderer.render( scene, camera );
        render_stats.update();
    };

    unpauseSimulation = function() {
        isPaused = false;
        scene.onSimulationResume();
    };

    View.animate = function() {
        window.onload = View.initScene;
        requestAnimationFrame( View.render );
    };

    View.camera = camera;

    // Materials
    View.wall_material = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, transparent: true, opacity: 1 } );
    View.ground_material = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( 'images/rocks.jpg' ) });
    View.ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
    View.ground_material.map.repeat.set( 2.5, 2.5 );

    View.scene = scene;

    return View;

});

function initBoxSceneThreejs(options) {

    var edge_len = options.container.options.edge_len;
    var edge_height = options.container.options.edge_height;
    var edge_width = options.container.options.edge_width;

    var thickness = 50;

    var container_geo = new THREE.BoxGeometry(edge_len, edge_height, edge_width);
    var containerMaterials = [
        //new THREE.MeshLambertMaterial( { ambient: 0xf6f6f6, transparent: true}),//, map: map } ),
        new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, transparent: true, opacity: 1 } )
    ];


    // Cube container
    var object = THREE.SceneUtils.createMultiMaterialObject( container_geo, containerMaterials );
    object.position.set( edge_len/2, edge_height/2, edge_width/2 );
    scene.add( object );

    scene.add( new THREE.AmbientLight( 0x404040 ) );

    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 1, 0 );
    scene.add( light );

    view.camera.position.set(edge_len * 2, edge_height * 5, edge_width * 2);

}
function initCylinderSceneThreejs(options) {

    var radius = options.container.options.radius;
    var height = options.container.options.height;
    var path_dist = 0;
    var thickness = 1;
    var segments = 360;

    var container_geo = new THREE.CylinderGeometry(radius, radius, height, 32);
    var containerMaterials = [
        //new THREE.MeshLambertMaterial( { ambient: 0xf6f6f6, transparent: true}),//, map: map } ),
        new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, transparent: true, opacity: 1 } )
    ];

    // Cylinder container
    var object = new THREE.SceneUtils.createMultiMaterialObject( container_geo, containerMaterials );
    object.position.set( radius, radius, height/2);
    scene.add(object);

    scene.add( new THREE.AmbientLight( 0x404040 ) );

    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 1, 0 );
    scene.add( light );

    view.camera.position.set(radius * 2, height * 5, radius * 2);

}
function initBoxScenePhysijs(options) {

    var edge_len = options.container.options.edge_len;
    var thickness = 50;


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
    //bumper = new Physijs.BoxMesh( bumper_geom, ground_material, 0, { restitution: .2 } );
    bumper = new Physijs.BoxMesh( bumper_geom, wall_material, 0, { restitution: .2 } );
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
    bumper = new Physijs.BoxMesh( bumper_geom, wall_material, 0, { restitution: .2 } );
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
function initCylinderScenePhysijs(options) {

    var radius = options.container.options.radius;
    var height = options.container.options.height;
    var path_dist = 0;
    var thickness = 1;
    var segments = 360;

    // Ground
    ground = new Physijs.BoxMesh(
        new THREE.BoxGeometry(radius * 2.5 + thickness, thickness, radius * 2.5 + thickness),
        //new THREE.PlaneGeometry(50, 50),
        view.ground_material,
        0 // mass
    );
    ground.position.x = radius;
    ground.position.y = -thickness/2;
    ground.position.z = radius;

    ground.receiveShadow = true;
    scene.add( ground );
    scene.position.set(0, 0, 0);

    // Bumpers
    //var CustomSinCurve = THREE.Curve.create(
    //    function ( scale ) { //custom curve constructor
    //        this.scale = (scale === undefined) ? 1 : scale;
    //    },
    //
    //    function ( t ) { //getPoint: t is between 0-1
    //        var tx = Math.cos(2 * Math.PI * t),
    //            ty = 0,
    //            tz = Math.sin(2 * Math.PI * t);
    //
    //        return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
    //    }
    //);
    //
    //var path = new THREE.LineCurve3( new THREE.Vector3(path_dist, 0, path_dist), new THREE.Vector3(path_dist, height, path_dist) );

    var bumper,
        bumper_geom = new THREE.BoxGeometry(1, height + thickness, Math.PI * radius * radius / (segments*5));


    // Wall
    for (var i = 0; i < segments; i++) {
        bumper = new Physijs.BoxMesh(
            bumper_geom,
            wall_material,
            //ground_material,
            0 // mass

        );
        var grad = 2 * i * Math.PI / segments;
        bumper.position.x = radius + thickness/2 + radius * Math.cos(grad);
        bumper.position.y = height/2;
        bumper.position.z = radius + thickness/2 + radius * Math.sin(grad);
        bumper.rotation.y = -grad;
        scene.add(bumper);
    }

    // Top

    bumper_geom = new THREE.CylinderGeometry(radius * 1.5, radius * 1.5, thickness, segments);
    bumper = new Physijs.CylinderMesh( bumper_geom, wall_material, 0, { restitution: .2 } );
    bumper.position.y = height + thickness/2;
    bumper.position.x = radius;
    bumper.position.z = radius;
    //bumper.rotation.z = Math.PI / 2;
    bumper.receiveShadow = true;
    bumper.castShadow = true;
    scene.add( bumper );

}
