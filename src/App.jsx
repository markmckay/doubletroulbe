import React, { useState, useMemo } from "react";
import Board3D from "./components/Board3D.jsx";
import UIOverlay from "./components/UIOverlay";
import CameraControls from "./components/CameraControls";
import GameLogs from "./components/GameLogs";
import { initialGameState } from "./game/gameConstants";
import {
  createInitialPieces,
  getLegalMoves,
  movePiece,
  getForcedMoves,
  undo,
} from "./game/gameLogic";
import "./styles.css";

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
  const [gameState, setGameState] = useState(() => ({
    ...initialGameState,
    pieces: createInitialPieces(),
  }));
  const [cameraUnlocked, setCameraUnlocked] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);

  // Log game start
  React.useEffect(() => {
    setGameState(state => addLog(state, {
      type: "game_start",
      initialPieceCounts: { 
        red: state.pieces.filter(p => p.color === "red").length,
        blue: state.pieces.filter(p => p.color === "blue").length
      },
      boardSetup: "double_level_checkers"
    }));
  }, []);

  // Calculate legal moves for selected
  const pieces = gameState.pieces;
  const selectedPiece = selectedId
    ? pieces.find((p) => p.id === selectedId)
    : null;

  // Forced capture check
  const forced = useMemo(
    () => getForcedMoves(pieces, gameState.currentPlayer),
    [pieces, gameState.currentPlayer]
  );
  const forceCapturePieceIds = forced.flatMap((f) => f.piece.id);

  // On board square or piece click/tap
  const handleSquareClick = ({ x, z, yLevel }) => {
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
                (movePiece.shouldKing && movePiece.shouldKing(selectedPiece)),
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
  };

  // Undo
  const handleUndo = () => {
    setGameState(state => {
      const newState = undo(state);
      return addLog(newState, {
        type: "interaction",
        action: "undo",
        undoStackSize: state.undoStack.length,
        restoredToMove: newState.logs.filter(l => l.type === "move").length
      });
    });
    setGameState((state) => undo(state));
    setSelectedId(null);
    setLegalMoves([]);
  };

  // Camera presets (stub)
  const handleCameraPreset = (view) => {
    setGameState((state) => ({
      ...state,
      logs: [
        ...state.logs,
        {
          type: "interaction",
          action: "camera_preset",
          view,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  };
  
  // Camera toggle
  const handleCameraToggle = () => {
    const newUnlocked = !cameraUnlocked;
    setCameraUnlocked(newUnlocked);
    setGameState(state => addLog(state, {
      type: "interaction",
      action: "camera_toggle",
      cameraUnlocked: newUnlocked
    }));
  };

  return (
    <div className="app-root">
      <Board3D
        pieces={pieces}
        selectedId={selectedId}
        legalMoves={legalMoves}
        onSquareClick={handleSquareClick}
        cameraUnlocked={cameraUnlocked}
      />
      <UIOverlay
        gameState={gameState}
        onUndo={handleUndo}
        onCameraToggle={handleCameraToggle}
        cameraUnlocked={cameraUnlocked}
      />
      <CameraControls onPreset={handleCameraPreset} />
      <GameLogs logs={gameState.logs} />
    </div>
  );
}
export default App;