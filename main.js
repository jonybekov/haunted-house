import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Sky } from "three/addons/objects/Sky.js";
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

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const splashScreen = document.createElement("div");

  splashScreen.style.position = "fixed";
  splashScreen.style.width = "100%";
  splashScreen.style.height = "100%";
  splashScreen.style.background = "black";
  splashScreen.style.display = "flex";
  splashScreen.style.justifyContent = "center";
  splashScreen.style.alignItems = "center";
  splashScreen.style.color = "white";

  THREE.DefaultLoadingManager.onStart = function (
    url,
    itemsLoaded,
    itemsTotal
  ) {
    document.body.appendChild(splashScreen);
    splashScreen.innerHTML = `Loading... ${(itemsLoaded / itemsTotal) * 100}%`;
  };

  THREE.DefaultLoadingManager.onLoad = function () {
    console.log("Loading Complete!");
    document.body.removeChild(splashScreen);
  };

  THREE.DefaultLoadingManager.onProgress = function (
    url,
    itemsLoaded,
    itemsTotal
  ) {
    splashScreen.innerHTML = `Loading... ${
      (Math.floor((itemsLoaded * 10) / itemsTotal) / 10) * 100
    }%`;
    console.log(
      "Loading file: " +
        url +
        ".\nLoaded " +
        itemsLoaded +
        " of " +
        itemsTotal +
        " files."
    );
  };

  THREE.DefaultLoadingManager.onError = function (url) {
    console.log("There was an error loading " + url);
  };

  return { scene, camera, renderer };
};

const { camera, renderer, scene } = setup();

const addLights = () => {
  const light = new THREE.AmbientLight("#86cdff", 0.275); // soft white light
  scene.add(light);

  const directionalLight = new THREE.DirectionalLight("#86cdff", 1.5);
  directionalLight.position.set(10, 10, -5);

  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.top = 8;
  directionalLight.shadow.camera.right = 8;
  directionalLight.shadow.camera.bottom = -8;
  directionalLight.shadow.camera.left = -8;
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 20;

  scene.add(directionalLight);

  const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
  scene.add(helper);

  const pointLight = new THREE.PointLight("#ff7d46", 10);
  pointLight.position.set(0, 2.2, 2.5);

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

  walls.castShadow = true;
  walls.receiveShadow = true;

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

  roof.castShadow = true;

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

  floor.receiveShadow = true;

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

    grave.castShadow = true;
    grave.receiveShadow = true;

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

function initSky() {
  // Add Sky
  let sky = new Sky();
  sky.scale.setScalar(450000);
  scene.add(sky);

  let sun = new THREE.Vector3();

  /// GUI

  const effectController = {
    turbidity: 0.4,
    rayleigh: 0,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.735,
    elevation: 23.2,
    azimuth: 127.5,
    exposure: renderer.toneMappingExposure,
  };

  function guiChanged() {
    const uniforms = sky.material.uniforms;
    uniforms["turbidity"].value = effectController.turbidity;
    uniforms["rayleigh"].value = effectController.rayleigh;
    uniforms["mieCoefficient"].value = effectController.mieCoefficient;
    uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
    const theta = THREE.MathUtils.degToRad(effectController.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    uniforms["sunPosition"].value.copy(sun);

    renderer.toneMappingExposure = effectController.exposure;
    renderer.render(scene, camera);
  }

  gui.add(effectController, "turbidity", 0.0, 20.0, 0.1).onChange(guiChanged);
  gui.add(effectController, "rayleigh", 0.0, 4, 0.001).onChange(guiChanged);
  gui
    .add(effectController, "mieCoefficient", 0.0, 0.1, 0.001)
    .onChange(guiChanged);
  gui
    .add(effectController, "mieDirectionalG", 0.0, 1, 0.001)
    .onChange(guiChanged);
  gui.add(effectController, "elevation", 0, 90, 0.1).onChange(guiChanged);
  gui.add(effectController, "azimuth", -180, 180, 0.1).onChange(guiChanged);
  gui.add(effectController, "exposure", 0, 1, 0.0001).onChange(guiChanged);

  guiChanged();
}

addLights();
addHouse();
addGraves();
addFloor();
addDoor();
initSky();

scene.fog = new THREE.FogExp2("#5e6369", 0.05);

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
  controls.update();

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
