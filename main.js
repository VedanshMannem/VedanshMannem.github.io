import * as THREE from "three" 

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

// Responsive resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Background

// Stars
const stars = [];

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0x888888, transparent: true, opacity: 0 });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  star.userData = { creationTime: Date.now() };

  scene.add(star);
  stars.push(star);
}

function updateStars() {
  const currentTime = Date.now();
  stars.forEach((star, index) => {
    const elapsedTime = (currentTime - star.userData.creationTime) / 1000; // in seconds
    const cycleDuration = 3;

    if (elapsedTime >= cycleDuration) {
      // Remove star from scene and array
      scene.remove(star);
      stars.splice(index, 1);
      // Add a new star
      addStar();
    } else {
      // Calculate the current phase in the cycle (0 to 1)
      const phase = elapsedTime / cycleDuration;

      // Calculate the color and opacity based on the phase
      const colorValue = Math.sin(phase * Math.PI) * 0.5 + 0.5;
      star.material.color.setScalar(colorValue); // gray to white
      star.material.opacity = colorValue; // fade in and out
    }
  });
}

// Geometry for the extra mesh
const extraGeometry = new THREE.TorusKnotGeometry( 10, 3, 100, 16 ); 
const depthMaterial = new THREE.MeshStandardMaterial({ color : 0xff6347 });

const extraMesh = new THREE.Mesh(extraGeometry, depthMaterial);
extraMesh.position.set(-10, 0, 0); // Position the mesh to be in view

scene.add(extraMesh);

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

window.addEventListener('touchmove', (event) => {
  const touch = event.touches[0];
  const mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
  const mouseY = - (touch.clientY / window.innerHeight) * 2 + 1;
  const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
  vector.unproject(camera);
  const dir = vector.sub(camera.position).normalize();
  const distance = -camera.position.z / dir.z;
  const pos = camera.position.clone().add(dir.multiplyScalar(distance));
  addTrailSegment(pos.x, pos.y);
});

// Crunch Math box
const cmtexture = new THREE.TextureLoader().load('public/cm.png');
const cm = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({ map: cmtexture }));
cm.position.set(4.5, -3, 0);
scene.add(cm);

// Crunch Math borders
const edges = new THREE.EdgesGeometry(cm.geometry); // Create edges from the box geometry
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 10 }); // Border color and width
const edgeLines = new THREE.LineSegments(edges, edgeMaterial); // Create line segments for edges
edgeLines.position.copy(cm.position); 
scene.add(edgeLines);

// LinkedIn box 
const litexture = new THREE.TextureLoader().load('public/linkedin.png');
const li = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({ map: litexture }));
li.position.set(-1, -3, 0);
scene.add(li);

// Linkedin box border lines
const edgesli = new THREE.EdgesGeometry(li.geometry); // Create edges from the box geometry
const edgeMaterialli = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 10 }); // Border color and width
const edgeLinesli = new THREE.LineSegments(edgesli, edgeMaterialli); // Create line segments for edges
edgeLinesli.position.copy(li.position); 
scene.add(edgeLinesli);

// Raycaster and mouse variables
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object === cm) {
      window.open('https://www.crunchmath.org/', '_blank');
    }
  }
}

function onMouseClickLI(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object === li) {
      window.open('https://www.linkedin.com/in/vedansh-mannem-36732b282/', '_blank');
    }
  }
}

window.addEventListener('click', onMouseClick);
window.addEventListener('touchend', onMouseClick);
window.addEventListener('click', onMouseClickLI);
window.addEventListener('touchend', onMouseClickLI);

// Scroll Animation
let lastScrollTop = 0;
function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  cm.rotation.x += 0.01;
  cm.rotation.y += 0.01;
  cm.rotation.z += 0.01;

  edgeLines.rotation.x += 0.01;
  edgeLines.rotation.y += 0.01;
  edgeLines.rotation.z += 0.01;

  edgeLinesli.rotation.x += 0.01;
  edgeLinesli.rotation.y += 0.01;
  edgeLinesli.rotation.z += 0.01;

  li.rotation.x += 0.01;
  li.rotation.y += 0.01;
  li.rotation.z += 0.01;

  extraMesh.rotation.x += 0.02;
  extraMesh.rotation.y += 0.025;
  extraMesh.rotation.z += 0.02;
  const scrollChange = lastScrollTop - t;``
  extraMesh.position.x -= scrollChange*0.03;
  lastScrollTop = t;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
  
}

document.body.onscroll = moveCamera;
moveCamera();
let time = 0;
// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  cm.rotation.x += 0.005;
  cm.rotation.y += 0.0075;
  cm.rotation.z += 0.005;
  edgeLines.rotation.x += 0.005;
  edgeLines.rotation.y += 0.0075;
  edgeLines.rotation.z += 0.005;
  edgeLinesli.rotation.x += 0.005;
  edgeLinesli.rotation.y += 0.0075;
  edgeLinesli.rotation.z += 0.005;
  li.rotation.x += 0.005;
  li.rotation.y += 0.0075;
  li.rotation.z += 0.005;

  extraMesh.rotation.x += 0.01;
  extraMesh.rotation.y += 0.005;
  extraMesh.rotation.z += 0.01;

  updateStars();

  renderer.render(scene, camera);
}

Array(200).fill().forEach(addStar);

animate();
