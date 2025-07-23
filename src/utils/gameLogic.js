export const initializeGame = () => {
  console.log('🎲 [GameLogic] Initializing new game...');
  
  const board = createInitialBoard();
  const gameState = {
    board,
    currentPlayer: 'red',
    selectedPiece: null,
    gameOver: false,
    winner: null,
    redPieces: 12,
    blackPieces: 12,
    moveHistory: []
  };
  
  console.log('✅ [GameLogic] Game initialized with 12 pieces per player');
  return gameState;
};

const createInitialBoard = () => {
  console.log('🏁 [GameLogic] Creating initial board setup...');
  
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place black pieces (top 3 rows)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'black', isKing: false };
      }
    }
  }
  
  // Place red pieces (bottom 3 rows)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'red', isKing: false };
      }
    }
  }
  
  console.log('✅ [GameLogic] Initial board created with pieces in starting positions');
  return board;
};

export const isValidMove = (board, fromRow, fromCol, toRow, toCol) => {
  console.log(`🔍 [GameLogic] Validating move from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`);
  
  // Check bounds
  if (toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) {
    console.log('❌ [GameLogic] Move out of bounds');
    return false;
  }
  
  // Check if destination is empty
  if (board[toRow][toCol] !== null) {
    console.log('❌ [GameLogic] Destination square occupied');
    return false;
  }
  
  const piece = board[fromRow][fromCol];
  if (!piece) {
    console.log('❌ [GameLogic] No piece at source position');
    return false;
  }
  
  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;
  const absRowDiff = Math.abs(rowDiff);
  const absColDiff = Math.abs(colDiff);
  
  // Must move diagonally
  if (absRowDiff !== absColDiff) {
    console.log('❌ [GameLogic] Move is not diagonal');
    return false;
  }
  
  // Check direction for non-kings
  if (!piece.isKing) {
    if (piece.color === 'red' && rowDiff > 0) {
      console.log('❌ [GameLogic] Red piece cannot move backward');
      return false;
    }
    if (piece.color === 'black' && rowDiff < 0) {
      console.log('❌ [GameLogic] Black piece cannot move backward');
      return false;
    }
  }
  
  // Simple move (one square)
  if (absRowDiff === 1) {
    console.log('✅ [GameLogic] Valid simple move');
    return true;
  }
  
  // Jump move (two squares)
  if (absRowDiff === 2) {
    const middleRow = fromRow + rowDiff / 2;
    const middleCol = fromCol + colDiff / 2;
    const middlePiece = board[middleRow][middleCol];
    
    if (middlePiece && middlePiece.color !== piece.color) {
      console.log('✅ [GameLogic] Valid jump move');
      return true;
    } else {
      console.log('❌ [GameLogic] Invalid jump - no enemy piece to capture');
      return false;
    }
  }
  
  console.log('❌ [GameLogic] Move distance invalid');
  return false;
};

export const getValidMoves = (board, row, col) => {
  console.log(`🎯 [GameLogic] Getting valid moves for piece at (${row}, ${col})`);
  
  const piece = board[row][col];
  if (!piece) {
    console.log('❌ [GameLogic] No piece at specified position');
    return [];
  }
  
  const moves = [];
  const directions = piece.isKing ? 
    [[-1, -1], [-1, 1], [1, -1], [1, 1]] : // Kings can move in all directions
    piece.color === 'red' ? 
      [[-1, -1], [-1, 1]] : // Red moves up
      [[1, -1], [1, 1]];    // Black moves down
  
  directions.forEach(([rowDir, colDir]) => {
    // Check simple move
    const newRow = row + rowDir;
    const newCol = col + colDir;
    
    if (isValidMove(board, row, col, newRow, newCol)) {
      moves.push({ row: newRow, col: newCol, isJump: false });
    }
    
    // Check jump move
    const jumpRow = row + rowDir * 2;
    const jumpCol = col + colDir * 2;
    
    if (isValidMove(board, row, col, jumpRow, jumpCol)) {
      moves.push({ row: jumpRow, col: jumpCol, isJump: true });
    }
  });
  
  console.log(`✅ [GameLogic] Found ${moves.length} valid moves`);
  return moves;
};

export const makeMove = (gameState, from, to) => {
  console.log(`🚀 [GameLogic] Making move from (${from.row}, ${from.col}) to (${to.row}, ${to.col})`);
  
  const newBoard = gameState.board.map(row => [...row]);
  const piece = newBoard[from.row][from.col];
  
  if (!piece) {
    console.log('❌ [GameLogic] No piece to move');
    return gameState;
  }
  
  // Move the piece
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;
  
  let capturedPiece = null;
  
  // Handle jump (capture)
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;
  
  if (Math.abs(rowDiff) === 2) {
    const middleRow = from.row + rowDiff / 2;
    const middleCol = from.col + colDiff / 2;
    capturedPiece = newBoard[middleRow][middleCol];
    newBoard[middleRow][middleCol] = null;
    console.log(`🎯 [GameLogic] Captured ${capturedPiece?.color} piece at (${middleRow}, ${middleCol})`);
  }
  
  // Check for king promotion
  if (!piece.isKing) {
    if ((piece.color === 'red' && to.row === 0) || 
        (piece.color === 'black' && to.row === 7)) {
      piece.isKing = true;
      console.log(`👑 [GameLogic] ${piece.color} piece promoted to king!`);
    }
  }
  
  // Count remaining pieces
  let redPieces = 0;
  let blackPieces = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const boardPiece = newBoard[row][col];
      if (boardPiece) {
        if (boardPiece.color === 'red') redPieces++;
        else blackPieces++;
      }
    }
  }
  
  // Check for game over
  let gameOver = false;
  let winner = null;
  
  if (redPieces === 0) {
    gameOver = true;
    winner = 'black';
    console.log('🏆 [GameLogic] Black wins - no red pieces remaining!');
  } else if (blackPieces === 0) {
    gameOver = true;
    winner = 'red';
    console.log('🏆 [GameLogic] Red wins - no black pieces remaining!');
  }
  
  // Switch players
  const nextPlayer = gameState.currentPlayer === 'red' ? 'black' : 'red';
  console.log(`🔄 [GameLogic] Turn switched to ${nextPlayer}`);
  
  const newGameState = {
    ...gameState,
    board: newBoard,
    currentPlayer: nextPlayer,
    selectedPiece: null,
    gameOver,
    winner,
    redPieces,
    blackPieces,
    moveHistory: [...gameState.moveHistory, { from, to, capturedPiece }]
  };
  
  console.log(`✅ [GameLogic] Move completed. Red: ${redPieces}, Black: ${blackPieces}`);
  return newGameState;
};

export const hasValidMoves = (board, color) => {
  console.log(`🔍 [GameLogic] Checking if ${color} has valid moves...`);
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, row, col);
        if (moves.length > 0) {
          console.log(`✅ [GameLogic] ${color} has valid moves`);
          return true;
        }
      }
    }
  }
  
  console.log(`❌ [GameLogic] ${color} has no valid moves`);
  return false;
};

export const getAllPieces = (board, color) => {
  const pieces = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        pieces.push({ row, col, piece });
      }
    }
  }
  
  return pieces;
};

export const evaluateBoard = (board) => {
  let score = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        let pieceValue = piece.isKing ? 5 : 3;
        
        // Add positional bonus
        if (piece.color === 'red') {
          pieceValue += (7 - row) * 0.1; // Red pieces advance upward
        } else {
          pieceValue += row * 0.1; // Black pieces advance downward
        }
        
        score += piece.color === 'red' ? pieceValue : -pieceValue;
      }
    }
  }
  
  return score;
};