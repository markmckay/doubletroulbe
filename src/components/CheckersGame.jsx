import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { initializeGame, makeMove, isValidMove, getValidMoves } from '../utils/gameLogic';
import { makeAIMove } from '../utils/aiLogic';
import './CheckersGame.css';

// Simple test cube component to verify Canvas is working
const TestCube = () => {
  console.log('🧊 [TestCube] Rendering test cube...');
  
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

const CheckersGame = () => {
  console.log('🎮 [CheckersGame] Component initializing...');
  
  // Game state
  const [gameState, setGameState] = useState(() => {
    console.log('🎲 [CheckersGame] Initializing game state...');
    return initializeGame();
  });
  
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [gameMode, setGameMode] = useState('pvp'); // 'pvp' or 'pvc'
  const [difficulty, setDifficulty] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);

  console.log('🎮 [CheckersGame] Rendering with game state:', gameState);

  return (
    <div className="checkers-game">
      <div className="game-header">
        <h1>🏁 3D Checkers</h1>
        <div className="game-controls">
          <button className="mode-button">
            {gameMode === 'pvp' ? '👥 Player vs Player' : '🤖 Player vs Computer'}
          </button>
          <button className="reset-button">
            🔄 Reset Game
          </button>
        </div>
      </div>

      <div className="game-info">
        <div className="current-player">
          Current Player: 
          <span className={`player-indicator ${gameState.currentPlayer}`}>
            {gameState.currentPlayer === 'red' ? '🔴 Red' : '⚫ Black'}
          </span>
        </div>
        
        <div className="game-stats">
          <span>Red Pieces: {gameState.redPieces}</span>
          <span>Black Pieces: {gameState.blackPieces}</span>
        </div>
      </div>

      <div className="game-canvas">
        <Canvas
          camera={{ position: [0, 5, 5], fov: 75 }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          <TestCube />
          
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
};

export default CheckersGame;