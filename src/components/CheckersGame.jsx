import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { initializeGame, makeMove, isValidMove, getValidMoves } from '../utils/gameLogic';
import { makeAIMove } from '../utils/aiLogic';
import Board3D from './Board3D';
import './CheckersGame.css';

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

  // Handle AI moves
  useEffect(() => {
    if (gameMode === 'pvc' && gameState.currentPlayer === 'black' && !gameState.gameOver) {
      console.log('🤖 [CheckersGame] AI turn starting...');
      setIsLoading(true);
      
      setTimeout(() => {
        const aiMove = makeAIMove(gameState, difficulty);
        if (aiMove) {
          console.log('🎯 [CheckersGame] AI making move:', aiMove);
          const newGameState = makeMove(gameState, aiMove.from, aiMove.to);
          setGameState(newGameState);
        }
        setIsLoading(false);
      }, 500); // Small delay for better UX
    }
  }, [gameState.currentPlayer, gameMode, difficulty, gameState.gameOver]);

  const handlePieceClick = (piecePosition) => {
    console.log('👆 [CheckersGame] Piece clicked at:', piecePosition);
    
    if (gameMode === 'pvc' && gameState.currentPlayer === 'black') {
      console.log('⏳ [CheckersGame] AI turn - ignoring player input');
      return;
    }

    const piece = gameState.board[piecePosition.row][piecePosition.col];
    
    if (piece && piece.color === gameState.currentPlayer) {
      console.log('✅ [CheckersGame] Valid piece selected:', piece);
      setSelectedPiece(piecePosition);
      const moves = getValidMoves(gameState.board, piecePosition.row, piecePosition.col);
      setValidMoves(moves);
      console.log('🎯 [CheckersGame] Valid moves:', moves);
    } else if (selectedPiece) {
      // Try to move to this position
      handleMove(piecePosition);
    }
  };

  const handleBoardClick = (position) => {
    console.log('🎯 [CheckersGame] Board clicked at:', position);
    
    if (selectedPiece) {
      handleMove(position);
    }
  };

  const handleMove = (targetPosition) => {
    if (!selectedPiece) return;

    console.log('🚀 [CheckersGame] Attempting move from', selectedPiece, 'to', targetPosition);
    
    if (isValidMove(gameState.board, selectedPiece.row, selectedPiece.col, targetPosition.row, targetPosition.col)) {
      console.log('✅ [CheckersGame] Valid move confirmed');
      const newGameState = makeMove(gameState, selectedPiece, targetPosition);
      setGameState(newGameState);
      setSelectedPiece(null);
      setValidMoves([]);
      
      console.log('🎮 [CheckersGame] Move completed. New turn:', newGameState.currentPlayer);
    } else {
      console.log('❌ [CheckersGame] Invalid move attempted');
      setSelectedPiece(null);
      setValidMoves([]);
    }
  };

  const resetGame = () => {
    console.log('🔄 [CheckersGame] Resetting game...');
    const newGameState = initializeGame();
    setGameState(newGameState);
    setSelectedPiece(null);
    setValidMoves([]);
    
    console.log('✅ [CheckersGame] Game reset complete');
  };

  const toggleGameMode = () => {
    const newMode = gameMode === 'pvp' ? 'pvc' : 'pvp';
    console.log('🔄 [CheckersGame] Switching game mode to:', newMode);
    setGameMode(newMode);
    resetGame();
  };

  const changeDifficulty = (newDifficulty) => {
    console.log('🎚️ [CheckersGame] Changing difficulty to:', newDifficulty);
    setDifficulty(newDifficulty);
  };

  return (
    <div className="checkers-game">
      <div className="game-header">
        <h1>🏁 3D Checkers</h1>
        <div className="game-controls">
          <button onClick={toggleGameMode} className="mode-button">
            {gameMode === 'pvp' ? '👥 Player vs Player' : '🤖 Player vs Computer'}
          </button>
          
          {gameMode === 'pvc' && (
            <div className="difficulty-controls">
              <label>Difficulty:</label>
              <select 
                value={difficulty} 
                onChange={(e) => changeDifficulty(e.target.value)}
                className="difficulty-select"
              >
                <option value="easy">😊 Easy</option>
                <option value="medium">😐 Medium</option>
                <option value="hard">😤 Hard</option>
              </select>
            </div>
          )}
          
          <button onClick={resetGame} className="reset-button">
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
          {isLoading && <span className="loading">🤖 AI thinking...</span>}
        </div>
        
        <div className="game-stats">
          <span>Red Pieces: {gameState.redPieces}</span>
          <span>Black Pieces: {gameState.blackPieces}</span>
        </div>
        
        {gameState.gameOver && (
          <div className="game-over">
            🎉 Game Over! Winner: {gameState.winner}
          </div>
        )}
      </div>

      <div className="game-canvas">
        <Canvas
          camera={{ position: [0, 8, 8], fov: 60 }}
          style={{ width: '100%', height: '100%' }}
          shadows
        >
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1} 
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#4a90e2" />
          
          <Board3D 
            gameState={gameState}
            selectedPiece={selectedPiece}
            validMoves={validMoves}
            onPieceClick={handlePieceClick}
            onBoardClick={handleBoardClick}
          />
          
          <OrbitControls 
            enablePan={false}
            minDistance={5}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default CheckersGame;