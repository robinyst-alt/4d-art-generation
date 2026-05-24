/**
 * Render Scene
 *
 * Three.js scene management for 4D Art rendering
 */

import * as THREE from 'three';

let sceneInstance = null;
let ambientLight = null;
let directionalLight = null;

/**
 * Create a new Three.js scene with default lighting
 * @param {THREE.Color|number|null} [background] - Optional background color
 * @returns {THREE.Scene} Three.js scene instance
 */
export function createScene(background = null) {
  sceneInstance = new THREE.Scene();

  if (background instanceof THREE.Color) {
    sceneInstance.background = background;
  } else if (background !== null) {
    sceneInstance.background = new THREE.Color(background);
  }
  // If background is null, scene has no background (transparent)

  ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  sceneInstance.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  sceneInstance.add(directionalLight);

  return sceneInstance;
}

/**
 * Add a points mesh to the scene
 * @param {THREE.Scene} scene - Three.js scene
 * @param {THREE.Points} points - Points object to add
 * @returns {THREE.Points} Added points object
 */
export function addMesh(scene, points) {
  if (scene && points) {
    scene.add(points);
  }
  return points;
}

/**
 * Update points geometry with new data
 * @param {THREE.Points} points - Points object
 * @param {Object} data - Object containing positions and colors Float32Arrays
 * @returns {boolean} Success status
 */
export function updateGeometry(points, data) {
  if (!points || !points.geometry) {
    return false;
  }

  if (!data) {
    return false;
  }

  if (data.positions) {
    points.geometry.setAttribute('position',
      new THREE.BufferAttribute(data.positions, 3));
  }

  if (data.colors) {
    points.geometry.setAttribute('color',
      new THREE.BufferAttribute(data.colors, 3));
  }

  points.geometry.attributes.position.needsUpdate = true;
  return true;
}

/**
 * Remove all points from scene, keeping lights
 * @param {THREE.Scene} scene - Three.js scene
 */
export function clearScene(scene) {
  if (!scene) return null;

  const toRemove = [];
  scene.traverse((child) => {
    if (child instanceof THREE.Points) {
      toRemove.push(child);
    }
  });

  toRemove.forEach((child) => {
    scene.remove(child);
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
  });

  return scene;
}

/**
 * Update scene lighting based on color theme
 * @param {THREE.Scene} scene - Three.js scene
 * @param {string} theme - Color theme name
 */
export function setSceneLighting(scene, theme) {
  const themes = {
    neon: { ambient: 0.4, directional: 0.8, color: 0x6366f1 },
    sketch: { ambient: 0.6, directional: 0.5, color: 0x374151 },
    firefly: { ambient: 0.3, directional: 0.9, color: 0xfbbf24 },
    aurora: { ambient: 0.35, directional: 0.85, color: 0x10b981 },
    cyberpunk: { ambient: 0.25, directional: 0.95, color: 0x00ffff }
  };

  const settings = themes[theme] || themes.neon;

  if (ambientLight) {
    ambientLight.intensity = settings.ambient;
  }
  if (directionalLight) {
    directionalLight.intensity = settings.directional;
    directionalLight.color.setHex(settings.color);
  }
}

/**
 * Get the scene instance
 * @returns {THREE.Scene|null}
 */
export function getScene() {
  return sceneInstance;
}

/**
 * Create a 3D axis indicator widget
 * Creates a small coordinate system with x, y, z axes as arrows
 * Only axes in "free" mode (not slice) are displayed
 * Uses grayscale coloring for all axes
 * @param {number} size - Size of the axis indicator
 * @param {string[]} freeAxes - Array of axis names in free mode (e.g., ['x', 'y', 'z'])
 * @returns {THREE.Group} Group containing the axis lines
 */
export function createAxisIndicator(size = 1, freeAxes = ['x', 'y', 'z']) {
  const group = new THREE.Group();

  // Create arrow for each axis that is in free mode (camera axes)
  // Per PRD F-108: 显示相机轴（非锁定的轴），数量动态显示
  // 当锁定=0时显示XYZW四轴，锁定=1时显示XYZ三轴
  const axisConfigs = [
    { name: 'x', direction: new THREE.Vector3(1, 0, 0) },
    { name: 'y', direction: new THREE.Vector3(0, 1, 0) },
    { name: 'z', direction: new THREE.Vector3(0, 0, 1) },
    // W axis: perpendicular to XYZ, shown as a smaller indicator
    // Represents the 4th dimension in the visualization
    { name: 'w', direction: new THREE.Vector3(-0.5, -0.5, -0.5), isW: true }
  ];

  // Filter to only free (camera) axes
  const visibleAxes = axisConfigs.filter(axis => freeAxes.includes(axis.name));

  visibleAxes.forEach(({ name, direction, isW }) => {
    const axisSize = isW ? size * 0.6 : size; // W appears smaller as it's conceptual
    const lineWidth = isW ? size * 0.08 : size * 0.1; // Line thickness relative to size

    // Create line geometry (use tube/cylinder for proper thickness scaling)
    const points = [
      new THREE.Vector3(0, 0, 0),
      direction.clone().normalize().multiplyScalar(axisSize)
    ];
    const lineGeometry = new THREE.TubeGeometry(
      new THREE.LineCurve3(points[0], points[1]),
      8, // tubular segments
      lineWidth, // radius for tube (thickness)
      8, // radial segments
      false
    );
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    group.add(line);

    // Create arrow head (smaller for W axis)
    const arrowLength = axisSize * 0.15;
    const arrowWidth = axisSize * 0.08;
    const arrowGeom = new THREE.ConeGeometry(arrowWidth, arrowLength, 8);
    const arrowMaterial = new THREE.MeshBasicMaterial();
    arrowMaterial.color.setHex(0xcccccc);
    const arrowMesh = new THREE.Mesh(arrowGeom, arrowMaterial);

    // Position arrow at the end of the line
    arrowMesh.position.copy(direction.clone().normalize().multiplyScalar(axisSize - arrowLength * 0.5));

    // Orient arrow to point along the axis direction
    if (name === 'x') {
      arrowMesh.rotation.z = -Math.PI / 2;
    } else if (name === 'z') {
      arrowMesh.rotation.x = Math.PI / 2;
    } else if (name === 'w') {
      // W points diagonally - orient appropriately
      arrowMesh.rotation.set(Math.PI / 4, Math.PI / 4, 0);
    }
    // 'y' default orientation is already pointing up

    group.add(arrowMesh);

    // Create label sprite for axis
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#cccccc';
    ctx.font = `bold ${Math.round(40 * (size / 1.5))}px Arial`; // Scale font with size
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.toUpperCase(), 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(direction.clone().normalize().multiplyScalar(axisSize * 1.2));
    // Scale sprite text with size (base size 0.2 at size 1.5)
    const textScale = 0.2 * (size / 1.5);
    sprite.scale.set(textScale, textScale, textScale);
    group.add(sprite);
  });

  return group;
}

/**
 * Add an axis indicator to the scene
 * @param {THREE.Scene} scene - Three.js scene
 * @param {THREE.Group} axisGroup - Axis indicator group
 */
export function addAxisIndicator(scene, axisGroup) {
  if (scene && axisGroup) {
    scene.add(axisGroup);
  }
}