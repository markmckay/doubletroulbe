import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Board3D = ({ gameState, selectedPiece, validMoves, onPieceClick, onBoardClick }) => {
  console.log('🏁 [Board3D] Rendering 3D board...');
  
  const boardRef = useRef();
  
  // Board dimensions
  const squareSize = 1;
  const boardSize = 8;
  
  // Handle clicks
  const handleClick = (event, row, col) => {
    event.stopPropagation();
    const piece = gameState.board[row][col];
    
    if (piece) {
      onPieceClick({ row, col });
    } else {
      onBoardClick({ row, col });
    }
  };

  // Create board squares
  const renderSquares = () => {
    const squares = [];
    
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const isLight = (row + col) % 2 === 0;
        const x = col * squareSize - (boardSize - 1) * squareSize / 2;
        const z = row * squareSize - (boardSize - 1) * squareSize / 2;
        
        squares.push(
          <mesh
            key={`square-${row}-${col}`}
            position={[x, 0.025, z]}
            onClick={(e) => handleClick(e, row, col)}
            receiveShadow
          >
            <boxGeometry args={[squareSize, 0.05, squareSize]} />
            <meshLambertMaterial color={isLight ? '#F5DEB3' : '#8B4513'} />
          </mesh>
        );
      }
    }
    
    return squares;
  };

  // Create pieces
  const renderPieces = () => {
    const pieces = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameState.board[row][col];
        if (piece) {
          const x = col * squareSize - (boardSize - 1) * squareSize / 2;
          const z = row * squareSize - (boardSize - 1) * squareSize / 2;
          const isSelected = selectedPiece && selectedPiece.row === row && selectedPiece.col === col;
          
          pieces.push(
            <group key={`piece-${row}-${col}`} position={[x, 0.15, z]}>
              <mesh
                onClick={(e) => handleClick(e, row, col)}
                castShadow
                receiveShadow
              >
                <cylinderGeometry args={[0.35, 0.35, 0.15, 16]} />
                <meshLambertMaterial 
                  color={piece.color === 'red' ? '#CC0000' : '#333333'}
                  emissive={isSelected ? '#444444' : '#000000'}
                />
              </mesh>
              
              {piece.isKing && (
                <group position={[0, 0.15, 0]}>
                  <mesh castShadow>
                    <cylinderGeometry args={[0.25, 0.3, 0.08, 8]} />
                    <meshLambertMaterial color="#FFD700" />
                  </mesh>
                  {/* Crown points */}
                  {[
                    [0.2, 0.1, 0], [-0.2, 0.1, 0], [0, 0.1, 0.2], [0, 0.1, -0.2],
                    [0.14, 0.1, 0.14], [-0.14, 0.1, 0.14], [0.14, 0.1, -0.14], [-0.14, 0.1, -0.14]
                  ].map((pos, i) => (
                    <mesh key={i} position={pos} castShadow>
                      <coneGeometry args={[0.05, 0.15, 6]} />
                      <meshLambertMaterial color="#FFD700" />
                    </mesh>
                  ))}
                </group>
              )}
            </group>
          );
        }
      }
    }
    
    return pieces;
  };

  // Create move indicators
  const renderMoveIndicators = () => {
    return validMoves.map((move, index) => {
      const x = move.col * squareSize - (boardSize - 1) * squareSize / 2;
      const z = move.row * squareSize - (boardSize - 1) * squareSize / 2;
      
      return (
        <mesh
          key={`move-${index}`}
          position={[x, 0.02, z]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={(e) => handleClick(e, move.row, move.col)}
        >
          <ringGeometry args={[0.3, 0.4, 16]} />
          <meshBasicMaterial color="#00FF00" transparent opacity={0.8} />
        </mesh>
      );
    });
  };

  return (
    <group ref={boardRef}>
      {/* Board base */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[boardSize * squareSize + 0.4, 0.1, boardSize * squareSize + 0.4]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Board border */}
      <group>
        {/* Top border */}
        <mesh position={[0, 0.15, 4.05]} castShadow receiveShadow>
          <boxGeometry args={[8.2, 0.3, 0.1]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
        {/* Bottom border */}
        <mesh position={[0, 0.15, -4.05]} castShadow receiveShadow>
          <boxGeometry args={[8.2, 0.3, 0.1]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
        {/* Left border */}
        <mesh position={[-4.05, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.3, 8]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
        {/* Right border */}
        <mesh position={[4.05, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.3, 8]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
      </group>
      
      {/* Squares */}
      {renderSquares()}
      
      {/* Pieces */}
      {renderPieces()}
      
      {/* Move indicators */}
      {renderMoveIndicators()}
    </group>
  );
};

export default Board3D;