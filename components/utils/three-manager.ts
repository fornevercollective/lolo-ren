/**
 * Centralized Three.js manager to prevent multiple instances
 * This ensures only one instance of Three.js is loaded across the entire application
 */

let threeInstance: any = null;
let orbitControlsModule: any = null;
let loadingPromise: Promise<any> | null = null;

export interface ThreeModules {
  THREE: any;
  OrbitControls: any;
}

/**
 * Load Three.js and OrbitControls once and reuse across components
 */
export async function getThreeInstance(): Promise<ThreeModules> {
  // If already loading, return the same promise
  if (loadingPromise) {
    return loadingPromise;
  }

  // If already loaded, return immediately
  if (threeInstance && orbitControlsModule) {
    return {
      THREE: threeInstance,
      OrbitControls: orbitControlsModule.OrbitControls
    };
  }

  // Start loading and cache the promise
  loadingPromise = loadThreeModules();
  
  try {
    const result = await loadingPromise;
    return result;
  } finally {
    // Clear the loading promise once complete
    loadingPromise = null;
  }
}

async function loadThreeModules(): Promise<ThreeModules> {
  try {
    // Load Three.js core
    if (!threeInstance) {
      threeInstance = await import('three');
      console.log('Three.js core loaded');
    }

    // Load OrbitControls
    if (!orbitControlsModule) {
      orbitControlsModule = await import('three/examples/jsm/controls/OrbitControls');
      console.log('Three.js OrbitControls loaded');
    }

    return {
      THREE: threeInstance,
      OrbitControls: orbitControlsModule.OrbitControls
    };
  } catch (error) {
    console.error('Failed to load Three.js modules:', error);
    throw error;
  }
}

/**
 * Dispose of Three.js resources properly
 */
export function disposeThreeObject(object: any) {
  if (!object || !threeInstance) return;

  if (object.geometry) {
    object.geometry.dispose();
  }

  if (object.material) {
    if (Array.isArray(object.material)) {
      object.material.forEach((material: any) => {
        disposeMaterial(material);
      });
    } else {
      disposeMaterial(object.material);
    }
  }

  if (object.texture) {
    object.texture.dispose();
  }

  if (object.children) {
    object.children.forEach((child: any) => {
      disposeThreeObject(child);
    });
  }
}

function disposeMaterial(material: any) {
  if (!material) return;

  // Dispose of textures
  Object.keys(material).forEach(key => {
    if (material[key] && typeof material[key].dispose === 'function') {
      material[key].dispose();
    }
  });

  // Dispose of the material itself
  if (material.dispose) {
    material.dispose();
  }
}

/**
 * Create a standard Three.js scene with common setup
 */
export function createStandardScene(backgroundColor: number = 0x0a0b0d) {
  if (!threeInstance) {
    throw new Error('Three.js not loaded. Call getThreeInstance() first.');
  }

  const scene = new threeInstance.Scene();
  scene.background = new threeInstance.Color(backgroundColor);
  return scene;
}

/**
 * Create a standard camera with common settings
 */
export function createStandardCamera(
  fov: number = 45,
  aspect: number = 1,
  near: number = 0.1,
  far: number = 1000
) {
  if (!threeInstance) {
    throw new Error('Three.js not loaded. Call getThreeInstance() first.');
  }

  const camera = new threeInstance.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(5, 5, 5);
  return camera;
}

/**
 * Create a standard renderer with common settings
 */
export function createStandardRenderer(canvas?: HTMLCanvasElement) {
  if (!threeInstance) {
    throw new Error('Three.js not loaded. Call getThreeInstance() first.');
  }

  const renderer = new threeInstance.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = threeInstance.PCFSoftShadowMap;
  renderer.outputColorSpace = threeInstance.SRGBColorSpace;
  renderer.toneMapping = threeInstance.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  return renderer;
}

/**
 * Add standard lighting to a scene
 */
export function addStandardLighting(scene: any) {
  if (!threeInstance) {
    throw new Error('Three.js not loaded. Call getThreeInstance() first.');
  }

  // Ambient light
  const ambientLight = new threeInstance.AmbientLight(0x404040, 0.4);
  scene.add(ambientLight);

  // Directional light with shadows
  const directionalLight = new threeInstance.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);

  return { ambientLight, directionalLight };
}

/**
 * Create orbit controls with standard settings
 */
export function createOrbitControls(camera: any, domElement: HTMLElement) {
  if (!orbitControlsModule) {
    throw new Error('OrbitControls not loaded. Call getThreeInstance() first.');
  }

  const controls = new orbitControlsModule.OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 100;
  controls.maxPolarAngle = Math.PI;

  return controls;
}

/**
 * Check if Three.js is loaded
 */
export function isThreeLoaded(): boolean {
  return threeInstance !== null && orbitControlsModule !== null;
}