import { BOARD_SIZE, BOARD_LEVELS } from "./gameConstants";

// 1. Create initial pieces (all on dark squares, triangle in back row)
export function createInitialPieces() {
  const pieces = [];
  // Red regular (bottom board, yLevel 0)
  let redCount = 0;
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let z = 0; z < 3; z++) {
      if ((x + z) % 2 === 1 && redCount < 11) {
        pieces.push({
          id: `r${x}${z}`,
          type: "regular",
          color: "red",
          x,
          z,
          yLevel: 0,
          isKing: false,
        });
        redCount++;
      }
    }
  }
  // Red triangle (center of back row)
  pieces.push({
    id: "rt",
    type: "triangle",
    color: "red",
    x: 3,
    z: 0,
    yLevel: 0,
    isKing: false,
  });

  // Blue regular (top board, yLevel 5)
  let blueCount = 0;
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let z = BOARD_SIZE - 3; z < BOARD_SIZE; z++) {
      if ((x + z) % 2 === 1 && blueCount < 11) {
        pieces.push({
          id: `b${x}${z}`,
          type: "regular",
          color: "blue",
          x,
          z,
          yLevel: 5,
          isKing: false,
        });
        blueCount++;
      }
    }
  }
  // Blue triangle (center of back row)
  pieces.push({
    id: "bt",
    type: "triangle",
    color: "blue",
    x: 4,
    z: 7,
    yLevel: 5,
    isKing: false,
  });

  return pieces;
}

// 2. Find piece at a position
export function findPieceAt(pieces, x, z, yLevel) {
  return pieces.find((p) => p.x === x && p.z === z && p.yLevel === yLevel);
}

// 3. Check if a move is legal (core rules, forced jumps, triangle jump)
export function getLegalMoves(piece, pieces, forceCapture = false) {
  const moves = [];
  if (!piece) return moves;
  const dirs =
    piece.type === "triangle" || piece.isKing
      ? [
          [1, 1],
          [-1, 1],
          [1, -1],
          [-1, -1],
        ]
      : piece.color === "red"
      ? [
          [1, 1],
          [-1, 1],
        ]
      : [
          [1, -1],
          [-1, -1],
        ];

  for (let [dx, dz] of dirs) {
    const nx = piece.x + dx;
    const nz = piece.z + dz;
    // Normal move
    if (
      nx >= 0 &&
      nx < BOARD_SIZE &&
      nz >= 0 &&
      nz < BOARD_SIZE &&
      (nx + nz) % 2 === 1 &&
      !findPieceAt(pieces, nx, nz, piece.yLevel)
    ) {
      if (!forceCapture) {
        moves.push({
          x: nx,
          z: nz,
          yLevel: piece.yLevel,
          captured: null,
        });
      }
    }
    // Capture
    const cx = piece.x + dx * 2;
    const cz = piece.z + dz * 2;
    const between = findPieceAt(pieces, piece.x + dx, piece.z + dz, piece.yLevel);
    if (
      cx >= 0 &&
      cx < BOARD_SIZE &&
      cz >= 0 &&
      cz < BOARD_SIZE &&
      (cx + cz) % 2 === 1 &&
      between &&
      between.color !== piece.color &&
      !findPieceAt(pieces, cx, cz, piece.yLevel)
    ) {
      moves.push({
        x: cx,
        z: cz,
        yLevel: piece.yLevel,
        captured: between,
      });
    }
  }

  // Triangle level jump
  if (piece.type === "triangle") {
    for (let i = 0; i < BOARD_LEVELS.length; i++) {
      if (BOARD_LEVELS[i] !== piece.yLevel) {
        if (!findPieceAt(pieces, piece.x, piece.z, BOARD_LEVELS[i])) {
          moves.push({
            x: piece.x,
            z: piece.z,
            yLevel: BOARD_LEVELS[i],
            captured: null,
            triangleLevelJump: true,
          });
        }
      }
    }
  }

  // Forced jump logic: Only return captures if any are present
  if (forceCapture) {
    return moves.filter((m) => !!m.captured);
  }
  return moves;
}

// 4. Get all forced capture moves for a color
export function getForcedMoves(pieces, color) {
  let captures = [];
  for (const p of pieces.filter((p) => p.color === color)) {
    const ms = getLegalMoves(p, pieces, true);
    if (ms.length) captures.push({ piece: p, moves: ms });
  }
  return captures;
}

// 5. Kinging: if piece reaches far row
export function shouldKing(piece) {
  return (
    !piece.isKing &&
    ((piece.color === "red" && piece.z === 7 && piece.yLevel === 0) ||
      (piece.color === "blue" && piece.z === 0 && piece.yLevel === 5))
  );
}

// 6. Move a piece (returns new pieces array, log, and king status)
export function movePiece(state, piece, move) {
  let pieces = state.pieces.filter(
    (p) =>
      !(move.captured && p.x === move.captured.x && p.z === move.captured.z && p.yLevel === move.captured.yLevel)
  );
  pieces = pieces.map((p) => {
    if (p.id !== piece.id) return p;
    return {
      ...p,
      x: move.x,
      z: move.z,
      yLevel: move.yLevel,
      isKing: p.isKing || shouldKing({ ...p, x: move.x, z: move.z, yLevel: move.yLevel }),
    };
  });
  
  const wasKinged = !piece.isKing && shouldKing({ ...piece, x: move.x, z: move.z, yLevel: move.yLevel });
  
  const log = {
    type: "move",
    pieceId: piece.id,
    pieceType: piece.type,
    pieceColor: piece.color,
    from: { x: piece.x, z: piece.z, yLevel: piece.yLevel },
    to: { x: move.x, z: move.z, yLevel: move.yLevel },
    captured: move.captured ? move.captured.id : null,
    capturedType: move.captured ? move.captured.type : null,
    capturedColor: move.captured ? move.captured.color : null,
    wasKinged,
    isTriangleLevelJump: move.triangleLevelJump || false,
    moveNumber: state.logs.filter(l => l.type === "move").length + 1,
    timestamp: new Date().toISOString(),
  };
  
  let winner = null;
  const reds = pieces.filter((p) => p.color === "red");
  const blues = pieces.filter((p) => p.color === "blue");
  if (reds.length === 0) winner = "blue";
  if (blues.length === 0) winner = "red";
  if (
    !winner &&
    !pieces.some((p) => getLegalMoves(p, pieces).length && p.color === state.currentPlayer)
  ) {
    winner = state.currentPlayer === "red" ? "blue" : "red";
  }
  
  const newLogs = [...state.logs, log];
  
  // Add additional logs for special events
  if (wasKinged) {
    newLogs.push({
      type: "king",
      pieceId: piece.id,
      pieceType: piece.type,
      pieceColor: piece.color,
      position: { x: move.x, z: move.z, yLevel: move.yLevel },
      moveNumber: state.logs.filter(l => l.type === "move").length + 1,
      timestamp: new Date().toISOString(),
    });
  }
  
  if (winner) {
    newLogs.push({
      type: "game_end",
      winner,
      reason: reds.length === 0 ? "no_red_pieces" : blues.length === 0 ? "no_blue_pieces" : "no_legal_moves",
      finalPieceCounts: { red: reds.length, blue: blues.length },
      totalMoves: state.logs.filter(l => l.type === "move").length + 1,
      timestamp: new Date().toISOString(),
    });
  }
  
  return {
    ...state,
    pieces,
    logs: newLogs,
    undoStack: [
      ...state.undoStack,
      {
        pieces: state.pieces,
        currentPlayer: state.currentPlayer,
        logs: state.logs,
        winner: state.winner,
      },
    ],
    winner,
  };
}

// 7. Undo
export function undo(state) {
  if (state.undoStack && state.undoStack.length) {
    const prev = state.undoStack[state.undoStack.length - 1];
    return {
      ...state,
      ...prev,
      undoStack: state.undoStack.slice(0, state.undoStack.length - 1),
    };
  }
  return state;
}