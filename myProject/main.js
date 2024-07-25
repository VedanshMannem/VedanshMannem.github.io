import './style.css'
import * as THREE from "three" 
import cmImage from './cm.png';
import liImage from './linkedin.png';
import spaceImg from './space.jpg';

// Setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);

renderer.render(scene, camera);

// Background
const spaceTexture = new THREE.TextureLoader().load(spaceImg);
scene.background = spaceTexture;

// Stars
function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);


// Geometry for the extra mesh
const extraGeometry = new THREE.TorusKnotGeometry( 10, 3, 100, 16 ); 
const depthMaterial = new THREE.MeshStandardMaterial({ color : 0xff6347 });

const extraMesh = new THREE.Mesh(extraGeometry, depthMaterial);
extraMesh.position.set(-10, 0, 0); // Position the mesh to be in view

scene.add(extraMesh);

// Circle
const circlegeo = new THREE.CircleGeometry( 5, 32 ); 
const circlemat = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
const circle = new THREE.Mesh( circlegeo, circlemat ); 
circle.position.set(0, 0, 0); // Position the mesh to be in view

// scene.add( circle );

// Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Trail
const trailGeometry = new THREE.SphereGeometry(0.1, 16, 16); // Smaller size and smoother geometry
const trailMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff, // Subtle gray color
  blending: THREE.AdditiveBlending, // Blending mode for a soft glow effect
});
const trailMeshes = []; // To hold trail meshes

function addTrailSegment(x, y) {
  const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial);
  trailMesh.position.set(x, y, 0);
  scene.add(trailMesh);
  trailMeshes.push(trailMesh);

  if (trailMeshes.length > 10) {
    const oldest = trailMeshes.shift();
    scene.remove(oldest);
  }
}

window.addEventListener('mousemove', (event) => {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = - (event.clientY / window.innerHeight) * 2 + 1;
  const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
  vector.unproject(camera);
  const dir = vector.sub(camera.position).normalize();
  const distance = -camera.position.z / dir.z;
  const pos = camera.position.clone().add(dir.multiplyScalar(distance));
  addTrailSegment(pos.x, pos.y);
});



// Add clickable box
const cmtexture = new THREE.TextureLoader().load(cmImage);
const cm = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshBasicMaterial({ map: cmtexture }));
cm.position.set(4.5, -2, 0);
scene.add(cm);

const litexture = new THREE.TextureLoader().load(liImage);
const li = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshBasicMaterial({ map: litexture }));
li.position.set(-1, -2, 2);
scene.add(li);

// Raycaster and mouse variables
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.ray.origin.copy(camera.position);
  raycaster.ray.direction.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(camera.position).normalize();
  const intersects = raycaster.intersectObjects(scene.children);

  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object === cm) {
      window.location.href = 'https://www.crunchmath.org/';
    }
  }
}

function onMouseClickLI(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.ray.origin.copy(camera.position);
  raycaster.ray.direction.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(camera.position).normalize();
  const intersects = raycaster.intersectObjects(scene.children);

  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object === li) {
      window.location.href = 'https://www.linkedin.com/in/vedansh-mannem-36732b282/';
    }
  }
}

window.addEventListener('click', onMouseClickLI, false);
window.addEventListener('click', onMouseClick, false);

// Scroll Animation
let lastScrollTop = 0;
function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  cm.rotation.x += 0.01;
  cm.rotation.y += 0.01;
  cm.rotation.z += 0.01;
  li.rotation.x += 0.01;
  li.rotation.y += 0.01;
  li.rotation.z += 0.01;

  extraMesh.rotation.x += 0.02;
  extraMesh.rotation.y += 0.025;
  extraMesh.rotation.z += 0.02;
  const scrollChange = lastScrollTop - t;
  extraMesh.position.x -= scrollChange*0.03;
  lastScrollTop = t;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  cm.rotation.x += 0.005;
  cm.rotation.y += 0.0075;
  cm.rotation.z += 0.005;
  li.rotation.x += 0.005;
  li.rotation.y += 0.0075;
  li.rotation.z += 0.005;

  extraMesh.rotation.x += 0.01;
  extraMesh.rotation.y += 0.005;
  extraMesh.rotation.z += 0.01;

  renderer.render(scene, camera);
}

animate();
