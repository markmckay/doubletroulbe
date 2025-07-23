import * as THREE from 'three';

export const createBoard = () => {
  console.log('🏁 [BoardCreation] Creating checkers board...');
  
  const boardGroup = new THREE.Group();
  
  // Board dimensions
  const squareSize = 1;
  const boardSize = 8;
  const boardThickness = 0.1;
  
  console.log('📏 [BoardCreation] Board dimensions - Size: 8x8, Square: 1x1, Thickness: 0.1');

  // Create board base
  const baseGeometry = new THREE.BoxGeometry(
    boardSize * squareSize + 0.4,
    boardThickness,
    boardSize * squareSize + 0.4
  );
  const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = -boardThickness / 2;
  base.receiveShadow = true;
  boardGroup.add(base);
  console.log('🟫 [BoardCreation] Board base created');

  // Create squares
  const lightMaterial = new THREE.MeshLambertMaterial({ color: 0xF5DEB3 });
  const darkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const squareGeometry = new THREE.BoxGeometry(squareSize, 0.05, squareSize);
      const isLight = (row + col) % 2 === 0;
      const material = isLight ? lightMaterial : darkMaterial;
      
      const square = new THREE.Mesh(squareGeometry, material);
      square.position.set(
        col * squareSize - (boardSize - 1) * squareSize / 2,
        0.025,
        row * squareSize - (boardSize - 1) * squareSize / 2
      );
      square.receiveShadow = true;
      
      // Store position data for interaction
      square.userData = { row, col, isSquare: true };
      
      boardGroup.add(square);
    }
  }
  
  console.log('🔲 [BoardCreation] 64 squares created with alternating colors');

  // Create border
  createBoardBorder(boardGroup, boardSize, squareSize);
  
  console.log('✅ [BoardCreation] Board creation complete');
  return boardGroup;
};

const createBoardBorder = (boardGroup, boardSize, squareSize) => {
  console.log('🖼️ [BoardCreation] Creating board border...');
  
  const borderHeight = 0.3;
  const borderWidth = 0.1;
  const borderMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
  
  const totalSize = boardSize * squareSize;
  const halfSize = totalSize / 2;
  
  // Create four border pieces
  const borders = [
    // Top border
    {
      geometry: new THREE.BoxGeometry(totalSize + borderWidth * 2, borderHeight, borderWidth),
      position: [0, borderHeight / 2, halfSize + borderWidth / 2]
    },
    // Bottom border
    {
      geometry: new THREE.BoxGeometry(totalSize + borderWidth * 2, borderHeight, borderWidth),
      position: [0, borderHeight / 2, -halfSize - borderWidth / 2]
    },
    // Left border
    {
      geometry: new THREE.BoxGeometry(borderWidth, borderHeight, totalSize),
      position: [-halfSize - borderWidth / 2, borderHeight / 2, 0]
    },
    // Right border
    {
      geometry: new THREE.BoxGeometry(borderWidth, borderHeight, totalSize),
      position: [halfSize + borderWidth / 2, borderHeight / 2, 0]
    }
  ];
  
  borders.forEach((border, index) => {
    const borderMesh = new THREE.Mesh(border.geometry, borderMaterial);
    borderMesh.position.set(...border.position);
    borderMesh.castShadow = true;
    borderMesh.receiveShadow = true;
    boardGroup.add(borderMesh);
  });
  
  console.log('✅ [BoardCreation] Border created with 4 pieces');
};