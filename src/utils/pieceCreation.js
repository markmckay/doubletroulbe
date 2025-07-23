import * as THREE from 'three';

export const createPieces = (board) => {
  console.log('♟️ [PieceCreation] Creating game pieces...');
  
  const pieces = [];
  const squareSize = 1;
  
  // Materials for pieces
  const redMaterial = new THREE.MeshLambertMaterial({ color: 0xCC0000 });
  const blackMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const goldMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
  
  console.log('🎨 [PieceCreation] Materials created - Red, Black, Gold');

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const pieceGroup = createPiece(piece, redMaterial, blackMaterial, goldMaterial);
        
        // Position the piece
        pieceGroup.position.set(
          col * squareSize - 3.5 * squareSize,
          0.15,
          row * squareSize - 3.5 * squareSize
        );
        
        // Store piece data
        pieceGroup.userData = {
          row,
          col,
          color: piece.color,
          isKing: piece.isKing,
          isPiece: true
        };
        
        pieces.push(pieceGroup);
        console.log(`🔴 [PieceCreation] Created ${piece.color} ${piece.isKing ? 'king' : 'piece'} at (${row}, ${col})`);
      }
    }
  }
  
  console.log(`✅ [PieceCreation] Created ${pieces.length} pieces total`);
  return pieces;
};

const createPiece = (piece, redMaterial, blackMaterial, goldMaterial) => {
  const pieceGroup = new THREE.Group();
  
  // Main piece geometry
  const pieceGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 16);
  const material = piece.color === 'red' ? redMaterial : blackMaterial;
  
  const pieceMesh = new THREE.Mesh(pieceGeometry, material);
  pieceMesh.castShadow = true;
  pieceMesh.receiveShadow = true;
  pieceGroup.add(pieceMesh);
  
  // Add crown for kings
  if (piece.isKing) {
    const crown = createCrown(goldMaterial);
    crown.position.y = 0.15;
    pieceGroup.add(crown);
    console.log('👑 [PieceCreation] Crown added to king piece');
  }
  
  return pieceGroup;
};

const createCrown = (goldMaterial) => {
  const crownGroup = new THREE.Group();
  
  // Crown base
  const baseGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.08, 8);
  const baseMesh = new THREE.Mesh(baseGeometry, goldMaterial);
  baseMesh.castShadow = true;
  crownGroup.add(baseMesh);
  
  // Crown points
  const pointGeometry = new THREE.ConeGeometry(0.05, 0.15, 6);
  const positions = [
    [0.2, 0.1, 0],
    [-0.2, 0.1, 0],
    [0, 0.1, 0.2],
    [0, 0.1, -0.2],
    [0.14, 0.1, 0.14],
    [-0.14, 0.1, 0.14],
    [0.14, 0.1, -0.14],
    [-0.14, 0.1, -0.14]
  ];
  
  positions.forEach(pos => {
    const point = new THREE.Mesh(pointGeometry, goldMaterial);
    point.position.set(...pos);
    point.castShadow = true;
    crownGroup.add(point);
  });
  
  return crownGroup;
};

export const updatePiecePositions = (pieces, board, scene) => {
  console.log('🔄 [PieceCreation] Updating piece positions...');
  
  const squareSize = 1;
  let activePieces = 0;
  
  // Remove all existing pieces from scene
  pieces.forEach(piece => {
    scene.remove(piece);
  });
  
  // Clear pieces array
  pieces.length = 0;
  
  // Create new pieces based on current board state
  const redMaterial = new THREE.MeshLambertMaterial({ color: 0xCC0000 });
  const blackMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const goldMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const pieceGroup = createPiece(piece, redMaterial, blackMaterial, goldMaterial);
        
        // Position the piece
        pieceGroup.position.set(
          col * squareSize - 3.5 * squareSize,
          0.15,
          row * squareSize - 3.5 * squareSize
        );
        
        // Store piece data
        pieceGroup.userData = {
          row,
          col,
          color: piece.color,
          isKing: piece.isKing,
          isPiece: true
        };
        
        pieces.push(pieceGroup);
        scene.add(pieceGroup);
        activePieces++;
      }
    }
  }
  
  console.log(`✅ [PieceCreation] Updated positions for ${activePieces} pieces`);
};

export const highlightPiece = (piece, highlight = true) => {
  if (!piece) return;
  
  const material = piece.children[0].material;
  if (highlight) {
    material.emissive.setHex(0x444444);
    console.log('✨ [PieceCreation] Piece highlighted');
  } else {
    material.emissive.setHex(0x000000);
    console.log('🔄 [PieceCreation] Piece highlight removed');
  }
};

export const createMoveIndicator = (position) => {
  console.log('🎯 [PieceCreation] Creating move indicator at:', position);
  
  const geometry = new THREE.RingGeometry(0.4, 0.5, 16);
  const material = new THREE.MeshBasicMaterial({ 
    color: 0x00FF00, 
    transparent: true, 
    opacity: 0.7 
  });
  
  const indicator = new THREE.Mesh(geometry, material);
  indicator.rotation.x = -Math.PI / 2;
  indicator.position.set(
    position.col - 3.5,
    0.01,
    position.row - 3.5
  );
  
  indicator.userData = { isMoveIndicator: true };
  
  return indicator;
};