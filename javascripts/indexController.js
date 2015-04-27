var container, stats;

var camera, scene, renderer;

init();
animate();

function init() {

    //container = document.createElement( 'div' );
    container = document.getElementById('3dcontainer');
    //document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 5000 );
    // camera.position.z = 400;
    camera.position.set(250,220,250);


    scene = new THREE.Scene();
    // scene.position.x = -500;
    // scene.position.y = -500;
    scene.position.x = 0;
    scene.position.y = 0;
    //scene.position.z = -500;
    camera.lookAt(scene.position);

    var light, object, materials, containerMaterials;

    scene.add( new THREE.AmbientLight( 0x404040 ) );

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 1, 0 );
    scene.add( light );

    //var map = THREE.ImageUtils.loadTexture( 'textures/UV_Grid_Sm.jpg' );
    //map.wrapS = map.wrapT = THREE.RepeatWrapping;
    //map.anisotropy = 16;

    materials = [
        new THREE.MeshLambertMaterial( { ambient: 0xbbbbbb}),//, map: map } ),
        new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, transparent: true, opacity: 1 } )
    ];


    // tetrahedron

    var points = [
        new THREE.Vector3( 100, 0, 0 ),
        new THREE.Vector3( 0, 100, 0 ),
        new THREE.Vector3( 0, 0, 100 ),
        new THREE.Vector3( 0, 0, 0 )
    ];

    object = THREE.SceneUtils.createMultiMaterialObject( new THREE.ConvexGeometry( points ), materials );
    object.position.set( 0, 0, 0 );
    // scene.add( object );

    // cube
    var len = 150
    var points = [
        new THREE.Vector3( 150, 150, 150 ),
        new THREE.Vector3( 150, 150, 0 ),
        new THREE.Vector3( 0, 150, 0 ),
        new THREE.Vector3( 0, 150, 150 ),
        new THREE.Vector3( 150, 0, 150 ),
        new THREE.Vector3( 150, 0, 0 ),
        new THREE.Vector3( 0, 0, 0 ),
        new THREE.Vector3( 0, 0, 150 )
    ];

    containerMaterials = [
        //new THREE.MeshLambertMaterial( { ambient: 0xf6f6f6, transparent: true}),//, map: map } ),
        new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, transparent: true, opacity: 1 } )
    ];

    var cylinder_geometry = new THREE.CylinderGeometry(75, 75, 150, 32);
    var cylinderVolume = calcVolumeOfCylinder(cylinder_geometry);

    // Cylinder container
    object = new THREE.SceneUtils.createMultiMaterialObject( cylinder_geometry, containerMaterials );
    object.position.set(0,60,0);
    // scene.add(object);

    // Cube container
    object = THREE.SceneUtils.createMultiMaterialObject( new THREE.ConvexGeometry( points ), containerMaterials );
    object.position.set( 0, 0, 0 );
    scene.add( object );

    // random convex
    randomGenAndPut();
    //randomGenAndPut();


    object = new THREE.AxisHelper( 150 );
    object.position.set( 0, 0, 0 );
    scene.add( object );

    //object = new THREE.ArrowHelper( new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 0 ), 50 );
    //object.position.set( 200, 0, 400 );
    //scene.add( object );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );

    container.appendChild( renderer.domElement );

    //stats = new Stats();
    //stats.domElement.style.position = 'absolute';
    //stats.domElement.style.top = '0px';
    //container.appendChild( stats.domElement );


    window.addEventListener( 'resize', onWindowResize, false );
    // setTimeout(randomGenAndPut, 1);

}



function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}



function animate() {

    requestAnimationFrame( animate );

    render();
    //stats.update();

}

function render() {

    var timer = Date.now() * 0.001;

    // camera.position.x = Math.cos( timer ) * 230;
    // camera.position.y = Math.sin( timer ) * 300;
    // // camera.position.y = 0;
    // camera.position.z = Math.sin( timer ) * 230;
    //camera.position.x = 800;
    //camera.position.z = 800;

    // camera.lookAt( scene.position );
    // camera.lookAt({x: 100, y: -100, z: 150});

    //for ( var i = 0, l = scene.children.length; i < l; i ++ ) {
    //
    //    var object = scene.children[ i ];
    //
    //    object.rotation.x = timer * 5;
    //    object.rotation.y = timer * 2.5;
    //
    //}

    renderer.render( scene, camera );

}
