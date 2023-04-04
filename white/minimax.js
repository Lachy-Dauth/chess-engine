const piecesValues = {
  'P': [100, 100, 100, 100, 100, 100, 100, 100, 150, 150, 150, 150, 150, 150, 150, 150, 110, 110, 120, 130, 130, 120, 110, 110, 105, 105, 110, 125, 125, 110, 105, 105, 100, 100, 100, 120, 120, 100, 100, 100, 105, 95, 90, 100, 100, 90, 95, 105, 105, 110, 110, 80, 80, 110, 110, 105, 100, 100, 100, 100, 100, 100, 100, 100],
  'R': [500, 500, 500, 500, 500, 500, 500, 500, 505, 510, 510, 510, 510, 510, 510, 505, 495, 500, 500, 500, 500, 500, 500, 495, 495, 500, 500, 500, 500, 500, 500, 495, 495, 500, 500, 500, 500, 500, 500, 495, 495, 500, 500, 500, 500, 500, 500, 495, 495, 500, 500, 500, 500, 500, 500, 495, 500, 500, 500, 505, 505, 500, 500, 500],
  'N': [280, 290, 300, 300, 300, 300, 290, 280, 290, 310, 330, 330, 330, 330, 310, 290, 300, 330, 340, 345, 345, 340, 330, 300, 300, 335, 345, 350, 350, 345, 335, 300, 300, 330, 345, 350, 350, 345, 330, 300, 300, 335, 340, 345, 345, 340, 335, 300, 290, 310, 330, 335, 335, 330, 310, 290, 280, 290, 300, 300, 300, 300, 290, 280],
  'B': [310, 320, 320, 320, 320, 320, 320, 310, 320, 330, 330, 330, 330, 330, 330, 320, 320, 330, 335, 340, 340, 335, 330, 320, 320, 335, 335, 340, 340, 335, 335, 320, 320, 330, 340, 340, 340, 340, 330, 320, 320, 340, 340, 340, 340, 340, 340, 320, 320, 335, 330, 330, 330, 330, 335, 320, 310, 320, 320, 320, 320, 320, 320, 310],
  'Q': [880, 890, 890, 895, 895, 890, 890, 880, 890, 900, 900, 900, 900, 900, 900, 890, 890, 900, 905, 905, 905, 905, 900, 890, 895, 900, 905, 905, 905, 905, 900, 895, 900, 900, 905, 905, 905, 905, 900, 895, 890, 905, 905, 905, 905, 905, 900, 890, 890, 900, 905, 900, 900, 900, 900, 890, 880, 890, 890, 895, 895, 890, 890, 880],
  'K': [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20],
  'p': [-100, -100, -100, -100, -100, -100, -100, -100, -105, -110, -110, -80, -80, -110, -110, -105, -105, -95, -90, -100, -100, -90, -95, -105, -100, -100, -100, -120, -120, -100, -100, -100, -105, -105, -110, -125, -125, -110, -105, -105, -110, -110, -120, -130, -130, -120, -110, -110, -150, -150, -150, -150, -150, -150, -150, -150, -100, -100, -100, -100, -100, -100, -100, -100],
  'r': [-500, -500, -500, -505, -505, -500, -500, -500, -495, -500, -500, -500, -500, -500, -500, -495, -495, -500, -500, -500, -500, -500, -500, -495, -495, -500, -500, -500, -500, -500, -500, -495, -495, -500, -500, -500, -500, -500, -500, -495, -495, -500, -500, -500, -500, -500, -500, -495, -505, -510, -510, -510, -510, -510, -510, -505, -500, -500, -500, -500, -500, -500, -500, -500],
  'n': [-280, -290, -300, -300, -300, -300, -290, -280, -290, -310, -330, -335, -335, -330, -310, -290, -300, -335, -340, -345, -345, -340, -335, -300, -300, -330, -345, -350, -350, -345, -330, -300, -300, -335, -345, -350, -350, -345, -335, -300, -300, -330, -340, -345, -345, -340, -330, -300, -290, -310, -330, -330, -330, -330, -310, -290, -280, -290, -300, -300, -300, -300, -290, -280],
  'b': [-310, -320, -320, -320, -320, -320, -320, -310, -320, -335, -330, -330, -330, -330, -335, -320, -320, -340, -340, -340, -340, -340, -340, -320, -320, -330, -340, -340, -340, -340, -330, -320, -320, -335, -335, -340, -340, -335, -335, -320, -320, -330, -335, -340, -340, -335, -330, -320, -320, -330, -330, -330, -330, -330, -330, -320, -310, -320, -320, -320, -320, -320, -320, -310],
  'q': [-880, -890, -890, -895, -895, -890, -890, -880, -890, -900, -900, -900, -900, -905, -900, -890, -890, -900, -905, -905, -905, -905, -905, -890, -895, -900, -905, -905, -905, -905, -900, -900, -895, -900, -905, -905, -905, -905, -900, -895, -890, -900, -905, -905, -905, -905, -900, -890, -890, -900, -900, -900, -900, -900, -900, -890, -880, -890, -890, -895, -895, -890, -890, -880],
  'k': [-20, -30, -10, 0, 0, -10, -30, -20, -20, -20, 0, 0, 0, 0, -20, -20, 10, 20, 20, 20, 20, 20, 20, 10, 20, 30, 30, 40, 40, 30, 30, 20, 30, 40, 40, 50, 50, 40, 40, 30, 30, 40, 40, 50, 50, 40, 40, 30, 30, 40, 40, 50, 50, 40, 40, 30, 30, 40, 40, 50, 50, 40, 40, 30],
  'kend': [100, 100, 100, 100, 100, 100, 100, 100, 100, 25, 25, 25, 25, 25, 25, 100, 100, 25, 15, 15, 15, 15, 25, 100, 100, 25, 15, 5, 5, 15, 25, 100, 100, 25, 15, 5, 5, 15, 25, 100, 100, 25, 15, 15, 15, 15, 25, 100, 100, 25, 25, 25, 25, 25, 25, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

let old_transpositionTable = {};
let transpositionTable = {};

let count = 0;
function iterativeDeepeningMinimax(board, whitesTurn, enPassent, blackCastle, whiteCastle, timeLimit) {
  const startTime = Date.now();
  let bestValue, bestMove, depth = 1;
  old_transpositionTable = {}
  count = 0;
  while (true) {
    const [value, move] = evaluation(board, whitesTurn, enPassent, blackCastle, whiteCastle, depth, -Infinity, Infinity, depth, timeLimit - (Date.now() - startTime));
    old_transpositionTable = transpositionTable;
    transpositionTable = {};
    if (value !== null) {
      bestValue = value;
      bestMove = move;
      console.log([bestValue, bestMove, depth, count]);
      count = 0;
      depth++;
      if (value == 1000000000 || value == -1000000000) {
        break;
      }
    } else {
      break;
    }
  }
  
  return [bestValue, bestMove, depth - 1];
}

function evaluation(board, whitesTurn, enPassent, blackCastle, whiteCastle, depth, alpha, beta, originalDepth, timeLimit) {
  count += 1
  if (depth <= 0) {
    let score = evaluationCaptures(board, whitesTurn, enPassent, blackCastle, whiteCastle, depth, alpha, beta, originalDepth, timeLimit)[0]
    return [score, null];
  }
  if (previousPositions.includes(hashPosition(board, whitesTurn, enPassent, blackCastle, whiteCastle)) && depth != originalDepth) {
    return [0, null]
  }
  let startTime = Date.now();
  if (whitesTurn) {
    let max = -Infinity;
    let bestMove = 0;
    let allValidMoves = generateAllValidMoves(board, whitesTurn, enPassent, blackCastle, whiteCastle).sort((moveOne, moveTwo) => {
      return evaluationDepth0(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle)) - evaluationDepth0(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle))
    });
    if (allValidMoves.length == 0) {
      if (kingInCheck(board, whitesTurn)) {
        return [-1000000000, null]
      }
      return [0, null]
    }
    for (let i = 0; i < allValidMoves.length; i++) {
      let move = allValidMoves[i];
      let score = evaluation(...movePieceAI(move, board, whitesTurn, enPassent, blackCastle, whiteCastle), depth - 1, alpha, beta, originalDepth, timeLimit - (Date.now() - startTime))[0];
      if (Date.now() - startTime >= timeLimit || score == null) {
        // Time's up
        return [null, null];
      }
      if (score > max) {
        max = score;
        bestMove = move;
      }
      if (score > alpha) {
        alpha = score;
      }
      if (beta <= alpha) {
        break;
      }
    }
    return [max, bestMove];
  }
  else {
    let min = Infinity;
    let bestMove = 0;
    let allValidMoves = generateAllValidMoves(board, whitesTurn, enPassent, blackCastle, whiteCastle).sort((moveOne, moveTwo) => {
      return evaluationDepth0(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle)) - evaluationDepth0(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle))
    });
    if (allValidMoves.length == 0){
      if (kingInCheck(board, whitesTurn)) {
        return [1000000000, null]
      }
      return [0, null]
    }
    for (let i = 0; i < allValidMoves.length; i++) {
      let move = allValidMoves[i];
      let score = evaluation(...movePieceAI(move, board, whitesTurn, enPassent, blackCastle, whiteCastle), depth - 1, alpha, beta, originalDepth, timeLimit - (Date.now() - startTime))[0];
      if (Date.now() - startTime >= timeLimit || score == null) {
        // Time's up
        return [null, null];
      }
      if (score < min) {
        min = score;
        bestMove = move;
      }
      if (score < beta) {
        beta = score;
      }
      if (beta <= alpha) {
        break;
      }
    }
    return [min, bestMove];
  }
}

function evaluationCaptures(board, whitesTurn, enPassent, blackCastle, whiteCastle, depth, alpha, beta, originalDepth, timeLimit) {
  count += 1
  let startTime = Date.now();
  if (whitesTurn) {
    let max = evaluationDepth0(board, whitesTurn, enPassent, blackCastle, whiteCastle);
    let bestMove = 0;
    let allValidMoves = generateAllValidCaptures(board, whitesTurn, enPassent, blackCastle, whiteCastle).sort((moveOne, moveTwo) => {
      return evaluationDepth0(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle)) - evaluationDepth0(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle))
    });
    for (let i = 0; i < allValidMoves.length; i++) {
      let move = allValidMoves[i];
      let score = evaluationCaptures(...movePieceAI(move, board, whitesTurn, enPassent, blackCastle, whiteCastle), depth - 1, alpha, beta, originalDepth, timeLimit - (Date.now() - startTime))[0];
      if (Date.now() - startTime >= timeLimit || score == null) {
        // Time's up
        return [null, null];
      }
      if (score > max) {
        max = score;
        bestMove = move;
      }
      if (score > alpha) {
        alpha = score;
      }
      if (beta <= alpha) {
        break;
      }
    }
    return [max, bestMove];
  }
  else {
    let min = evaluationDepth0(board, whitesTurn, enPassent, blackCastle, whiteCastle);
    let bestMove = 0;
    let allValidMoves = generateAllValidCaptures(board, whitesTurn, enPassent, blackCastle, whiteCastle).sort((moveOne, moveTwo) => {
      return evaluationDepth0(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle)) - evaluationDepth0(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle))
    });
    for (let i = 0; i < allValidMoves.length; i++) {
      let move = allValidMoves[i];
      let score = evaluationCaptures(...movePieceAI(move, board, whitesTurn, enPassent, blackCastle, whiteCastle), depth - 1, alpha, beta, originalDepth, timeLimit - (Date.now() - startTime))[0];
      if (Date.now() - startTime >= timeLimit || score == null) {
        // Time's up
        return [null, null];
      }
      if (score < min) {
        min = score;
        bestMove = move;
      }
      if (score < beta) {
        beta = score;
      }
      if (beta <= alpha) {
        break;
      }
    }
    return [min, bestMove];
  }
}

function evaluationDepth0(board, whitesTurn, enPassent, blackCastle, whiteCastle) {
  let totalWhite = 0;
  let totalBlack = 0;
  let whiteKingPos;
  let blackKingPos;
  for (let i = 0; i < 64; i++) {
    if (board[i] != null) {
      if (board[i] == "k") {
        blackKingPos = i
      }
      else if (board[i] == "K") {
        whiteKingPos = i
      }
      else if (isCapitalLetter(board[i])) {
        totalWhite += piecesValues[board[i]][i]
      }
      else {
        totalBlack += piecesValues[board[i]][i]
      }
    }
  }
  let whiteEndGame = 2000 - totalWhite + (2 * totalBlack)
  let blackEndGame = 2000 - (2 * totalWhite) + (1 * totalBlack)
  if (whiteEndGame < 0) {
    totalWhite += piecesValues["K"][whiteKingPos]
  }
  else {
    if (whiteEndGame > blackEndGame) {
      totalWhite += 80
      totalWhite -= 10 * Math.round(Math.max(Math.abs(whiteKingPos%8 - blackKingPos%8), Math.abs(Math.round(whiteKingPos/8) - Math.round(blackKingPos/8))))
    }
    totalWhite -= Math.round(piecesValues["kend"][whiteKingPos] * 10 * (1 - (whiteEndGame / 2000)))
  }
  if (blackEndGame < 0) {
    totalBlack += piecesValues["k"][blackKingPos]
  }
  else {
    if (blackEndGame > whiteEndGame) {
      totalBlack -= 80
      totalBlack += 10 * Math.round(Math.max(Math.abs(whiteKingPos%8 - blackKingPos%8), Math.abs(Math.round(whiteKingPos/8) - Math.round(blackKingPos/8))))
    }
    totalBlack += Math.round(piecesValues["kend"][blackKingPos] * 10 * (1 - (blackEndGame / 2000)))
  }
  return Math.round((((totalWhite + totalBlack) * 178000) / (totalWhite - totalBlack + 100000)));
}

function generateAllValidMoves(board, whitesTurn, enPassent, blackCastle, whiteCastle) {
  let allValidMoves = [];
  for (let i = 0; i < 64; i++) {
    if (isCapitalLetter(board[i]) == whitesTurn) {
      let validMoves = findValidMoves(board, i, whitesTurn, enPassent, blackCastle, whiteCastle);
      allValidMoves.push(...validMoves)
    }
  }
  return allValidMoves
}

function generateAllValidCaptures(board, whitesTurn, enPassent, blackCastle, whiteCastle) {
  let allValidMoves = [];
  for (let i = 0; i < 64; i++) {
    if (isCapitalLetter(board[i]) == whitesTurn) {
      let validMoves = findValidCaptures(board, i, whitesTurn, enPassent, blackCastle, whiteCastle);
      allValidMoves.push(...validMoves)
    }
  }
  return allValidMoves
}

function numberOfGames(board, whitesTurn, enPassent, blackCastle, whiteCastle, depth, startingDepth) {
  if (depth == 0) {
    return 1
  }
  let total = 0
  let arr = []
  let allValidMoves = generateAllValidMoves(board, whitesTurn, enPassent, blackCastle, whiteCastle);
  for (let i = 0; i < allValidMoves.length; i++) {
    const move = allValidMoves[i];
    arr.push([board[move[0]], String.fromCharCode(97 + move[0]%8) + String(8 - Math.floor(move[0]/8)) + String.fromCharCode(97 + move[1]%8) + String(8 - Math.floor(move[1]/8)), numberOfGames(...movePieceAI(move, board, whitesTurn, enPassent, blackCastle, whiteCastle), depth - 1)])
    total += numberOfGames(...movePieceAI(move, board, whitesTurn, enPassent, blackCastle, whiteCastle), depth - 1, startingDepth);
  }
  if (depth == startingDepth){
    console.table(arr)
  }
  return total
}

function movePieceAI([startingPos, endingPos, promotionPiece], old_board, old_whitesTurn, old_enPassent, old_blackCastle, old_whiteCastle) {
  let board = [...old_board];
  let blackCastle = [...old_blackCastle];
  let whiteCastle = [...old_whiteCastle];
  let enPassent = null;
  if (board[startingPos] == "p" || board[startingPos] == "P") {
    if (startingPos%8 != endingPos%8 && board[endingPos] == null) {
      board[old_enPassent] = null;
    }
    if (Math.abs(Math.floor(startingPos/8) - Math.floor(endingPos/8)) == 2) {
      enPassent = endingPos;
    }
  }
  else if (board[startingPos] == "k") {
    blackCastle = [false, false];
  }
  else if (board[startingPos] == "K") {
    whiteCastle = [false, false];
  }
  if (endingPos == 0 || startingPos == 0) {
    blackCastle[0] = false;
  }
  else if (endingPos == 7 || startingPos == 7) {
    blackCastle[1] = false;
  }
  else if (endingPos == 56 || startingPos == 56) {
    whiteCastle[0] = false;
  }
  else if (endingPos == 63 || startingPos == 63) {
    whiteCastle[1] = false;
  }
  if (board[startingPos] == "k" && startingPos == 4 && endingPos == 0) {
    board[startingPos] = null;
    board[endingPos] = null;
    board[2] = "k";
    board[3] = "r";
  }
  else if (board[startingPos] == "k" && startingPos == 4 && endingPos == 7) {
    board[startingPos] = null;
    board[endingPos] = null;
    board[6] = "k";
    board[5] = "r";
  }
  else if (board[startingPos] == "K" && startingPos == 60 && endingPos == 56) {
    board[startingPos] = null;
    board[endingPos] = null;
    board[58] = "K";
    board[59] = "R";
  }
  else if (board[startingPos] == "K" && startingPos == 60 && endingPos == 63) {
    board[startingPos] = null;
    board[endingPos] = null;
    board[62] = "K";
    board[61] = "R";
  }
  else {
    board[endingPos] = board[startingPos];
    board[startingPos] = null;
  }
  if ((Math.floor(endingPos/8) == 0 || Math.floor(endingPos/8) == 7) && (board[endingPos] == "p" || board[endingPos] == "P")) {
    board[endingPos] = promotionPiece;
  }
  let whitesTurn = !old_whitesTurn
  return [board, whitesTurn, enPassent, blackCastle, whiteCastle]
}

function hashPosition(board, whitesTurn, enPassent, blackCastle, whiteCastle) {
  let string = [enPassent == null ? 'o' : enPassent, ...board.map(char => char == null ? "o" : char), whitesTurn ? "w" : "b", ...whiteCastle.map(value => value ? "y" : "n"), ...blackCastle.map(value => value ? "y" : "n")].join("");
  return string
}