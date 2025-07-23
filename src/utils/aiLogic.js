import { getValidMoves, makeMove, getAllPieces, evaluateBoard, hasValidMoves } from './gameLogic';

export const makeAIMove = (gameState, difficulty) => {
  console.log(`🤖 [AILogic] AI (${difficulty}) calculating move...`);
  
  const startTime = Date.now();
  let bestMove = null;
  
  switch (difficulty) {
    case 'easy':
      bestMove = getRandomMove(gameState);
      break;
    case 'medium':
      bestMove = getMediumMove(gameState);
      break;
    case 'hard':
      bestMove = getHardMove(gameState);
      break;
    default:
      bestMove = getRandomMove(gameState);
  }
  
  const endTime = Date.now();
  console.log(`🧠 [AILogic] AI calculated move in ${endTime - startTime}ms:`, bestMove);
  
  return bestMove;
};

const getRandomMove = (gameState) => {
  console.log('🎲 [AILogic] Using random move strategy...');
  
  const pieces = getAllPieces(gameState.board, gameState.currentPlayer);
  const allMoves = [];
  
  pieces.forEach(({ row, col }) => {
    const moves = getValidMoves(gameState.board, row, col);
    moves.forEach(move => {
      allMoves.push({
        from: { row, col },
        to: { row: move.row, col: move.col },
        isJump: move.isJump
      });
    });
  });
  
  if (allMoves.length === 0) {
    console.log('❌ [AILogic] No moves available');
    return null;
  }
  
  const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
  console.log('🎯 [AILogic] Selected random move:', randomMove);
  return randomMove;
};

const getMediumMove = (gameState) => {
  console.log('🎯 [AILogic] Using medium difficulty strategy...');
  
  const pieces = getAllPieces(gameState.board, gameState.currentPlayer);
  const allMoves = [];
  
  pieces.forEach(({ row, col }) => {
    const moves = getValidMoves(gameState.board, row, col);
    moves.forEach(move => {
      allMoves.push({
        from: { row, col },
        to: { row: move.row, col: move.col },
        isJump: move.isJump,
        score: evaluateMove(gameState, { row, col }, { row: move.row, col: move.col })
      });
    });
  });
  
  if (allMoves.length === 0) {
    console.log('❌ [AILogic] No moves available');
    return null;
  }
  
  // Sort moves by score (highest first)
  allMoves.sort((a, b) => b.score - a.score);
  
  // Add some randomness to top moves
  const topMoves = allMoves.slice(0, Math.min(3, allMoves.length));
  const selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];
  
  console.log('🎯 [AILogic] Selected medium move with score:', selectedMove.score);
  return selectedMove;
};

const getHardMove = (gameState) => {
  console.log('🧠 [AILogic] Using hard difficulty with minimax...');
  
  const depth = 4;
  const result = minimax(gameState, depth, -Infinity, Infinity, true);
  
  if (!result.move) {
    console.log('❌ [AILogic] Minimax found no move, falling back to medium');
    return getMediumMove(gameState);
  }
  
  console.log('🎯 [AILogic] Minimax selected move with score:', result.score);
  return result.move;
};

const evaluateMove = (gameState, from, to) => {
  let score = 0;
  
  // Simulate the move
  const tempGameState = makeMove(gameState, from, to);
  
  // Prefer captures
  if (tempGameState.blackPieces < gameState.blackPieces || 
      tempGameState.redPieces < gameState.redPieces) {
    score += 10;
    console.log('🎯 [AILogic] Capture move bonus: +10');
  }
  
  // Prefer advancing pieces
  if (gameState.currentPlayer === 'black') {
    score += (to.row - from.row) * 2; // Black advances downward
  } else {
    score += (from.row - to.row) * 2; // Red advances upward
  }
  
  // Prefer center positions
  const centerDistance = Math.abs(to.row - 3.5) + Math.abs(to.col - 3.5);
  score += (7 - centerDistance) * 0.5;
  
  // Prefer king promotion
  const piece = gameState.board[from.row][from.col];
  if (!piece.isKing) {
    if ((piece.color === 'black' && to.row === 7) || 
        (piece.color === 'red' && to.row === 0)) {
      score += 15;
      console.log('👑 [AILogic] King promotion bonus: +15');
    }
  }
  
  return score;
};

const minimax = (gameState, depth, alpha, beta, maximizingPlayer) => {
  if (depth === 0 || gameState.gameOver) {
    const score = evaluateBoard(gameState.board);
    return { score: maximizingPlayer ? score : -score, move: null };
  }
  
  const currentColor = gameState.currentPlayer;
  const pieces = getAllPieces(gameState.board, currentColor);
  const allMoves = [];
  
  pieces.forEach(({ row, col }) => {
    const moves = getValidMoves(gameState.board, row, col);
    moves.forEach(move => {
      allMoves.push({
        from: { row, col },
        to: { row: move.row, col: move.col }
      });
    });
  });
  
  if (allMoves.length === 0) {
    // No moves available - game over
    const score = maximizingPlayer ? -1000 : 1000;
    return { score, move: null };
  }
  
  let bestMove = null;
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    
    for (const move of allMoves) {
      const newGameState = makeMove(gameState, move.from, move.to);
      const evaluation = minimax(newGameState, depth - 1, alpha, beta, false);
      
      if (evaluation.score > maxEval) {
        maxEval = evaluation.score;
        bestMove = move;
      }
      
      alpha = Math.max(alpha, evaluation.score);
      if (beta <= alpha) {
        break; // Alpha-beta pruning
      }
    }
    
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    
    for (const move of allMoves) {
      const newGameState = makeMove(gameState, move.from, move.to);
      const evaluation = minimax(newGameState, depth - 1, alpha, beta, true);
      
      if (evaluation.score < minEval) {
        minEval = evaluation.score;
        bestMove = move;
      }
      
      beta = Math.min(beta, evaluation.score);
      if (beta <= alpha) {
        break; // Alpha-beta pruning
      }
    }
    
    return { score: minEval, move: bestMove };
  }
};

export const getDifficultyDescription = (difficulty) => {
  const descriptions = {
    easy: 'Makes random moves',
    medium: 'Prioritizes captures and advancement',
    hard: 'Uses advanced strategy with 4-move lookahead'
  };
  
  return descriptions[difficulty] || 'Unknown difficulty';
};