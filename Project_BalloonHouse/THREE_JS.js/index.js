import {GLTFLoader} from "./library/GLTFLoader.js"; //Import the class to load gltf-files
import {OrbitControls} from "./library/OrbitControls.js";
import {GUI} from "./library/dat.gui.module.js";

//*******************************// DECLARATION //*******************************//
var dist = []; // Array storing the distance from the ground
var a = []; // Array storing the acceleration
var v = []; // Array storing the velocities
var s_d = []; // Array storing the time for an intervall

// Initial values
dist[0] = 0;
v[0] = 0;
s_d[0] = 0;

var h = 1; // Stepsize
const m_balloon = 300; // Mass of balloon
const m_house = 40300; // Mass of house
const g = 9.82; // Gravitational constant
let d_air; // Density of air
const d_helium = 0.1785; // Density of helium
const m_sum = m_balloon + m_house; // Total mass of house and ballon
const c = 0.45; // Cofficient for air resistance for a sphere
const press_air = 100000; // Air pressure at starting point
const temp = 273.15; // Temperature in kelvin
const Mol_air = 0.029; // Mol weight of air
const Gas_air = 8.3145; // Gas constant for air

let F1 = m_sum * g; // Gravity of the house and balloon

//*******************************// Create loader and objects //*******************************//
const loaderObj = new GLTFLoader();

var obj_island;
var obj_house;
let BSphere;

loaderObj.load("low_poly_nature/scene.gltf", function(gltf) { // Load the enviroment object

    obj_island = gltf.scene;
    obj_island.position.set(-10, -258, 0);
    obj_island.scale.set(11, 11, 11);
    scene.add(obj_island);

}, undefined, function(error) {

    console.error(error);

});

loaderObj.load("Balloon_House/BalloonHouse.gltf", function(gltf) { // Load the object with the balloon and house

    obj_house = gltf.scene;
    obj_house.position.set(30, 0, -95);
    obj_house.rotation.y = -0.6;
    obj_house.scale.set(2, 2, 2);
    scene.add(obj_house);
    BSphere = obj_house.getObjectByName('Sphere');
    BSphere.scale.set(10, 10, 10);

}, undefined, function(error) {

    console.error(error);

});

//*******************************// Create scene //*******************************//
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1E1E1E);

// Create GUI 
const gui = new GUI();
const buttonFolder = gui.addFolder("Animations");
buttonFolder.open();

let j = 0; //Time in seconds, start-value

// Lift object when pressing the button "Lift"
var buttonExpand = {
    Lift: function lift() {

        // Creating timeline, good for further development 
        var tl = gsap.timeline({
            repeat: 0,
            repeatDelay: 0
        });

        // Expansion of ballon
        tl.to(BSphere.scale, {
            x: 20,
            y: 20,
            z: 20,
            duration: 3,
        });

        Physics();

        //Loop trough all the intervals
        while (j <= 167) {

                tl.to(obj_house.position, {
                    y: dist[j + 1], //Distance of the journey in current interval
                    duration: s_d[j], //Time for the object to go from start to end in the interval
                    ease: Linear.easeIn //Smooth transition between interval
                });
            j++
        }
    }
}

// Add buttons to the GUI
buttonFolder.add(buttonExpand, 'Lift');
const valueFolder = gui.addFolder("Values");
valueFolder.open();

function Physics() {

    const radius = 22.09626871; // Radius of the balloon
    const cross_area = (Math.pow(radius, 2) * Math.PI); // Crossarea of the balloon
    const V = (4 * Math.PI * Math.pow(radius, 3)) / 3; // Volume of sphere
    let F_down = (m_balloon + V * d_helium) * g; // Gravity of balloon

    //Calculates the difference in air density for each iteration and calculates the corresponding forces
    for (var t = 0; t < 167; t++) {

        if (0 <= dist[t] && dist[t] < 100) {
            d_air = ((press_air - 625) * Mol_air) / (Gas_air * ((20 - 0.4) + temp));
        } else if (100 <= dist[t] && dist[t] < 200) {
            d_air = ((press_air - 1875) * Mol_air) / (Gas_air * ((20 - 1.2) + temp));
        } else if (200 <= dist[t] && dist[t] < 300) {
            d_air = ((press_air - 3125) * Mol_air) / (Gas_air * ((20 - 2) + temp));
        } else if (300 <= dist[t] && dist[t] < 400) {
            d_air = ((press_air - 4375) * Mol_air) / (Gas_air * ((20 - 2.8) + temp));
        } else if (400 <= dist[t] && dist[t] < 500) {
            d_air = ((press_air - 5625) * Mol_air) / (Gas_air * ((20 - 3.6) + temp));
        } else if (500 <= dist[t] && dist[t] < 600) {
            d_air = ((press_air - 6875) * Mol_air) / (Gas_air * ((20 - 4.4) + temp));
        } else if (600 <= dist[t] && dist[t] < 700) {
            d_air = ((press_air - 8125) * Mol_air) / (Gas_air * ((20 - 5.2) + temp));
        } else if (700 <= dist[t] && dist[t] < 800) {
            d_air = ((press_air - 9375) * Mol_air) / (Gas_air * ((20 - 6.0) + temp));
        } else if (800 <= dist[t] && dist[t] < 900) {
            d_air = ((press_air - 10625) * Mol_air) / (Gas_air * ((20 - 6.8) + temp));
        } else if (900 <= dist[t] && dist[t] < 1000) {
            d_air = ((press_air - 11875) * Mol_air) / (Gas_air * ((20 - 7.6) + temp));
        } else {
            break;
        }

        let F_air = ((c * d_air * cross_area) * (Math.pow(v[t], 2))) / 2; // Air resistance
        let F_up = d_air * V * g; // Archimedes' principle
        let F_lift = F_up - F_down; // Lifting force
        let Fnetto = -F1 + F_lift - F_air; // Resulting force 

        // Euler's formula
        a[t] = ((1 / (m_sum) * Fnetto));
        v[t + 1] = v[t] + h * a[t];
        dist[t + 1] = dist[t] + h * v[t + 1]; 
        s_d[t] = (dist[t + 1] / v[t + 1]) - (dist[t] / v[t]); 
        
        // GUI variables
        var obj = {

            Acceleration: a[t],
            Velocity: v[t + 1],
            Distance: dist[t + 1],
        }

        var Acceleration = gui.add(obj, 'Acceleration').name('Acceleration :').listen();
        var Velocity = gui.add(obj, 'Velocity').name('Velocity').listen();
        var Distance = gui.add(obj, 'Distance').name('Distance').listen();

    }
}

//*******************************// Create camera //*******************************//
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    20,
    30000
); //(FOV, aspect ratio, near clipping plane, far clipping plane)
camera.position.set(126, -1890, -12);

//*******************************// Create renderer //*******************************//
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//*******************************// Orbit controls //*******************************// 
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, -40);
controls.update();

//*******************************// SkyBox //*******************************// 
let materialArray = [];
let texture_pox = new THREE.TextureLoader().load('https://zultanzul.github.io/SeaZeroQuest/Level3/images/skybox/sky_pos_x.png');
let texture_nex = new THREE.TextureLoader().load('https://zultanzul.github.io/SeaZeroQuest/Level3/images/skybox/sky_neg_x.png');
let texture_poy = new THREE.TextureLoader().load('https://zultanzul.github.io/SeaZeroQuest/Level3/images/skybox/sky_pos_y.png');
let texture_ney = new THREE.TextureLoader().load('https://zultanzul.github.io/SeaZeroQuest/Level3/images/skybox/sky_neg_y.png');
let texture_poz = new THREE.TextureLoader().load('https://zultanzul.github.io/SeaZeroQuest/Level3/images/skybox/sky_pos_z.png');
let texture_nez = new THREE.TextureLoader().load('https://zultanzul.github.io/SeaZeroQuest/Level3/images/skybox/sky_neg_z.png');

materialArray.push(new THREE.MeshBasicMaterial({map: texture_pox}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_nex}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_poy}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_ney}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_nez}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_poz}));

for (let i = 0; i < 6; i++) {
    materialArray[i].side = THREE.BackSide;
}

let skyboxGeo = new THREE.BoxGeometry(30000, 30000, 30000);
let skybox = new THREE.Mesh(skyboxGeo, materialArray);
scene.add(skybox);
animate();

//*******************************// Create lightsource //*******************************//
const dirLight = new THREE.DirectionalLight(0x404040, 8); //(Color, intensity)
dirLight.position.set(0, 29000, 0); //Position the lightsource dirLight
scene.add(dirLight);

const ambLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambLight);

//*******************************// Create animation //*******************************//
function animate() { 

    // Make the camera follow the object lifting
    if (obj_island && obj_house) {
        camera.position.y = obj_house.position.y + 20;
        camera.lookAt(obj_house.position);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);

}
animate();