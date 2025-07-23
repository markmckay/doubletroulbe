import * as THREE from 'three';

let raycaster = null;
let mouse = null;
let currentScene = null;
let currentCamera = null;
let onPieceClick = null;
let onBoardClick = null;

export const setupMouseHandlers = (canvas, camera, scene, pieceClickHandler, boardClickHandler) => {
  console.log('🖱️ [MouseHandlers] Setting up mouse interaction...');
  
  // Initialize raycaster and mouse
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  
  // Store references
  currentScene = scene;
  currentCamera = camera;
  onPieceClick = pieceClickHandler;
  onBoardClick = boardClickHandler;
  
  // Add event listeners
  canvas.addEventListener('click', handleMouseClick);
  canvas.addEventListener('mousemove', handleMouseMove);
  
  console.log('✅ [MouseHandlers] Mouse handlers setup complete');
};

const handleMouseClick = (event) => {
  console.log('👆 [MouseHandlers] Mouse click detected');
  
  updateMousePosition(event);
  
  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, currentCamera);
  
  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(currentScene.children, true);
  
  if (intersects.length > 0) {
    const intersectedObject = findRelevantObject(intersects[0].object);
    
    if (intersectedObject) {
      const userData = intersectedObject.userData;
      console.log('🎯 [MouseHandlers] Object clicked:', userData);
      
      if (userData.isPiece) {
        console.log('♟️ [MouseHandlers] Piece clicked at:', { row: userData.row, col: userData.col });
        onPieceClick({ row: userData.row, col: userData.col });
      } else if (userData.isSquare) {
        console.log('🔲 [MouseHandlers] Square clicked at:', { row: userData.row, col: userData.col });
        onBoardClick({ row: userData.row, col: userData.col });
      }
    }
  } else {
    console.log('🌫️ [MouseHandlers] Click missed all objects');
  }
};

const handleMouseMove = (event) => {
  updateMousePosition(event);
  
  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, currentCamera);
  
  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(currentScene.children, true);
  
  // Reset all hover states
  resetHoverStates();
  
  if (intersects.length > 0) {
    const intersectedObject = findRelevantObject(intersects[0].object);
    
    if (intersectedObject && intersectedObject.userData.isPiece) {
      // Highlight hovered piece
      highlightHoveredPiece(intersectedObject);
    }
  }
};

const updateMousePosition = (event) => {
  const rect = event.target.getBoundingClientRect();
  
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
};

const findRelevantObject = (object) => {
  // Traverse up the object hierarchy to find the relevant parent
  let current = object;
  
  while (current) {
    if (current.userData && (current.userData.isPiece || current.userData.isSquare)) {
      return current;
    }
    current = current.parent;
  }
  
  return null;
};

const resetHoverStates = () => {
  // Reset all piece materials to their default state
  currentScene.traverse((child) => {
    if (child.isMesh && child.material && child.parent && child.parent.userData.isPiece) {
      if (child.material.emissive) {
        child.material.emissive.setHex(0x000000);
      }
    }
  });
};

const highlightHoveredPiece = (pieceObject) => {
  // Add subtle highlight to hovered piece
  pieceObject.traverse((child) => {
    if (child.isMesh && child.material && child.material.emissive) {
      child.material.emissive.setHex(0x222222);
    }
  });
};

export const addMoveIndicators = (validMoves, scene) => {
  console.log('🎯 [MouseHandlers] Adding move indicators for', validMoves.length, 'moves');
  
  validMoves.forEach(move => {
    const indicator = createMoveIndicator(move);
    scene.add(indicator);
  });
};

export const removeMoveIndicators = (scene) => {
  console.log('🧹 [MouseHandlers] Removing move indicators');
  
  const indicatorsToRemove = [];
  
  scene.traverse((child) => {
    if (child.userData && child.userData.isMoveIndicator) {
      indicatorsToRemove.push(child);
    }
  });
  
  indicatorsToRemove.forEach(indicator => {
    scene.remove(indicator);
  });
  
  console.log('✅ [MouseHandlers] Removed', indicatorsToRemove.length, 'move indicators');
};

const createMoveIndicator = (position) => {
  const geometry = new THREE.RingGeometry(0.3, 0.4, 16);
  const material = new THREE.MeshBasicMaterial({ 
    color: 0x00FF00, 
    transparent: true, 
    opacity: 0.8 
  });
  
  const indicator = new THREE.Mesh(geometry, material);
  indicator.rotation.x = -Math.PI / 2;
  indicator.position.set(
    position.col - 3.5,
    0.02,
    position.row - 3.5
  );
  
  indicator.userData = { isMoveIndicator: true };
  
  return indicator;
};