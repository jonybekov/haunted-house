import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as dat from "dat.gui";

import "./style.css";

const gui = new dat.GUI();
const textureLoader = new THREE.TextureLoader();

const setup = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.z = 10;
  camera.position.y = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  return { scene, camera, renderer };
};

const { camera, renderer, scene } = setup();

const addLights = () => {
  const light = new THREE.AmbientLight("#86cdff", 0.275); // soft white light
  scene.add(light);

  const directionalLight = new THREE.DirectionalLight("#86cdff", 1);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight("#ff7d46", 5);
  pointLight.position.set(0, 2.2, 2.4);
  scene.add(pointLight);
};

const addHouse = () => {
  const house = new THREE.Group();

  /* Wall */
  const wallColorTexture = textureLoader.load(
    "/wall/rock_wall_10_1k/rock_wall_10_diff_1k.jpg"
  );
  const wallArmTexture = textureLoader.load(
    "/wall/rock_wall_10_1k/rock_wall_10_arm_1k.jpg"
  );
  const wallNormalTexture = textureLoader.load(
    "/wall/rock_wall_10_1k/rock_wall_10_nor_gl_1k.jpg"
  );

  const repeat = 1.5;
  wallColorTexture.repeat.set(repeat, repeat);
  wallArmTexture.repeat.set(repeat, repeat);
  wallNormalTexture.repeat.set(repeat, repeat);

  wallColorTexture.colorSpace = THREE.SRGBColorSpace;

  wallColorTexture.wrapS = THREE.RepeatWrapping;
  wallColorTexture.wrapT = THREE.RepeatWrapping;
  wallArmTexture.wrapS = THREE.RepeatWrapping;
  wallArmTexture.wrapT = THREE.RepeatWrapping;
  wallNormalTexture.wrapS = THREE.RepeatWrapping;
  wallNormalTexture.wrapT = THREE.RepeatWrapping;

  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4, 10, 10),
    new THREE.MeshStandardMaterial({
      map: wallColorTexture,
      aoMap: wallArmTexture,
      roughnessMap: wallArmTexture,
      metalnessMap: wallArmTexture,
      normalMap: wallNormalTexture,
    })
  );

  /* Roof */

  const roofColorTexture = textureLoader.load(
    "/roof/clay_roof_tiles_02_1k/clay_roof_tiles_02_diff_1k.jpg"
  );
  const roofArmTexture = textureLoader.load(
    "/roof/clay_roof_tiles_02_1k/clay_roof_tiles_02_arm_1k.jpg"
  );
  const roofNormalTexture = textureLoader.load(
    "/roof/clay_roof_tiles_02_1k/clay_roof_tiles_02_nor_gl_1k.jpg"
  );

  const roofRepeat = 4;
  roofColorTexture.repeat.set(roofRepeat, 1);
  roofArmTexture.repeat.set(roofRepeat, 1);
  roofNormalTexture.repeat.set(roofRepeat, 1);

  roofColorTexture.colorSpace = THREE.SRGBColorSpace;

  roofColorTexture.wrapS = THREE.RepeatWrapping;
  roofArmTexture.wrapS = THREE.RepeatWrapping;
  roofNormalTexture.wrapS = THREE.RepeatWrapping;

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(4.015, 2, 4),
    new THREE.MeshStandardMaterial({
      map: roofColorTexture,
      aoMap: roofArmTexture,
      roughnessMap: roofArmTexture,
      metalnessMap: roofArmTexture,
      normalMap: roofNormalTexture,
    })
  );

  roof.rotation.y = Math.PI / 4;
  roof.position.y = 2.25;
  house.position.y = 2.5 / 2;

  house.add(roof);
  house.add(walls);
  scene.add(house);
};

const addFloor = () => {
  const alphaTexture = textureLoader.load("/floor/alpha.jpg");
  const colorTexture = textureLoader.load(
    "/floor/aerial_rocks_04_1k/aerial_rocks_04_diff_1k.jpg"
  );
  const armTexture = textureLoader.load(
    "/floor/aerial_rocks_04_1k/aerial_rocks_04_arm_1k.jpg"
  );
  const normalTexture = textureLoader.load(
    "/floor/aerial_rocks_04_1k/aerial_rocks_04_nor_gl_1k.png"
  );
  const displacementTexture = textureLoader.load(
    "/floor/aerial_rocks_04_1k/aerial_rocks_04_disp_1k.jpg"
  );

  colorTexture.repeat.set(4, 4);
  armTexture.repeat.set(4, 4);
  normalTexture.repeat.set(4, 4);
  displacementTexture.repeat.set(4, 4);

  colorTexture.colorSpace = THREE.SRGBColorSpace;

  colorTexture.wrapS = THREE.RepeatWrapping;
  colorTexture.wrapT = THREE.RepeatWrapping;
  armTexture.wrapS = THREE.RepeatWrapping;
  armTexture.wrapT = THREE.RepeatWrapping;
  normalTexture.wrapS = THREE.RepeatWrapping;
  normalTexture.wrapT = THREE.RepeatWrapping;
  displacementTexture.wrapS = THREE.RepeatWrapping;
  displacementTexture.wrapT = THREE.RepeatWrapping;

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100),
    new THREE.MeshStandardMaterial({
      alphaMap: alphaTexture,
      transparent: true,
      map: colorTexture,
      aoMap: armTexture,
      roughnessMap: armTexture,
      metalnessMap: armTexture,
      normalMap: normalTexture,
      displacementMap: displacementTexture,
      displacementScale: 0.215,
      displacementBias: 0.015,
    })
  );

  gui
    .add(floor.material, "displacementScale")
    .min(0)
    .max(1)
    .step(0.001)
    .name("FloorDisplacementScale");

  gui
    .add(floor.material, "displacementBias")
    .min(-1)
    .max(1)
    .step(0.001)
    .name("FloorDisplacementBias");

  floor.rotation.x = -Math.PI * 0.5;
  scene.add(floor);
};

const addGraves = () => {
  const graves = new THREE.Group();

  const graveColorTexture = textureLoader.load(
    "/tomb/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.jpg"
  );
  const graveArmTexture = textureLoader.load(
    "/tomb/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.jpg"
  );
  const graveNormalTexture = textureLoader.load(
    "/tomb/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.jpg"
  );

  const roofRepeat = 1;
  graveColorTexture.repeat.set(roofRepeat, 1);
  graveArmTexture.repeat.set(roofRepeat, 1);
  graveNormalTexture.repeat.set(roofRepeat, 1);

  graveColorTexture.colorSpace = THREE.SRGBColorSpace;

  graveColorTexture.wrapS = THREE.RepeatWrapping;
  graveArmTexture.wrapS = THREE.RepeatWrapping;
  graveNormalTexture.wrapS = THREE.RepeatWrapping;

  const geometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
  const material = new THREE.MeshStandardMaterial({
    map: graveColorTexture,
    aoMap: graveArmTexture,
    roughnessMap: graveArmTexture,
    metalnessMap: graveArmTexture,
    normalMap: graveNormalTexture,
  });

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

const addDoor = () => {
  const colorTexture = textureLoader.load("/door/color.jpg");
  const aoTexture = textureLoader.load("/door/ambientOcclusion.jpg");
  const alphaTexture = textureLoader.load("/door/alpha.jpg");
  const normalTexture = textureLoader.load("/door/normal.jpg");
  const displacementTexture = textureLoader.load("/door/height.jpg");
  const metalnessTexture = textureLoader.load("/door/metalness.jpg");
  const roughnessTexture = textureLoader.load("/door/roughness.jpg");

  colorTexture.colorSpace = THREE.SRGBColorSpace;

  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(1.75, 2, 100, 100),
    new THREE.MeshStandardMaterial({
      map: colorTexture,
      alphaMap: alphaTexture,
      transparent: true,
      aoMap: aoTexture,
      normalMap: normalTexture,
      displacementMap: displacementTexture,
      metalnessMap: metalnessTexture,
      roughnessMap: roughnessTexture,
      displacementScale: 0.15,
      displacementBias: -0.04,
    })
  );

  door.position.z = 2 + 0.01;
  door.position.y = 2 / 2 + 0.15;
  door.rotation.y = 2 * Math.PI;
  scene.add(door);
};

addLights();
addHouse();
addGraves();
addFloor();
addDoor();

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
  controls.update();

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
