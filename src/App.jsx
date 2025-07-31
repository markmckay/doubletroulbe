import React, { useState, useMemo } from "react";
import Board3D from "./components/Board3D.jsx";
import UIOverlay from "./components/UIOverlay.jsx";
import CameraControls from "./components/CameraControls.jsx";
import GameLogs from "./components/GameLogs.jsx";
import { initialGameState } from "./game/gameConstants.js";
import {
  createInitialPieces,
  getLegalMoves,
  movePiece,
  getForcedMoves,
  undo,
} from "./game/gameLogic.js";
import "./App.css";

// Logging utility
function addLog(gameState, logEntry) {
  return {
    ...gameState,
    logs: [...gameState.logs, {
      ...logEntry,
      timestamp: new Date().toISOString(),
    }]
  };
}

function App() {
  console.log("App component rendering...");
  
  const [gameState, setGameState] = useState(() => {
    console.log("Initializing game state...");
    try {
      const pieces = createInitialPieces();
      console.log("Created pieces:", pieces);
      return {
        ...initialGameState,
        pieces,
      };
    } catch (error) {
      console.error("Error creating initial pieces:", error);
      return {
        ...initialGameState,
        pieces: [],
      };
    }
  });
  
  const [cameraUnlocked, setCameraUnlocked] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [cameraPreset, setCameraPreset] = useState("angle");

  // Log game start
  React.useEffect(() => {
    try {
      console.log("Adding game start log...");
      setGameState(state => addLog(state, {
        type: "game_start",
        initialPieceCounts: { 
          red: state.pieces.filter(p => p.color === "red").length,
          blue: state.pieces.filter(p => p.color === "blue").length
        },
        boardSetup: "double_level_checkers"
      }));
    } catch (error) {
      console.error("Error adding game start log:", error);
    }
  }, []);

  // Calculate legal moves for selected
  const pieces = gameState.pieces;
  const selectedPiece = selectedId
    ? pieces.find((p) => p.id === selectedId)
    : null;

  // Forced capture check
  const forced = useMemo(
    () => {
      try {
        return getForcedMoves(pieces, gameState.currentPlayer);
      } catch (error) {
        console.error("Error getting forced moves:", error);
        return [];
      }
    },
    [pieces, gameState.currentPlayer]
  );
  const forceCapturePieceIds = forced.flatMap((f) => f.piece?.id).filter(Boolean);

  // On board square or piece click/tap
  const handleSquareClick = ({ x, z, yLevel }) => {
    try {
    console.log("Square clicked:", { x, z, yLevel });
    if (gameState.winner) return;
    
    // Log click/tap interaction
    setGameState(state => addLog(state, {
      type: "interaction",
      action: "square_click",
      position: { x, z, yLevel },
      currentPlayer: state.currentPlayer,
      selectedPiece: selectedId
    }));
    
    // Select piece
    const found = pieces.find(
      (p) =>
        p.x === x &&
        p.z === z &&
        p.yLevel === yLevel &&
        p.color === gameState.currentPlayer
    );
    if (found) {
      // Can't select if not a forced piece (when capture required)
      if (forced.length && !forceCapturePieceIds.includes(found.id)) {
        setGameState(state => addLog(state, {
          type: "interaction",
          action: "invalid_selection",
          reason: "forced_capture_available",
          pieceId: found.id,
          forcedPieces: forceCapturePieceIds
        }));
        return;
      }
      
      setSelectedId(found.id);
      setLegalMoves(getLegalMoves(found, pieces, forced.length > 0));
      
      setGameState(state => addLog(state, {
        type: "interaction",
        action: "piece_selected",
        pieceId: found.id,
        pieceType: found.type,
        pieceColor: found.color,
        position: { x: found.x, z: found.z, yLevel: found.yLevel },
        legalMovesCount: getLegalMoves(found, pieces, forced.length > 0).length,
        isForcedCapture: forced.length > 0
      }));
      return;
    }
    
    // If selected, check if move is valid
    if (selectedPiece && legalMoves.length) {
      const move = legalMoves.find(
        (m) => m.x === x && m.z === z && m.yLevel === yLevel
      );
      if (move) {
        setGameState((state) => {
          let newState = movePiece(state, selectedPiece, move);
          if (move.captured) {
            const tempPiece = {
              ...selectedPiece,
              x: move.x,
              z: move.z,
              yLevel: move.yLevel,
              isKing:
                selectedPiece.isKing ||
                false, // Will be handled in movePiece function
            };
            const furtherCaptures = getLegalMoves(
              tempPiece,
              newState.pieces,
              true
            );
            if (furtherCaptures.length) {
              // Log multi-jump opportunity
              newState = addLog(newState, {
                type: "interaction",
                action: "multi_jump_available",
                pieceId: selectedPiece.id,
                additionalCapturesCount: furtherCaptures.length
              });
              
              setSelectedId(selectedPiece.id);
              setLegalMoves(furtherCaptures);
              return { ...newState, currentPlayer: state.currentPlayer }; // Don't switch player yet
            }
          }
          
          // Log turn change
          const nextPlayer = state.currentPlayer === "red" ? "blue" : "red";
          newState = addLog(newState, {
            type: "turn_change",
            from: state.currentPlayer,
            to: nextPlayer,
            moveNumber: newState.logs.filter(l => l.type === "move").length
          });
          
          setSelectedId(null);
          setLegalMoves([]);
          return {
            ...newState,
            currentPlayer: nextPlayer,
          };
        });
      } else {
        // Log invalid move attempt
        setGameState(state => addLog(state, {
          type: "interaction",
          action: "invalid_move",
          attemptedPosition: { x, z, yLevel },
          selectedPiece: selectedId,
          reason: "not_legal_move"
        }));
      }
    }
    } catch (error) {
      console.error("Error in handleSquareClick:", error);
    }
  };

  // Undo
  const handleUndo = () => {
    try {
    setGameState(state => {
      const newState = undo(state);
      return addLog(newState, {
        type: "interaction",
        action: "undo",
        undoStackSize: state.undoStack.length,
        restoredToMove: newState.logs.filter(l => l.type === "move").length
      });
    });
    setSelectedId(null);
    setLegalMoves([]);
    } catch (error) {
      console.error("Error in handleUndo:", error);
    }
  };

  // Camera presets (stub)
  const handleCameraPreset = (preset) => {
    try {
      console.log("Camera preset changed to:", preset);
      setCameraPreset(preset);
      setGameState((state) => addLog(state, {
        type: "interaction",
        action: "camera_preset",
        view: preset,
        previousView: cameraPreset
      }));
    } catch (error) {
      console.error("Error in handleCameraPreset:", error);
    }
  };
  
  // Camera toggle
  const handleCameraToggle = () => {
    try {
    const newUnlocked = !cameraUnlocked;
    setCameraUnlocked(newUnlocked);
    setGameState(state => addLog(state, {
      type: "interaction",
      action: "camera_toggle",
      cameraUnlocked: newUnlocked
    }));
    } catch (error) {
      console.error("Error in handleCameraToggle:", error);
    }
  };

  console.log("Rendering App with pieces:", pieces.length);

  if (!pieces || pieces.length === 0) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Loading game...</h1>
        <p>Initializing pieces and board...</p>
      </div>
    );
  }

  return (
    <div className="app-root">
      <Board3D
        pieces={pieces}
        selectedId={selectedId}
        legalMoves={legalMoves}
        onSquareClick={handleSquareClick}
        cameraUnlocked={cameraUnlocked}
        cameraPreset={cameraPreset}
      />
      <UIOverlay
        gameState={gameState}
        onUndo={handleUndo}
        onCameraToggle={handleCameraToggle}
        cameraUnlocked={cameraUnlocked}
      />
      <CameraControls 
        onPreset={handleCameraPreset} 
        disabled={gameState.winner !== null}
      />
      <GameLogs logs={gameState.logs} />
    </div>
  );
}

export default App;