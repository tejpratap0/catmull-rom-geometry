import * as THREE from 'three';
import { OrbitControls } from 'three/libs/utils/OrbitControls.js'; 

let camera, scene, renderer, cameraControls; 

function init() { 
    try{
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.set(0, 1, 4); 
        camera.lookAt(0, 0.75, 0); 
    
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x383838); 
      
        const dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.set(3, 10, 3);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 4;
        dirLight.shadow.camera.bottom = - 4;
        dirLight.shadow.camera.left = - 4;
        dirLight.shadow.camera.right = 4;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 40;
        scene.add(dirLight);
      
        // Creating Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);
    
        window.addEventListener('resize', onWindowResize); 
        
        cameraControls = new OrbitControls( camera, renderer.domElement );
     
    }catch(error){ 
        console.error("[Loading Error] Error in creating three js scene.");
    }
   
    animate();
}  

function onWindowResize() { 
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); 
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() { 
    requestAnimationFrame(animate);  
    renderer.render(scene, camera); 
} 
 
async function readInput(){ 
    let inputData;
    var loader = new THREE.FileLoader();
    try{
        inputData  = await loader.loadAsync( "./../assets/input.txt");
    }catch(error){  
        console.log("[File Error] Error in loading data from input file.");
    }
    
    if(inputData){
        const data = inputData.split(/\r?\n/);
        console.log("[Input Data]", data); 
        const points = []; 
        for (let i = 0; i < data.length; i++) {
            try{
                const coords = data[i].split(',');
                const point = new THREE.Vector3(parseFloat(coords[0]), parseFloat(coords[1]), 0);
                points.push(point);
            }catch(error){  
                console.log("[Vector Error] Error in convertion of point.", coords);
            }
        }
        return points;
    } 
}

async function createSpline(){
    let points = await readInput(); 
    
    if(points){
        // Creating gizmo points
        const gizmoGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const gizmoMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

        for (let i = 0; i < points.length; i++) {
            const gizmoMesh = new THREE.Mesh(gizmoGeometry, gizmoMaterial);
            gizmoMesh.position.copy(points[i]);
            scene.add(gizmoMesh);
        }
  
        // Creating Catmull ROM
        const curve = new THREE.CatmullRomCurve3(points); 
        let curveLength = Math.ceil(curve.getLength()) * 3; 
        const splineGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(curveLength)); 
        const splineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff }); 
        const splineObject = new THREE.Line(splineGeometry, splineMaterial); 
        scene.add(splineObject);
 
        // Creating Geometry  
        const tubeGeometry = new THREE.TubeGeometry(curve, curveLength, 0.2, 2, false); 
        const material = new THREE.MeshBasicMaterial({ color: 0x5b9bd5, wireframe: true });
        const mesh = new THREE.Mesh(tubeGeometry, material); 
        scene.add(mesh);
    }
    
}

init();

createSpline();