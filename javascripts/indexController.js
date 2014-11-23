var container, stats;

var camera, scene, renderer;

init();
animate();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.y = 400;

    scene = new THREE.Scene();
    scene.position.x = -500;
    scene.position.y = -500;
    scene.position.z = -500;

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
    scene.add( object );

    // cube

    var points = [
        new THREE.Vector3( 500, 500, 500 ),
        new THREE.Vector3( 500, 500, 0 ),
        new THREE.Vector3( 0, 500, 0 ),
        new THREE.Vector3( 0, 500, 500 ),
        new THREE.Vector3( 500, 0, 500 ),
        new THREE.Vector3( 500, 0, 0 ),
        new THREE.Vector3( 0, 0, 0 ),
        new THREE.Vector3( 0, 0, 500 )
    ];

    containerMaterials = [
        //new THREE.MeshLambertMaterial( { ambient: 0xf6f6f6, transparent: true}),//, map: map } ),
        new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, transparent: true, opacity: 1 } )
    ];

    object = THREE.SceneUtils.createMultiMaterialObject( new THREE.ConvexGeometry( points ), containerMaterials );
    object.position.set( 0, 0, 0 );
    scene.add( object );

    // random convex
    randomGenAndPut();
    //randomGenAndPut();
    //randomGenAndPut();


    object = new THREE.AxisHelper( 500 );
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

    var timer = Date.now() * 0.0001;

    camera.position.x = Math.cos( timer ) * 1000;
    camera.position.z = Math.sin( timer ) * 1000;
    //camera.position.x = 800;
    //camera.position.z = 800;

    camera.lookAt( scene.position );

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