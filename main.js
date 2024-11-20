import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const setup = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  return { scene, camera, renderer };
};

const { camera, renderer, scene } = setup();

const addLights = () => {
  const light = new THREE.AmbientLight(0xffffff); // soft white light
  scene.add(light);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  scene.add(directionalLight);
};

camera.position.z = 20;
camera.position.y = 5;

const addHouse = () => {
  const house = new THREE.Group();

  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2, 4),
    new THREE.MeshStandardMaterial()
  );

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(4, 2, 4),
    new THREE.MeshStandardMaterial({ color: '#eee' })
  );

  roof.rotation.y = Math.PI / 4;
  roof.position.y = 2;

  house.position.y = 1;

  house.add(roof);
  house.add(walls);

  scene.add(house);
};

const addFloor = () => {
  const textureLoader = new THREE.TextureLoader();

  const texture = textureLoader.load('/floor/alpha.jpg');

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
      alphaMap: texture,
      transparent: true,
    })
  );

  floor.rotation.x = -Math.PI * 0.5;
  scene.add(floor);
};

const addGraves = () => {
  const graves = new THREE.Group();

  const geometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
  const material = new THREE.MeshStandardMaterial();

  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 4 + Math.random() * 4;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    const grave = new THREE.Mesh(geometry, material);

    grave.position.x = x;
    grave.position.y = Math.random() * 0.4;
    grave.position.z = z;

    grave.rotation.x = (Math.random() - 0.5) * 0.2;
    grave.rotation.y = (Math.random() - 0.5) * 0.2;
    grave.rotation.z = (Math.random() - 0.5) * 0.2;

    graves.add(grave);
  }

  scene.add(graves);
};

addLights();
addHouse();
addGraves();
addFloor();

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
  controls.update();

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
