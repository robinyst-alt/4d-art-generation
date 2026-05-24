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
 * Dynamic axis direction assignment for orthogonality
 * @param {number} size - Size of the axis indicator
 * @param {string[]} freeAxes - Array of axis names in free mode (e.g., ['x', 'y', 'z'])
 * @returns {THREE.Group} Group containing the axis lines
 */
export function createAxisIndicator(size = 1, freeAxes = ['x', 'y', 'z']) {
  const group = new THREE.Group();

  // Standard basis vectors as "seats" - fixed directional seats
  // Each axis claims a seat when it becomes free, and keeps it until it becomes slice
  const SEATS = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1)
  ];

  // Track which seats are occupied by which axes
  // This persists across calls to maintain stability when axes change mode
  if (!createAxisIndicator.seatAssignments) {
    createAxisIndicator.seatAssignments = {};
  }

  // For each free axis, find the first available seat
  freeAxes.forEach(axisName => {
    let assigned = false;

    // Check if this axis already has a seat (persist across calls)
    const existingSeatIndex = Object.entries(createAxisIndicator.seatAssignments)
      .find(([axis, seatIdx]) => axis === axisName)?.[1];

    if (existingSeatIndex !== undefined) {
      // This axis already has a seat - check if it's still valid
      const seatTakenByAnother = Object.entries(createAxisIndicator.seatAssignments)
        .some(([axis, seatIdx]) => axis !== axisName && seatIdx === existingSeatIndex);

      if (!seatTakenByAnother) {
        // Seat is still valid and unoccupied by others
        assigned = true;
      }
    }

    // If no existing valid seat, find first available seat
    if (!assigned) {
      for (let i = 0; i < SEATS.length; i++) {
        const seatTaken = Object.entries(createAxisIndicator.seatAssignments)
          .some(([axis, seatIdx]) => axis !== axisName && seatIdx === i);

        if (!seatTaken) {
          // Claim this seat
          createAxisIndicator.seatAssignments[axisName] = i;
          assigned = true;
          break;
        }
      }
    }

    // Clean up seats for axes that are no longer free
    Object.keys(createAxisIndicator.seatAssignments).forEach(axis => {
      if (!freeAxes.includes(axis)) {
        delete createAxisIndicator.seatAssignments[axis];
      }
    });
  });

  // Create axis lines with labels
  freeAxes.forEach(axisName => {
    const seatIndex = createAxisIndicator.seatAssignments[axisName];
    const direction = seatIndex !== undefined ? SEATS[seatIndex].clone() : new THREE.Vector3(1, 0, 0);
    const axisSize = size * 0.8;

    // Line from origin to direction
    const lineEnd = direction.clone().normalize().multiplyScalar(axisSize);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      lineEnd
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    group.add(line);

    // Arrow head (cone)
    const arrowLength = 0.12;
    const arrowWidth = arrowLength * 0.5;
    const coneGeometry = new THREE.ConeGeometry(arrowWidth, arrowLength, 8);
    const coneMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    const arrowMesh = new THREE.Mesh(coneGeometry, coneMaterial);

    // Position arrow at end of line
    const arrowPos = lineEnd.clone().normalize().multiplyScalar(axisSize - arrowLength * 0.5);
    arrowMesh.position.copy(arrowPos);

    // Orient arrow tip (+Y of cone) along direction using quaternion
    // ConeGeometry tip points at +Y by default
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    arrowMesh.quaternion.copy(quaternion);

    group.add(arrowMesh);

    // Label sprite
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#cccccc';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(axisName.toUpperCase(), 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(lineEnd.clone().normalize().multiplyScalar(axisSize * 1.2));
    sprite.scale.set(0.2, 0.2, 0.2);
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