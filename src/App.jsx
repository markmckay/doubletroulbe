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

function App() {
  const [gameState, setGameState] = useState(() => ({
    ...initialGameState,
    pieces: createInitialPieces(),
  }));
  const [cameraUnlocked, setCameraUnlocked] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);

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
      if (forced.length && !forceCapturePieceIds.includes(found.id)) return;
      setSelectedId(found.id);
      setLegalMoves(getLegalMoves(found, pieces, forced.length > 0));
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
              setSelectedId(selectedPiece.id);
              setLegalMoves(furtherCaptures);
              return { ...newState, currentPlayer: state.currentPlayer }; // Don't switch player yet
            }
          }
          setSelectedId(null);
          setLegalMoves([]);
          return {
            ...newState,
            currentPlayer:
              state.currentPlayer === "red" ? "blue" : "red",
          };
        });
      }
    }
  };

  // Undo
  const handleUndo = () => {
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
          type: "camera",
          view,
          timestamp: new Date().toISOString(),
        },
      ],
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
        onCameraToggle={() => setCameraUnlocked((c) => !c)}
        cameraUnlocked={cameraUnlocked}
      />
      <CameraControls onPreset={handleCameraPreset} />
      <GameLogs logs={gameState.logs} />
    </div>
  );
}
export default App;