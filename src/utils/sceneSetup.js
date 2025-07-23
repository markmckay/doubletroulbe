import * as THREE from 'three';

export const setupScene = (container) => {
  console.log('🎬 [SceneSetup] Initializing Three.js scene...');
  
  // Create scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2c3e50);
  console.log('🌍 [SceneSetup] Scene created with background color');

  // Create camera
  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 8, 8);
  camera.lookAt(0, 0, 0);
  console.log('📷 [SceneSetup] Camera positioned at (0, 8, 8)');

  // Create renderer
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true 
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  
  container.appendChild(renderer.domElement);
  console.log('🖼️ [SceneSetup] Renderer created and added to DOM');

  // Add lighting
  setupLighting(scene);

  // Handle window resize
  const handleResize = () => {
    console.log('📐 [SceneSetup] Handling window resize...');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };

  window.addEventListener('resize', handleResize);
  console.log('✅ [SceneSetup] Scene setup complete');

  return { scene, camera, renderer };
};

const setupLighting = (scene) => {
  console.log('💡 [SceneSetup] Setting up lighting...');
  
  // Ambient light for overall illumination
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
  scene.add(ambientLight);
  console.log('🌙 [SceneSetup] Ambient light added');

  // Main directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;
  scene.add(directionalLight);
  console.log('☀️ [SceneSetup] Directional light with shadows added');

  // Additional accent light
  const accentLight = new THREE.DirectionalLight(0x4a90e2, 0.3);
  accentLight.position.set(-5, 5, -5);
  scene.add(accentLight);
  console.log('✨ [SceneSetup] Accent light added');

  console.log('✅ [SceneSetup] Lighting setup complete');
};