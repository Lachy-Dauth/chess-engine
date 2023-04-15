addEventListener("message", (message) => {
  if (message.data.command === 'evaluate') {
    previousPositions = message.data.previousPositions
    iterativeDeepeningMinimax(message.data.board, message.data.whitesTurn, message.data.enPassent, message.data.blackCastle, message.data.whiteCastle, message.data.timeLimit)
  }
  if (message.data.command === 'evaluate-early') {
    previousPositions = message.data.previousPositions
    iterativeDeepeningMinimax(message.data.board, message.data.whitesTurn, message.data.enPassent, message.data.blackCastle, message.data.whiteCastle, message.data.timeLimit, early=true)
  }
});

const cyrb53 = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for(let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return (h2>>>0).toString(16).padStart(8,0)+(h1>>>0).toString(16).padStart(8,0);
};

const piecesValues = {
  'P': [90, 90, 90, 90, 90, 90, 90, 90, 140, 140, 140, 150, 150, 140, 140, 140, 100, 100, 110, 130, 130, 110, 100, 100, 95, 95, 100, 120, 125, 100, 95, 95, 90, 90, 90, 115, 120, 90, 90, 90, 95, 85, 80, 90, 90, 80, 85, 95, 95, 100, 100, 75, 65, 100, 100, 95, 90, 90, 90, 90, 90, 90, 90, 90],
  'R': [500, 500, 500, 500, 500, 500, 500, 500, 505, 510, 510, 510, 510, 510, 510, 505, 495, 500, 500, 500, 500, 500, 500, 495, 495, 500, 500, 500, 500, 500, 500, 495, 495, 500, 500, 500, 500, 500, 500, 495, 495, 500, 500, 500, 500, 500, 500, 495, 495, 500, 500, 500, 500, 500, 500, 495, 500, 500, 500, 505, 505, 500, 500, 500],
  'N': [280, 290, 300, 300, 300, 300, 290, 280, 290, 310, 330, 330, 330, 330, 310, 290, 300, 330, 340, 345, 345, 340, 330, 300, 300, 335, 345, 350, 350, 345, 335, 300, 300, 330, 345, 350, 350, 345, 330, 300, 300, 335, 340, 345, 345, 340, 335, 300, 290, 310, 330, 335, 335, 330, 310, 290, 280, 290, 300, 300, 300, 300, 290, 280],
  'B': [310, 320, 320, 320, 320, 320, 320, 310, 320, 330, 330, 330, 330, 330, 330, 320, 320, 330, 335, 340, 340, 335, 330, 320, 320, 335, 335, 340, 340, 335, 335, 320, 320, 330, 340, 340, 340, 340, 330, 320, 320, 340, 340, 340, 340, 340, 340, 320, 320, 335, 330, 330, 330, 330, 335, 320, 310, 320, 320, 320, 320, 320, 320, 310],
  'Q': [880, 890, 890, 895, 895, 890, 890, 880, 890, 900, 900, 900, 900, 900, 900, 890, 890, 900, 905, 905, 905, 905, 900, 890, 895, 900, 905, 905, 905, 905, 900, 895, 900, 900, 905, 905, 905, 905, 900, 895, 890, 905, 905, 905, 905, 905, 900, 890, 890, 900, 905, 900, 900, 900, 900, 890, 880, 890, 890, 895, 895, 890, 890, 880],
  'K': [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20],
  'p': [-90, -90, -90, -90, -90, -90, -90, -90, -95, -100, -100, -75, -65, -100, -100, -95, -95, -85, -80, -90, -90, -80, -85, -95, -90, -90, -90, -115, -120, -90, -90, -90, -95, -95, -100, -120, -125, -100, -95, -95, -100, -100, -110, -130, -130, -110, -100, -100, -140, -140, -140, -150, -150, -140, -140, -140, -90, -90, -90, -90, -90, -90, -90, -90],
  'r': [-500, -500, -500, -505, -505, -500, -500, -500, -495, -500, -500, -500, -500, -500, -500, -495, -495, -500, -500, -500, -500, -500, -500, -495, -495, -500, -500, -500, -500, -500, -500, -495, -495, -500, -500, -500, -500, -500, -500, -495, -495, -500, -500, -500, -500, -500, -500, -495, -505, -510, -510, -510, -510, -510, -510, -505, -500, -500, -500, -500, -500, -500, -500, -500],
  'n': [-280, -290, -300, -300, -300, -300, -290, -280, -290, -310, -330, -335, -335, -330, -310, -290, -300, -335, -340, -345, -345, -340, -335, -300, -300, -330, -345, -350, -350, -345, -330, -300, -300, -335, -345, -350, -350, -345, -335, -300, -300, -330, -340, -345, -345, -340, -330, -300, -290, -310, -330, -330, -330, -330, -310, -290, -280, -290, -300, -300, -300, -300, -290, -280],
  'b': [-310, -320, -320, -320, -320, -320, -320, -310, -320, -335, -330, -330, -330, -330, -335, -320, -320, -340, -340, -340, -340, -340, -340, -320, -320, -330, -340, -340, -340, -340, -330, -320, -320, -335, -335, -340, -340, -335, -335, -320, -320, -330, -335, -340, -340, -335, -330, -320, -320, -330, -330, -330, -330, -330, -330, -320, -310, -320, -320, -320, -320, -320, -320, -310],
  'q': [-880, -890, -890, -895, -895, -890, -890, -880, -890, -900, -900, -900, -900, -905, -900, -890, -890, -900, -905, -905, -905, -905, -905, -890, -895, -900, -905, -905, -905, -905, -900, -900, -895, -900, -905, -905, -905, -905, -900, -895, -890, -900, -905, -905, -905, -905, -900, -890, -890, -900, -900, -900, -900, -900, -900, -890, -880, -890, -890, -895, -895, -890, -890, -880],
  'k': [-20, -30, -10, 0, 0, -10, -30, -20, -20, -20, 0, 0, 0, 0, -20, -20, 10, 20, 20, 20, 20, 20, 20, 10, 20, 30, 30, 40, 40, 30, 30, 20, 30, 40, 40, 50, 50, 40, 40, 30, 30, 40, 40, 50, 50, 40, 40, 30, 30, 40, 40, 50, 50, 40, 40, 30, 30, 40, 40, 50, 50, 40, 40, 30],
  'kend': [100, 100, 100, 100, 100, 100, 100, 100, 100, 25, 25, 25, 25, 25, 25, 100, 100, 25, 15, 15, 15, 15, 25, 100, 100, 25, 15, 5, 5, 15, 25, 100, 100, 25, 15, 5, 5, 15, 25, 100, 100, 25, 15, 15, 15, 15, 25, 100, 100, 25, 25, 25, 25, 25, 25, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

let previousPositions = []
let old_transpositionTable = {};
let transpositionTable = {};

let count = 0;
function iterativeDeepeningMinimax(board, whitesTurn, enPassent, blackCastle, whiteCastle, timeLimit, early=false) {
  const startTime = Date.now();
  let bestValue, bestMove, depth = 0;
  old_transpositionTable = {}
  count = 0;
  if (hashPosition(board, whitesTurn, enPassent, blackCastle, whiteCastle) in opening_table) {
    if (early) {
      postMessage(["early", opening_table[hashPosition(board, whitesTurn, enPassent, blackCastle, whiteCastle)]])
    }
    else {
      postMessage(["final", opening_table[hashPosition(board, whitesTurn, enPassent, blackCastle, whiteCastle)]])
    }
    return;
  }
  while (true) {
    const [value, move] = evaluation(board, whitesTurn, enPassent, blackCastle, whiteCastle, depth, -Infinity, Infinity, depth, timeLimit - (Date.now() - startTime), []);
    transpositionTable = {};
    if (value !== null) {
      bestValue = value;
      bestMove = move;
      console.log([bestValue, bestMove, depth, count]);
      postMessage(["early", [bestValue, bestMove, depth, count]]);
      count = 0;
      depth++;
      if (value == 1000000000 || value == -1000000000) {
        break;
      }
    } else {
      break;
    }
  }
  if (early) {
    postMessage(["early", [bestValue, bestMove, depth - 1]]);
  }
  else {
    postMessage(["final", [bestValue, bestMove, depth - 1]]);
  }
}

function evaluation(board, whitesTurn, enPassent, blackCastle, whiteCastle, depth, alpha, beta, originalDepth, timeLimit, previousPositionsMinimax) {
  count += 1
  const hashOfPos = hashPosition(board, whitesTurn, enPassent, blackCastle, whiteCastle);
  const bit64hash = cyrb53(hashOfPos)
  if (bit64hash in transpositionTable) {
    return [transpositionTable[bit64hash], null];
  }
  if (depth <= 0 && originalDepth != 0) {
    let score = evaluationCaptures(board, whitesTurn, enPassent, blackCastle, whiteCastle, depth, alpha, beta, originalDepth, timeLimit)[0]
    transpositionTable[bit64hash] = score
    return [score, null];
  }
  else if (depth <= -2) {
    let score = evaluationDepth0(board, whitesTurn, enPassent, blackCastle, whiteCastle)
    return [score, null];
  }
  if ((previousPositions.includes(hashOfPos) || previousPositionsMinimax.includes(hashOfPos)) && depth != originalDepth) {
    return [0, null]
  }
  previousPositionsMinimax.push(hashOfPos);
  let startTime = Date.now();
  if (whitesTurn) {
    let max = -Infinity;
    let bestMove = 0;
    let allValidMoves = generateAllValidMoves(board, whitesTurn, enPassent, blackCastle, whiteCastle).sort((moveOne, moveTwo) => {
      scoreTwo = cyrb53(hashPosition(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle))) in old_transpositionTable ? old_transpositionTable[cyrb53(hashPosition(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle)))] : evaluationDepth0(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle))
      scoreOne = cyrb53(hashPosition(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle))) in old_transpositionTable ? old_transpositionTable[cyrb53(hashPosition(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle)))] : evaluationDepth0(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle))
      return scoreTwo - scoreOne
    });
    if (allValidMoves.length == 0) {
      if (kingInCheck(board, whitesTurn)) {
        return [-1000000000, null]
      }
      return [0, null]
    }
    for (let i = 0; i < allValidMoves.length; i++) {
      let move = allValidMoves[i];
      let score = evaluation(...movePieceAI(move, board, whitesTurn, enPassent, blackCastle, whiteCastle), depth - 1, alpha, beta, originalDepth, timeLimit - (Date.now() - startTime), previousPositionsMinimax)[0];
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
    transpositionTable[bit64hash] = max;
    old_transpositionTable[bit64hash] = max;
    return [max, bestMove];
  }
  else {
    let min = Infinity;
    let bestMove = 0;
    let allValidMoves = generateAllValidMoves(board, whitesTurn, enPassent, blackCastle, whiteCastle).sort((moveOne, moveTwo) => {
      scoreTwo = cyrb53(hashPosition(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle))) in old_transpositionTable ? old_transpositionTable[cyrb53(hashPosition(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle)))] : evaluationDepth0(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle))
      scoreOne = cyrb53(hashPosition(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle))) in old_transpositionTable ? old_transpositionTable[cyrb53(hashPosition(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle)))] : evaluationDepth0(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle))
      return scoreOne - scoreTwo
    });
    if (allValidMoves.length == 0){
      if (kingInCheck(board, whitesTurn)) {
        return [1000000000, null]
      }
      return [0, null]
    }
    for (let i = 0; i < allValidMoves.length; i++) {
      let move = allValidMoves[i];
      let score = evaluation(...movePieceAI(move, board, whitesTurn, enPassent, blackCastle, whiteCastle), depth - 1, alpha, beta, originalDepth, timeLimit - (Date.now() - startTime), previousPositionsMinimax)[0];
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
    old_transpositionTable[bit64hash] = min;
    transpositionTable[bit64hash] = min;
    return [min, bestMove];
  }
}

function evaluationCaptures(board, whitesTurn, enPassent, blackCastle, whiteCastle, depth, alpha, beta, originalDepth, timeLimit) {
  count += 1
  const hashOfPos = hashPosition(board, whitesTurn, enPassent, blackCastle, whiteCastle);
  const bit64hash = cyrb53(hashOfPos)
  if (bit64hash in transpositionTable) {
    return [transpositionTable[bit64hash], null];
  }
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
    transpositionTable[bit64hash] = max;
    old_transpositionTable[bit64hash] = max;
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
    transpositionTable[bit64hash] = min;
    old_transpositionTable[bit64hash] = min;
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
    totalWhite -= Math.round(piecesValues["kend"][whiteKingPos] * (1 - (whiteEndGame / 2000)))
  }
  if (blackEndGame < 0) {
    totalBlack += piecesValues["k"][blackKingPos]
  }
  else {
    totalBlack += Math.round(piecesValues["kend"][blackKingPos] * (1 - (blackEndGame / 2000)))
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
  if (board[startingPos] == "k" && startingPos == 4 && endingPos == 2) {
    board[startingPos] = null;
    board[0] = null;
    board[2] = "k";
    board[3] = "r";
  }
  else if (board[startingPos] == "k" && startingPos == 4 && endingPos == 6) {
    board[startingPos] = null;
    board[7] = null;
    board[6] = "k";
    board[5] = "r";
  }
  else if (board[startingPos] == "K" && startingPos == 60 && endingPos == 58) {
    board[startingPos] = null;
    board[56] = null;
    board[58] = "K";
    board[59] = "R";
  }
  else if (board[startingPos] == "K" && startingPos == 60 && endingPos == 62) {
    board[startingPos] = null;
    board[63] = null;
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

function hashPosition(board, isWhiteToMove, enPassantSquare, blackCastle, whiteCastle) {
  let fen = "";

  // Convert the board array back to fen ranks
  for (let i = 0; i < board.length; i += 8) {
    const rank = board.slice(i, i + 8).map(square => square === null ? '1' : square).join("");
    let fenRank = "";
    let emptySquares = 0;
    for (let j = 0; j < rank.length; j++) {
      if (rank[j] === '1') {
        emptySquares++;
      } else {
        if (emptySquares > 0) {
          fenRank += emptySquares.toString();
          emptySquares = 0;
        }
        fenRank += rank[j];
      }
    }
    if (emptySquares > 0) {
      fenRank += emptySquares.toString();
    }
    fen += fenRank + "/";
  }

  fen = fen.slice(0, -1);

  const enPassentPossible = enPassantSquare !== null && (isCapitalLetter(board[enPassantSquare]) ? (enPassantSquare%8 > 0 && board[enPassantSquare - 1] == "p") || (enPassantSquare%8 < 7 && board[enPassantSquare + 1] == "p") : (enPassantSquare%8 > 0 && board[enPassantSquare - 1] == "P") || (enPassantSquare%8 < 7 && board[enPassantSquare + 1] == "P"))

  // Add other properties to the fen
  fen += " " + (isWhiteToMove ? "w" : "b");
  fen += " " + (whiteCastle[1] ? "K" : "") + (whiteCastle[0] ? "Q" : "") + (blackCastle[1] ? "k" : "") + (blackCastle[0] ? "q" : "");
  fen += " " + (!enPassentPossible ? "-" : String.fromCharCode(enPassantSquare % 8 + 97) + (8 - Math.floor(enPassantSquare / 8) + (isWhiteToMove ? 1 : -1)).toString());

  return fen;
}

function findValidMoves(board, selected, whitesTurn, enPassent, blackCastle, whiteCastle) {
  let file = selected%8;
  let rank = Math.floor(selected/8);
  let array = [];
  let colourSel = isCapitalLetter(board[selected]);
  let isKingInCheck = kingInCheck(board, whitesTurn);
  switch (board[selected]) {
    case "n":
    case "N":
      if (file < 7){
        if (colourSel !== isCapitalLetter(board[selected + 17])) {
          array.push([selected + 17, null]);
        }
        if (colourSel !== isCapitalLetter(board[selected - 15])) {
          array.push([selected - 15, null]);
        }
      }
      if (file > 0){
        if (colourSel !== isCapitalLetter(board[selected - 17])) {
          array.push([selected - 17, null]);
        }
        if (colourSel !== isCapitalLetter(board[selected + 15])) {
          array.push([selected + 15, null]);
        }
      }
      if (file < 6){
        if (colourSel !== isCapitalLetter(board[selected + 10])) {
          array.push([selected + 10, null]);
        }
        if (colourSel !== isCapitalLetter(board[selected - 6])) {
          array.push([selected - 6, null]);
        }
      }
      if (file > 1){
        if (colourSel !== isCapitalLetter(board[selected - 10])) {
          array.push([selected - 10, null]);
        }
        if (colourSel !== isCapitalLetter(board[selected + 6])) {
          array.push([selected + 6, null]);
        }
      }
    break;
    case "b":
    case "B":
      for (let i = 1; i <= file; i++) {
        let colour = isCapitalLetter(board[selected + 7 * i]);
        if (colour == null) {
          array.push([selected + 7 * i, null]);
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected + 7 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i <= file; i++) {
        let colour = isCapitalLetter(board[selected - 9 * i]);
        if (colour == null) {
          array.push([selected - 9 * i, null]);
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected - 9 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i < 8 - file; i++) {
        let colour = isCapitalLetter(board[selected + 9 * i]);
        if (colour == null) {
          array.push([selected + 9 * i, null]);
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected + 9 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i < 8 - file; i++) {
        let colour = isCapitalLetter(board[selected - 7 * i]);
        if (colour == null) {
          array.push([selected - 7 * i, null]);
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected - 7 * i, null]);
          i = 10;
        }
      }
      break;
    case "r":
    case "R":
      
      for (let i = 1; i <= file; i++) {
        let colour = isCapitalLetter(board[selected -i]);
        if (colour == null) {
          array.push([selected -i, null]);
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected -i, null]);
          i = 10;
        }
      }
      for (let i = 1; i <= rank; i++) {
        let colour = isCapitalLetter(board[selected - 8 * i]);
        if (colour == null) {
          array.push([selected - 8 * i, null]);
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected - 8 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i < 8 - file; i++) {
        let colour = isCapitalLetter(board[selected + i]);
        if (colour == null) {
          array.push([selected + i, null]);
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected + i, null]);
          i = 10;
        }
      }
      for (let i = 1; i < 8 - rank; i++) {
        let colour = isCapitalLetter(board[selected + 8 * i]);
        if (colour == null) {
          array.push([selected + 8 * i, null]);
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected + 8 * i, null]);
          i = 10;
        }
      }
      break;
    case "q":
    case "Q":
      for (let i = 1; i <= file; i++) {
        let colour = isCapitalLetter(board[selected + 7 * i]);
        if (colour == null) {
          array.push([selected + 7 * i, null]);
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected + 7 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i <= file; i++) {
        let colour = isCapitalLetter(board[selected - 9 * i]);
        if (colour == null) {
          array.push([selected - 9 * i, null]);
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected - 9 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i < 8 - file; i++) {
        let colour = isCapitalLetter(board[selected + 9 * i]);
        if (colour == null) {
          array.push([selected + 9 * i, null]);
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected + 9 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i < 8 - file; i++) {
        let colour = isCapitalLetter(board[selected - 7 * i]);
        if (colour == null) {
          array.push([selected - 7 * i, null]);
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected - 7 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i <= file; i++) {
        let colour = isCapitalLetter(board[selected -i]);
        if (colour == null) {
          array.push([selected -i, null]);
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected -i, null]);
          i = 10;
        }
      }
      for (let i = 1; i <= rank; i++) {
        let colour = isCapitalLetter(board[selected - 8 * i]);
        if (colour == null) {
          array.push([selected - 8 * i, null]);
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected - 8 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i < 8 - file; i++) {
        let colour = isCapitalLetter(board[selected + i]);
        if (colour == null) {
          array.push([selected + i, null]);
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected + i, null]);
          i = 10;
        }
      }
      for (let i = 1; i < 8 - rank; i++) {
        let colour = isCapitalLetter(board[selected + 8 * i]);
        if (colour == null) {
          array.push([selected + 8 * i, null]);
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected + 8 * i, null]);
          i = 10;
        }
      }
      break;
    case "k":
    case "K":
      if (colourSel !== isCapitalLetter(board[selected + 8])) {
        array.push([selected + 8, null]);
      }
      if (colourSel !== isCapitalLetter(board[selected - 8])) {
        array.push([selected - 8, null]);
      }
      if (file < 7){
        if (colourSel !== isCapitalLetter(board[selected + 1])) {
          array.push([selected + 1, null]);
        }
        if (colourSel !== isCapitalLetter(board[selected + 9])) {
          array.push([selected + 9, null]);
        }
        if (colourSel !== isCapitalLetter(board[selected - 7])) {
          array.push([selected - 7, null]);
        }
      }
      if (file > 0){
        if (colourSel !== isCapitalLetter(board[selected - 1])) {
          array.push([selected - 1, null]);
        }
        if (colourSel !== isCapitalLetter(board[selected - 9])) {
          array.push([selected - 9, null]);
        }
        if (colourSel !== isCapitalLetter(board[selected + 7])) {
          array.push([selected + 7, null]);
        }
      }
      if (colourSel) {
        if (whiteCastle[0] && board[57] == null && board[58] == null && board[59] == null && !isKingInCheck && checkIfKingValid([selected, selected - 1, null], board, whitesTurn, enPassent, blackCastle, whiteCastle)) {
          array.push([58, null])
        }
        if (whiteCastle[1] && board[61] == null && board[62] == null && !isKingInCheck && checkIfKingValid([selected, selected + 1, null], board, whitesTurn, enPassent, blackCastle, whiteCastle)) {
          array.push([62, null])
        }
      }
      else {
        if (blackCastle[0] && board[1] == null && board[2] == null && board[3] == null && !isKingInCheck && checkIfKingValid([selected, selected - 1, null], board, whitesTurn, enPassent, blackCastle, whiteCastle)) {
          array.push([2, null])
        }
        if (blackCastle[1] && board[5] == null && board[6] == null && !isKingInCheck && checkIfKingValid([selected, selected + 1, null], board, whitesTurn, enPassent, blackCastle, whiteCastle)) {
          array.push([6, null])
        }
      }
      break;
    case "p":
      let promotions = ["q", "n", "b", "r"]
      if (isCapitalLetter(board[selected + 8]) == null) {
        if (rank == 6) {
          for (let i = 0; i < promotions.length; i++) {
            array.push([selected + 8, promotions[i]]);
          }
        }
        else {
          array.push([selected + 8, null]);
        }
      }
      if (colourSel !== isCapitalLetter(board[selected + 9]) && ((isCapitalLetter(board[selected + 9]) != null && file < 7) || (selected + 1 == enPassent && file < 7))) {
        if (rank == 6) {
          for (let i = 0; i < promotions.length; i++) {
            array.push([selected + 9, promotions[i]]);
          }
        }
        else {
          array.push([selected + 9, null]);
        }
      }
      if (colourSel !== isCapitalLetter(board[selected + 7]) && ((isCapitalLetter(board[selected + 7]) != null && file > 0) || (selected - 1 == enPassent && file > 0))) {
        if (rank == 6) {
          for (let i = 0; i < promotions.length; i++) {
            array.push([selected + 7, promotions[i]]);
          }
        }
        else {
          array.push([selected + 7, null]);
        }
      }
      if (rank == 1 && isCapitalLetter(board[selected + 16]) == null && isCapitalLetter(board[selected + 8]) == null) {
        array.push([selected + 16, null]);
      }
      break;
    case "P":
      let promotionsW = ["Q", "N", "B", "R"];
      if (isCapitalLetter(board[selected - 8]) == null) {
        if (rank == 1) {
          for (let i = 0; i < promotionsW.length; i++) {
            array.push([selected - 8, promotionsW[i]]);
          }
        }
        else {
          array.push([selected - 8, null]);
        }
      }
      if (colourSel !== isCapitalLetter(board[selected - 9]) && ((isCapitalLetter(board[selected - 9]) != null && file > 0) || (selected - 1 == enPassent && file > 0))) {
        if (rank == 1) {
          for (let i = 0; i < promotionsW.length; i++) {
            array.push([selected - 9, promotionsW[i]]);
          }
        }
        else {
          array.push([selected - 9, null]);
        }
      }
      if (colourSel !== isCapitalLetter(board[selected - 7]) && ((isCapitalLetter(board[selected - 7]) != null && file < 7) || (selected + 1 == enPassent && file < 7))) {
        if (rank == 1) {
          for (let i = 0; i < promotionsW.length; i++) {
            array.push([selected - 7, promotionsW[i]]);
          }
        }
        else {
          array.push([selected - 7, null]);
        }
      }
      if (rank == 6 && isCapitalLetter(board[selected - 16]) == null && isCapitalLetter(board[selected - 8]) == null) {
        array.push([selected - 16, null]);
      }
      break;
  }
  return array.filter(move => move[0] >= 0 && move[0] < 64).map(move => [selected, ...move]).filter(move => checkIfKingValid(move, board, whitesTurn, enPassent, blackCastle, whiteCastle));
}

function findValidCaptures(board, selected, whitesTurn, enPassent, blackCastle, whiteCastle) {
  let file = selected%8;
  let rank = Math.floor(selected/8);
  let array = [];
  let colourSel = isCapitalLetter(board[selected]);
  let isKingInCheck = kingInCheck(board, whitesTurn);
  switch (board[selected]) {
    case "n":
    case "N":
      if (file < 7){
        if (!colourSel === isCapitalLetter(board[selected + 17])) {
          array.push([selected + 17, null]);
        }
        if (!colourSel === isCapitalLetter(board[selected - 15])) {
          array.push([selected - 15, null]);
        }
      }
      if (file > 0){
        if (!colourSel === isCapitalLetter(board[selected - 17])) {
          array.push([selected - 17, null]);
        }
        if (!colourSel === isCapitalLetter(board[selected + 15])) {
          array.push([selected + 15, null]);
        }
      }
      if (file < 6){
        if (!colourSel === isCapitalLetter(board[selected + 10])) {
          array.push([selected + 10, null]);
        }
        if (!colourSel === isCapitalLetter(board[selected - 6])) {
          array.push([selected - 6, null]);
        }
      }
      if (file > 1){
        if (!colourSel === isCapitalLetter(board[selected - 10])) {
          array.push([selected - 10, null]);
        }
        if (!colourSel === isCapitalLetter(board[selected + 6])) {
          array.push([selected + 6, null]);
        }
      }
    break;
    case "b":
    case "B":
      for (let i = 1; i <= file; i++) {
        let colour = isCapitalLetter(board[selected + 7 * i]);
        if (colour == null) {
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected + 7 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i <= file; i++) {
        let colour = isCapitalLetter(board[selected - 9 * i]);
        if (colour == null) {
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected - 9 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i < 8 - file; i++) {
        let colour = isCapitalLetter(board[selected + 9 * i]);
        if (colour == null) {
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected + 9 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i < 8 - file; i++) {
        let colour = isCapitalLetter(board[selected - 7 * i]);
        if (colour == null) {
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected - 7 * i, null]);
          i = 10;
        }
      }
      break;
    case "r":
    case "R":
      
      for (let i = 1; i <= file; i++) {
        let colour = isCapitalLetter(board[selected -i]);
        if (colour == null) {
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected -i, null]);
          i = 10;
        }
      }
      for (let i = 1; i <= rank; i++) {
        let colour = isCapitalLetter(board[selected - 8 * i]);
        if (colour == null) {
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected - 8 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i < 8 - file; i++) {
        let colour = isCapitalLetter(board[selected + i]);
        if (colour == null) {
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected + i, null]);
          i = 10;
        }
      }
      for (let i = 1; i < 8 - rank; i++) {
        let colour = isCapitalLetter(board[selected + 8 * i]);
        if (colour == null) {
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected + 8 * i, null]);
          i = 10;
        }
      }
      break;
    case "q":
    case "Q":
      for (let i = 1; i <= file; i++) {
        let colour = isCapitalLetter(board[selected + 7 * i]);
        if (colour == null) {
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected + 7 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i <= file; i++) {
        let colour = isCapitalLetter(board[selected - 9 * i]);
        if (colour == null) {
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected - 9 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i < 8 - file; i++) {
        let colour = isCapitalLetter(board[selected + 9 * i]);
        if (colour == null) {
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected + 9 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i < 8 - file; i++) {
        let colour = isCapitalLetter(board[selected - 7 * i]);
        if (colour == null) {
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected - 7 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i <= file; i++) {
        let colour = isCapitalLetter(board[selected -i]);
        if (colour == null) {
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected -i, null]);
          i = 10;
        }
      }
      for (let i = 1; i <= rank; i++) {
        let colour = isCapitalLetter(board[selected - 8 * i]);
        if (colour == null) {
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected - 8 * i, null]);
          i = 10;
        }
      }
      for (let i = 1; i < 8 - file; i++) {
        let colour = isCapitalLetter(board[selected + i]);
        if (colour == null) {
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected + i, null]);
          i = 10;
        }
      }
      for (let i = 1; i < 8 - rank; i++) {
        let colour = isCapitalLetter(board[selected + 8 * i]);
        if (colour == null) {
        }
        else if (colour == colourSel) {
          i = 10;
        }
        else {
          array.push([selected + 8 * i, null]);
          i = 10;
        }
      }
      break;
    case "k":
    case "K":
      if (!colourSel === isCapitalLetter(board[selected + 8])) {
        array.push([selected + 8, null]);
      }
      if (!colourSel === isCapitalLetter(board[selected - 8])) {
        array.push([selected - 8, null]);
      }
      if (file < 7){
        if (!colourSel === isCapitalLetter(board[selected + 1])) {
          array.push([selected + 1, null]);
        }
        if (!colourSel === isCapitalLetter(board[selected + 9])) {
          array.push([selected + 9, null]);
        }
        if (!colourSel === isCapitalLetter(board[selected - 7])) {
          array.push([selected - 7, null]);
        }
      }
      if (file > 0){
        if (!colourSel === isCapitalLetter(board[selected - 1])) {
          array.push([selected - 1, null]);
        }
        if (!colourSel === isCapitalLetter(board[selected - 9])) {
          array.push([selected - 9, null]);
        }
        if (!colourSel === isCapitalLetter(board[selected + 7])) {
          array.push([selected + 7, null]);
        }
      }
      break;
    case "p":
      let promotions = ["q", "n", "b", "r"]
      if (colourSel !== isCapitalLetter(board[selected + 9]) && ((isCapitalLetter(board[selected + 9]) != null && file < 7) || (selected + 1 == enPassent && file < 7))) {
        if (rank == 6) {
          for (let i = 0; i < promotions.length; i++) {
            array.push([selected + 9, promotions[i]]);
          }
        }
        else {
          array.push([selected + 9, null]);
        }
      }
      if (colourSel !== isCapitalLetter(board[selected + 7]) && ((isCapitalLetter(board[selected + 7]) != null && file > 0) || (selected - 1 == enPassent && file > 0))) {
        if (rank == 6) {
          for (let i = 0; i < promotions.length; i++) {
            array.push([selected + 7, promotions[i]]);
          }
        }
        else {
          array.push([selected + 7, null]);
        }
      }
      break;
    case "P":
      let promotionsW = ["Q", "N", "B", "R"];
      if (colourSel !== isCapitalLetter(board[selected - 9]) && ((isCapitalLetter(board[selected - 9]) != null && file > 0) || (selected - 1 == enPassent && file > 0))) {
        if (rank == 1) {
          for (let i = 0; i < promotionsW.length; i++) {
            array.push([selected - 9, promotionsW[i]]);
          }
        }
        else {
          array.push([selected - 9, null]);
        }
      }
      if (colourSel !== isCapitalLetter(board[selected - 7]) && ((isCapitalLetter(board[selected - 7]) != null && file < 7) || (selected + 1 == enPassent && file < 7))) {
        if (rank == 1) {
          for (let i = 0; i < promotionsW.length; i++) {
            array.push([selected - 7, promotionsW[i]]);
          }
        }
        else {
          array.push([selected - 7, null]);
        }
      }
      break;
  }
  return array.filter(move => move[0] >= 0 && move[0] < 64).map(move => [selected, ...move]).filter(move => checkIfKingValid(move, board, whitesTurn, enPassent, blackCastle, whiteCastle));
}

function checkIfKingValid(move, board, whitesTurn, enPassent, blackCastle, whiteCastle) {
  let newPositionInfo = movePieceAI(move, board, whitesTurn, enPassent, blackCastle, whiteCastle);
  let new_board = newPositionInfo[0];
  return !kingInCheck(new_board, whitesTurn);
}

function kingInCheck(board, whitesTurn) {
  let kingID;
  if (whitesTurn) {
    kingID = "K";
  }
  else {
    kingID = "k";
  }
  let kingPos;
  for (let i = 0; i < 64; i++) {
    if (board[i] == kingID){
      kingPos = i;
      break;
    }
  }
  if (kingID == "K") {
    let file = kingPos%8;
    let rank = Math.floor(kingPos/8);

    if (file < 7){
      if ("n" == board[kingPos + 17]) {
        return true
      }
      if ("n" == board[kingPos - 15]) {
        return true
      }
    }
    if (file > 0){
      if ("n" == board[kingPos - 17]) {
        return true
      }
      if ("n" == board[kingPos + 15]) {
        return true
      }
    }
    if (file < 6){
      if ("n" == board[kingPos + 10]) {
        return true
      }
      if ("n" == board[kingPos - 6]) {
        return true
      }
    }
    if (file > 1){
      if ("n" == board[kingPos - 10]) {
        return true
      }
      if ("n" == board[kingPos + 6]) {
        return true
      }
    }

    if (board[kingPos + 8] == "k") {
      return true
    }
    if (board[kingPos - 8] == "k") {
      return true
    }
    if (file < 7){
      if (board[kingPos + 1] == "k") {
        return true
      }
      if (board[kingPos + 9] == "k") {
        return true
      }
      if (board[kingPos - 7] == "k") {
        return true
      }
    }
    if (file > 0){
      if (board[kingPos - 1] == "k") {
        return true
      }
      if (board[kingPos - 9] == "k") {
        return true
      }
      if (board[kingPos + 7] == "k") {
        return true
      }
    }
    if ((board[kingPos - 9] == "p" && file > 0) || (board[kingPos - 7] == "p" && file < 7)) {
      return true
    }
    for (let i = 1; i <= file; i++) {
      let piece = board[kingPos + 7 * i];
      if (piece == null) {}
      else if (piece == "q" || piece == "b") {
        return true
      }
      else {
        break;
      }
    }
    for (let i = 1; i <= file; i++) {
      let piece = board[kingPos - 9 * i];
      if (piece == null) {}
      else if (piece == "q" || piece == "b") {
        return true
      }
      else {
        break;
      }
    }
    for (let i = 1; i < 8 - file; i++) {
      let piece = board[kingPos + 9 * i];
      if (piece == null) {}
      else if (piece == "q" || piece == "b") {
        return true
      }
      else {
        break;
      }
    }
    for (let i = 1; i < 8 - file; i++) {
      let piece = board[kingPos - 7 * i];
      if (piece == null) {}
      else if (piece == "q" || piece == "b") {
        return true
      }
      else {
        break;
      }
    }
    for (let i = 1; i <= file; i++) {
      let piece = board[kingPos -i];
      if (piece == null) {}
      else if (piece == "q" || piece == "r") {
        return true
      }
      else {
        break;
      }
    }
    for (let i = 1; i <= rank; i++) {
      let piece = board[kingPos - 8 * i];
      if (piece == null) {}
      else if (piece == "q" || piece == "r") {
        return true
      }
      else {
        break;
      }
    }
    for (let i = 1; i < 8 - file; i++) {
      let piece = board[kingPos + i];
      if (piece == null) {}
      else if (piece == "q" || piece == "r") {
        return true
      }
      else {
        break;
      }
    }
    for (let i = 1; i < 8 - rank; i++) {
      let piece = board[kingPos + 8 * i];
      if (piece == null) {}
      else if (piece == "q" || piece == "r") {
        return true
      }
      else {
        break;
      }
    }
  }
  else if (kingID == "k") {
    let file = kingPos%8;
    let rank = Math.floor(kingPos/8);
    if ((board[kingPos + 9] == "P" && file < 7) || (board[kingPos + 7] == "P" && file > 0)) {
      return true
    }

    if (file < 7){
      if ("N" == board[kingPos + 17]) {
        return true
      }
      if ("N" == board[kingPos - 15]) {
        return true
      }
    }
    if (file > 0){
      if ("N" == board[kingPos - 17]) {
        return true
      }
      if ("N" == board[kingPos + 15]) {
        return true
      }
    }
    if (file < 6){
      if ("N" == board[kingPos + 10]) {
        return true
      }
      if ("N" == board[kingPos - 6]) {
        return true
      }
    }
    if (file > 1){
      if ("N" == board[kingPos - 10]) {
        return true
      }
      if ("N" == board[kingPos + 6]) {
        return true
      }
    }

    if (board[kingPos + 8] == "K") {
      return true
    }
    if (board[kingPos - 8] == "K") {
      return true
    }
    if (file < 7){
      if (board[kingPos + 1] == "K") {
        return true
      }
      if (board[kingPos + 9] == "K") {
        return true
      }
      if (board[kingPos - 7] == "K") {
        return true
      }
    }
    if (file > 0){
      if (board[kingPos - 1] == "K") {
        return true
      }
      if (board[kingPos - 9] == "K") {
        return true
      }
      if (board[kingPos + 7] == "K") {
        return true
      }
    }
    for (let i = 1; i <= file; i++) {
      let piece = board[kingPos + 7 * i];
      if (piece == null) {}
      else if (piece == "Q" || piece == "B") {
        return true
      }
      else {
        break;
      }
    }
    for (let i = 1; i <= file; i++) {
      let piece = board[kingPos - 9 * i];
      if (piece == null) {}
      else if (piece == "Q" || piece == "B") {
        return true
      }
      else {
        break;
      }
    }
    for (let i = 1; i < 8 - file; i++) {
      let piece = board[kingPos + 9 * i];
      if (piece == null) {}
      else if (piece == "Q" || piece == "B") {
        return true
      }
      else {
        break;
      }
    }
    for (let i = 1; i < 8 - file; i++) {
      let piece = board[kingPos - 7 * i];
      if (piece == null) {}
      else if (piece == "Q" || piece == "B") {
        return true
      }
      else {
        break;
      }
    }
    for (let i = 1; i <= file; i++) {
      let piece = board[kingPos -i];
      if (piece == null) {}
      else if (piece == "Q" || piece == "R") {
        return true
      }
      else {
        break;
      }
    }
    for (let i = 1; i <= rank; i++) {
      let piece = board[kingPos - 8 * i];
      if (piece == null) {}
      else if (piece == "Q" || piece == "R") {
        return true
      }
      else {
        break;
      }
    }
    for (let i = 1; i < 8 - file; i++) {
      let piece = board[kingPos + i];
      if (piece == null) {}
      else if (piece == "Q" || piece == "R") {
        return true
      }
      else {
        break;
      }
    }
    for (let i = 1; i < 8 - rank; i++) {
      let piece = board[kingPos + 8 * i];
      if (piece == null) {}
      else if (piece == "Q" || piece == "R") {
        return true
      }
      else {
        break;
      }
    }
  }
  return false
}

function isCapitalLetter(char) {
  return char == null ? null : char === char.toUpperCase();
}

let opening_table = {
  "rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR b KQkq -" : [-11,[10, 26, null], "book"],
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -" : [32,[52, 36, null], "book"],
  "rnbqkbnr/1ppppppp/8/p7/8/P7/1PPPPPPP/RNBQKBNR w KQkq -" : [64,[52, 36, null], "book"],
  "rnbqkbnr/1ppppppp/8/p7/1P6/P7/2PPPPPP/RNBQKBNR b KQkq -" : [-101,[24, 33, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/P7/1PPPPPPP/RNBQKBNR w KQkq -" : [5,[50, 34, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/P6P/1PPPPPP1/RNBQKBNR b KQkq -" : [-52,[11, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/8/P6P/1PPPPPP1/RNBQKBNR w KQkq -" : [-51,[52, 44, null], "book"],
  "rnbqkbnr/pppppp1p/6p1/8/8/P7/1PPPPPPP/RNBQKBNR w KQkq -" : [-8,[52, 36, null], "book"],
  "rnbqkbnr/pppppp1p/6p1/8/6P1/P7/1PPPPP1P/RNBQKBNR b KQkq -" : [-97,[11, 27, null], "book"],
  "rnbqkbnr/pppppppp/8/8/P7/8/1PPPPPPP/RNBQKBNR b KQkq -" : [-12,[6, 21, null], "book"],
  "rnbqkbnr/p1pppppp/8/1p6/P7/8/1PPPPPPP/RNBQKBNR w KQkq -" : [119,[32, 25, null], "book"],
  "rnbqkbnr/p1pppppp/1p6/8/P7/8/1PPPPPPP/RNBQKBNR w KQkq -" : [17,[52, 36, null], "book"],
  "rnbqkbnr/p1pppppp/1p6/8/P2P4/8/1PP1PPPP/RNBQKBNR b KQkq -" : [20,[6, 21, null], "book"],
  "rnbqkbnr/p1p1pppp/1p6/3p4/P2P4/8/1PP1PPPP/RNBQKBNR w KQkq -" : [26,[32, 24, null], "book"],
  "rnbqkbnr/p1p1pppp/1p6/3p4/P2P4/2N5/1PP1PPPP/R1BQKBNR b KQkq -" : [-16,[2, 9, null], "book"],
  "r1bqkbnr/p1pnpppp/1p6/3p4/P2P4/2N5/1PP1PPPP/R1BQKBNR w KQkq -" : [77,[42, 27, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/P7/8/1PPPPPPP/RNBQKBNR w KQkq -" : [-18,[52, 36, null], "book"],
  "rnbqkbnr/pppp1ppp/8/P3p3/8/8/1PPPPPPP/RNBQKBNR b KQkq -" : [-64,[6, 21, null], "book"],
  "rnbqkbnr/ppp2ppp/8/P2pp3/8/8/1PPPPPPP/RNBQKBNR w KQkq -" : [-62,[51, 43, null], "book"],
  "rnbqkbnr/ppp2ppp/8/P2pp3/8/4P3/1PPP1PPP/RNBQKBNR b KQkq -" : [-58,[5, 19, null], "book"],
  "rnbqkbnr/ppp3pp/8/P2ppp2/8/4P3/1PPP1PPP/RNBQKBNR w KQkq -" : [34,[51, 35, null], "book"],
  "rnbqkbnr/ppp3pp/P7/3ppp2/8/4P3/1PPP1PPP/RNBQKBNR b KQkq -" : [-54,[1, 16, null], "book"],
  "rnbqkbnr/pppppppp/8/8/8/1P6/P1PPPPPP/RNBQKBNR b KQkq -" : [-9,[12, 28, null], "book"],
  "rnbqkbnr/p1pppppp/1p6/8/8/1P6/P1PPPPPP/RNBQKBNR w KQkq -" : [32,[62, 45, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/8/1P6/P1PPPPPP/RNBQKBNR w KQkq -" : [8,[58, 49, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/8/1P6/P1PPPPPP/RNBQKBNR w KQkq -" : [10,[62, 45, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/1P6/P1PPPPPP/RNBQKBNR w KQkq -" : [-16,[58, 49, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/1P6/PBPPPPPP/RN1QKBNR b KQkq -" : [-19,[1, 18, null], "book"],
  "rnbqkbnr/pppp2pp/8/4pp2/8/1P6/PBPPPPPP/RN1QKBNR w KQkq -" : [137,[49, 28, null], "book"],
  "rnbqkbnr/pppp2pp/8/4pp2/4P3/1P6/PBPP1PPP/RN1QKBNR b KQkq -" : [4,[1, 18, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/8/1P6/PBPPPPPP/RN1QKBNR w KQkq -" : [-21,[50, 34, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/5P2/1P6/PBPPP1PP/RN1QKBNR b KQkq -" : [-188,[28, 37, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/8/1P6/P1PPPPPP/RNBQKBNR w KQkq -" : [62,[58, 49, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/8/1P6/P1PPPPPP/RNBQKBNR w KQkq -" : [13,[58, 49, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/8/1P6/PBPPPPPP/RN1QKBNR b KQkq -" : [6,[10, 26, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/8/1P6/PBPPPPPP/RN1QKBNR w KQkq -" : [26,[51, 35, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/6P1/1P6/PBPPPP1P/RN1QKBNR b KQkq -" : [-37,[15, 23, null], "book"],
  "rnbqkbnr/pppppppp/8/8/1P6/8/P1PPPPPP/RNBQKBNR b KQkq -" : [-33,[12, 28, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/1P6/8/P1PPPPPP/RNBQKBNR w KQkq -" : [18,[33, 26, null], "book"],
  "rnbqkbnr/pp1ppppp/2p5/8/1P6/8/P1PPPPPP/RNBQKBNR w KQkq -" : [-3,[52, 44, null], "book"],
  "rnbqkbnr/pp1ppppp/2p5/8/1P6/8/PBPPPPPP/RN1QKBNR b KQkq -" : [-17,[8, 24, null], "book"],
  "rnbqkbnr/1p1ppppp/2p5/p7/1P6/8/PBPPPPPP/RN1QKBNR w KQkq -" : [-14,[33, 25, null], "book"],
  "rnbqkbnr/1p1ppppp/2p5/pP6/8/8/PBPPPPPP/RN1QKBNR b KQkq -" : [0,[18, 25, null], "book"],
  "rnbqkbnr/1p1ppppp/8/pp6/8/8/PBPPPPPP/RN1QKBNR w KQkq -" : [-2,[52, 36, null], "book"],
  "rnbqkbnr/1p1ppppp/8/pp6/4P3/8/PBPP1PPP/RN1QKBNR b KQkq -" : [-27,[25, 33, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/1P6/8/P1PPPPPP/RNBQKBNR w KQkq -" : [-22,[62, 45, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/1P6/8/PBPPPPPP/RN1QKBNR b KQkq -" : [-6,[1, 11, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/1P6/8/PBPPPPPP/RN1QKBNR w KQkq -" : [-2,[52, 44, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/PP6/8/1BPPPPPP/RN1QKBNR b KQkq -" : [-18,[6, 21, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/1P6/8/P1PPPPPP/RNBQKBNR w KQkq -" : [-37,[58, 49, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/1P6/P7/2PPPPPP/RNBQKBNR b KQkq -" : [-40,[11, 27, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/1P6/8/PBPPPPPP/RN1QKBNR b KQkq -" : [-32,[5, 33, null], "book"],
  "rnbqkbnr/pp1p1ppp/8/2p1p3/1P6/8/PBPPPPPP/RN1QKBNR w KQkq -" : [25,[48, 40, null], "book"],
  "rnbqkbnr/pppp2pp/5p2/4p3/1P6/8/PBPPPPPP/RN1QKBNR w KQkq -" : [-8,[48, 40, null], "book"],
  "rnbqkbnr/pppp2pp/5p2/4p3/1P2P3/8/PBPP1PPP/RN1QKBNR b KQkq -" : [-64,[5, 33, null], "book"],
  "rnbqk1nr/pppp2pp/5p2/4p3/1b2P3/8/PBPP1PPP/RN1QKBNR w KQkq -" : [-55,[61, 34, null], "book"],
  "rnbqk1nr/pppp2pp/5p2/4p3/1bB1P3/8/PBPP1PPP/RN1QK1NR b KQkq -" : [-64,[1, 18, null], "book"],
  "r1bqk1nr/pppp2pp/2n2p2/4p3/1bB1P3/8/PBPP1PPP/RN1QK1NR w KQkq -" : [-60,[50, 42, null], "book"],
  "r1bqk1nr/pppp2pp/2n2p2/4p3/1bB1PP2/8/PBPP2PP/RN1QK1NR b KQkq -" : [-70,[3, 12, null], "book"],
  "r1b1k1nr/ppppq1pp/2n2p2/4p3/1bB1PP2/8/PBPP2PP/RN1QK1NR w KQkq -" : [-83,[57, 42, null], "book"],
  "r1b1k1nr/ppppq1pp/2n2p2/4pP2/1bB1P3/8/PBPP2PP/RN1QK1NR b KQkq -" : [-167,[18, 24, null], "book"],
  "r1b1k1nr/ppppq2p/2n2pp1/4pP2/1bB1P3/8/PBPP2PP/RN1QK1NR w KQkq -" : [-114,[62, 52, null], "book"],
  "r1bqkbnr/pppppppp/n7/8/1P6/8/P1PPPPPP/RNBQKBNR w KQkq -" : [44,[33, 25, null], "book"],
  "r1bqkbnr/pppppppp/2n5/8/1P6/8/P1PPPPPP/RNBQKBNR w KQkq -" : [14,[33, 25, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/1P6/8/P1PPPPPP/RNBQKBNR w KQkq -" : [-15,[62, 45, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/1P6/8/PBPPPPPP/RN1QKBNR b KQkq -" : [-2,[12, 20, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/1P6/8/PBPPPPPP/RN1QKBNR w KQkq -" : [15,[50, 34, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/1P4P1/8/PBPPPP1P/RN1QKBNR b KQkq -" : [-62,[5, 14, null], "book"],
  "rnbqkb1r/pppppppp/7n/8/1P6/8/P1PPPPPP/RNBQKBNR w KQkq -" : [37,[62, 45, null], "book"],
  "rnbqkbnr/pppppppp/8/8/8/2P5/PP1PPPPP/RNBQKBNR b KQkq -" : [8,[12, 28, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/2P5/PP1PPPPP/RNBQKBNR w KQkq -" : [3,[51, 35, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/2P5/PPQPPPPP/RNB1KBNR b KQkq -" : [-48,[1, 18, null], "book"],
  "rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq -" : [23,[12, 28, null], "book"],
  "rnbqkbnr/p1pppppp/8/1p6/2P5/8/PP1PPPPP/RNBQKBNR w KQkq -" : [93,[34, 25, null], "book"],
  "rnbqkbnr/p1pppppp/1p6/8/2P5/8/PP1PPPPP/RNBQKBNR w KQkq -" : [55,[51, 35, null], "book"],
  "rnbqkbnr/p1pppppp/1p6/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq -" : [54,[2, 9, null], "book"],
  "rn1qkbnr/pbpppppp/1p6/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [54,[57, 42, null], "book"],
  "rn1qkbnr/pbpppppp/1p6/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [47,[6, 21, null], "book"],
  "rn1qkbnr/pbpp1ppp/1p2p3/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [43,[52, 36, null], "book"],
  "rn1qkbnr/pbpp1ppp/1p2p3/8/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [34,[5, 33, null], "book"],
  "rn1qkbnr/pbpp2pp/1p2p3/5p2/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq -" : [100,[36, 28, null], "book"],
  "rn1qkbnr/pbpp2pp/1p2p3/5P2/2PP4/2N5/PP3PPP/R1BQKBNR b KQkq -" : [96,[20, 29, null], "book"],
  "rn1qkb1r/pbpp2pp/1p2pn2/5P2/2PP4/2N5/PP3PPP/R1BQKBNR w KQkq -" : [181,[29, 20, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/2P5/8/PP1PPPPP/RNBQKBNR w KQkq -" : [29,[57, 42, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/1PP5/8/P2PPPPP/RNBQKBNR b KQkq -" : [-87,[26, 33, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/2P5/2N5/PP1PPPPP/R1BQKBNR b KQkq -" : [26,[14, 22, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/2p5/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq -" : [28,[62, 45, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/2p5/2P5/2N3P1/PP1PPP1P/R1BQKBNR b KQkq -" : [20,[14, 22, null], "book"],
  "r1bqkbnr/pp1ppp1p/2n3p1/2p5/2P5/2N3P1/PP1PPP1P/R1BQKBNR w KQkq -" : [24,[61, 54, null], "book"],
  "r1bqkbnr/pp1ppp1p/2n3p1/2p5/2P5/2N3P1/PP1PPPBP/R1BQK1NR b KQkq -" : [22,[5, 14, null], "book"],
  "r1bqk1nr/pp1pppbp/2n3p1/2p5/2P5/2N3P1/PP1PPPBP/R1BQK1NR w KQkq -" : [22,[52, 44, null], "book"],
  "r1bqk1nr/pp1pppbp/2n3p1/2p5/2P5/2N1P1P1/PP1P1PBP/R1BQK1NR b KQkq -" : [29,[12, 20, null], "book"],
  "r1bqk1nr/pp1p1pbp/2n3p1/2p1p3/2P5/2N1P1P1/PP1P1PBP/R1BQK1NR w KQkq -" : [29,[48, 40, null], "book"],
  "r1bqk1nr/pp1pppbp/2n3p1/2p5/2P1P3/2N3P1/PP1P1PBP/R1BQK1NR b KQkq -" : [-19,[8, 16, null], "book"],
  "r1bqk1nr/pp1pppbp/2n3p1/2p5/2P5/2N2NP1/PP1PPPBP/R1BQK2R b KQkq -" : [21,[12, 20, null], "book"],
  "r1bqk2r/pp1pppbp/2n2np1/2p5/2P5/2N2NP1/PP1PPPBP/R1BQK2R w KQkq -" : [52,[51, 35, null], "book"],
  "r1bqk2r/pp1pppbp/2n2np1/2p5/2P5/2N2NP1/PP1PPPBP/R1BQ1RK1 b kq -" : [21,[4, 6, null], "book"],
  "r1bq1rk1/pp1pppbp/2n2np1/2p5/2P5/2N2NP1/PP1PPPBP/R1BQ1RK1 w - -" : [31,[51, 35, null], "book"],
  "r1bq1rk1/pp1pppbp/2n2np1/2p5/2P5/1PN2NP1/P2PPPBP/R1BQ1RK1 b - -" : [-16,[11, 27, null], "book"],
  "r1bq1rk1/pp1pppbp/2n2np1/2p5/2P5/2NP1NP1/PP2PPBP/R1BQ1RK1 b - -" : [2,[11, 27, null], "book"],
  "r1bq1rk1/pp1pppbp/2n2np1/2p5/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 b - -" : [31,[11, 19, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2p5/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq -" : [20,[62, 45, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2p5/2P5/2N3P1/PP1PPP1P/R1BQKBNR b KQkq -" : [40,[1, 18, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pp4/2P5/2N3P1/PP1PPP1P/R1BQKBNR w KQkq -" : [27,[34, 27, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pP4/8/2N3P1/PP1PPP1P/R1BQKBNR b KQkq -" : [32,[21, 27, null], "book"],
  "rnbqkb1r/pp2pppp/8/2pn4/8/2N3P1/PP1PPP1P/R1BQKBNR w KQkq -" : [22,[61, 54, null], "book"],
  "rnbqkb1r/pp2pppp/8/2pn4/8/2N3P1/PP1PPPBP/R1BQK1NR b KQkq -" : [16,[27, 10, null], "book"],
  "rnbqkb1r/ppn1pppp/8/2p5/8/2N3P1/PP1PPPBP/R1BQK1NR w KQkq -" : [22,[51, 43, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2p5/2P5/2N2N2/PP1PPPPP/R1BQKB1R b KQkq -" : [23,[11, 27, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pp4/2P5/2N2N2/PP1PPPPP/R1BQKB1R w KQkq -" : [31,[34, 27, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pP4/8/2N2N2/PP1PPPPP/R1BQKB1R b KQkq -" : [23,[21, 27, null], "book"],
  "rnbqkb1r/pp2pppp/8/2pn4/8/2N2N2/PP1PPPPP/R1BQKB1R w KQkq -" : [30,[51, 35, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/2p5/2P5/2N2N2/PP1PPPPP/R1BQKB1R w KQkq -" : [40,[54, 46, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/2p5/2P5/2N2NP1/PP1PPP1P/R1BQKB1R b KQkq -" : [40,[5, 12, null], "book"],
  "r1bqkb1r/pp1p1ppp/2n1pn2/2p5/2P5/2N2NP1/PP1PPP1P/R1BQKB1R w KQkq -" : [36,[61, 54, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/2P5/5N2/PP1PPPPP/RNBQKB1R b KQkq -" : [33,[1, 18, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2p5/2P5/5N2/PP1PPPPP/RNBQKB1R w KQkq -" : [37,[57, 42, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2p5/1PP5/5N2/P2PPPPP/RNBQKB1R b KQkq -" : [-88,[26, 33, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [23,[26, 35, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/8/2Pp4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [14,[45, 35, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/8/2PN4/8/PP2PPPP/RNBQKB1R b KQkq -" : [29,[8, 16, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/8/2PN4/8/PP2PPPP/RNBQKB1R w KQkq -" : [32,[54, 46, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/8/2PN4/2N5/PP2PPPP/R1BQKB1R b KQkq -" : [10,[11, 27, null], "book"],
  "r1bqkb1r/pp1p1ppp/2n1pn2/8/2PN4/2N5/PP2PPPP/R1BQKB1R w KQkq -" : [37,[54, 46, null], "book"],
  "r1bqkb1r/pp1p1ppp/2n1pn2/8/2PN4/2N3P1/PP2PP1P/R1BQKB1R b KQkq -" : [33,[5, 26, null], "book"],
  "r1b1kb1r/pp1p1ppp/1qn1pn2/8/2PN4/2N3P1/PP2PP1P/R1BQKB1R w KQkq -" : [35,[35, 41, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2p5/2P5/5NP1/PP1PPP1P/RNBQKB1R b KQkq -" : [12,[11, 27, null], "book"],
  "rnbqkb1r/p2ppppp/1p3n2/2p5/2P5/5NP1/PP1PPP1P/RNBQKB1R w KQkq -" : [20,[61, 54, null], "book"],
  "rnbqkb1r/p2ppppp/1p3n2/2p5/2P5/5NP1/PP1PPPBP/RNBQK2R b KQkq -" : [31,[2, 9, null], "book"],
  "rn1qkb1r/pb1ppppp/1p3n2/2p5/2P5/5NP1/PP1PPPBP/RNBQK2R w KQkq -" : [29,[60, 62, null], "book"],
  "rn1qkb1r/pb1ppppp/1p3n2/2p5/2P5/5NP1/PP1PPPBP/RNBQ1RK1 b kq -" : [30,[14, 22, null], "book"],
  "rn1qkb1r/pb1p1ppp/1p2pn2/2p5/2P5/5NP1/PP1PPPBP/RNBQ1RK1 w kq -" : [59,[57, 42, null], "book"],
  "rn1qkb1r/pb1p1ppp/1p2pn2/2p5/2P5/2N2NP1/PP1PPPBP/R1BQ1RK1 b kq -" : [48,[5, 12, null], "book"],
  "rn1qk2r/pb1pbppp/1p2pn2/2p5/2P5/2N2NP1/PP1PPPBP/R1BQ1RK1 w kq -" : [49,[51, 35, null], "book"],
  "rn1qkb1r/pb1ppp1p/1p3np1/2p5/2P5/5NP1/PP1PPPBP/RNBQ1RK1 w kq -" : [37,[57, 42, null], "book"],
  "rnbqkbnr/pp1ppppp/2p5/8/2P5/8/PP1PPPPP/RNBQKBNR w KQkq -" : [40,[51, 35, null], "book"],
  "rnbqkbnr/pp1ppppp/2p5/8/2P5/5N2/PP1PPPPP/RNBQKB1R b KQkq -" : [40,[11, 27, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/2P5/5N2/PP1PPPPP/RNBQKB1R w KQkq -" : [37,[51, 35, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/2P5/1P3N2/P2PPPPP/RNBQKB1R b KQkq -" : [6,[6, 21, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/3p4/2P5/1P3N2/P2PPPPP/RNBQKB1R w KQkq -" : [20,[58, 49, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/3p4/2P5/1P3NP1/P2PPP1P/RNBQKB1R b KQkq -" : [-18,[2, 29, null], "book"],
  "rnbqkb1r/pp2pp1p/2p2np1/3p4/2P5/1P3NP1/P2PPP1P/RNBQKB1R w KQkq -" : [34,[58, 49, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/2P5/8/PP1PPPPP/RNBQKBNR w KQkq -" : [71,[34, 27, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3P4/8/8/PP1PPPPP/RNBQKBNR b KQkq -" : [53,[3, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3P4/8/8/PP1PPPPP/RNBQKBNR w KQkq -" : [105,[27, 20, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3P4/8/8/PP1PPPPP/RNBQKBNR w KQkq -" : [82,[62, 45, null], "book"],
  "rnb1kbnr/ppp1pppp/8/3q4/8/8/PP1PPPPP/RNBQKBNR w KQkq -" : [76,[57, 42, null], "book"],
  "rnb1kbnr/ppp1pppp/8/3q4/8/2N5/PP1PPPPP/R1BQKBNR b KQkq -" : [67,[27, 19, null], "book"],
  "rnb1kbnr/ppp1pppp/8/q7/8/2N5/PP1PPPPP/R1BQKBNR w KQkq -" : [90,[51, 35, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR w KQkq -" : [34,[54, 46, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/2P5/4P3/PP1P1PPP/RNBQKBNR b KQkq -" : [0,[6, 21, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/2P5/4P3/PP1P1PPP/RNBQKBNR w KQkq -" : [-10,[57, 42, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/2P2P2/4P3/PP1P2PP/RNBQKBNR b KQkq -" : [-139,[28, 37, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/8/2P2p2/4P3/PP1P2PP/RNBQKBNR w KQkq -" : [-119,[44, 37, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/8/2P2p2/4PN2/PP1P2PP/RNBQKB1R b KQkq -" : [-122,[37, 44, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/2P2P2/8/PP1PP1PP/RNBQKBNR b KQkq -" : [-101,[28, 37, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/2P5/6P1/PP1PPP1P/RNBQKBNR b KQkq -" : [23,[6, 21, null], "book"],
  "rnbqkbnr/pppp1pp1/8/4p2p/2P5/6P1/PP1PPP1P/RNBQKBNR w KQkq -" : [65,[62, 45, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR b KQkq -" : [26,[6, 21, null], "book"],
  "rnbqk1nr/pppp1ppp/8/4p3/1bP5/2N5/PP1PPPPP/R1BQKBNR w KQkq -" : [8,[54, 46, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq -" : [43,[54, 46, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/4p3/2P5/2N3P1/PP1PPP1P/R1BQKBNR b KQkq -" : [44,[10, 26, null], "book"],
  "rn1qkbnr/ppp2ppp/3pb3/4p3/2P5/2N3P1/PP1PPP1P/R1BQKBNR w KQkq -" : [55,[62, 45, null], "book"],
  "rn1qkbnr/ppp2ppp/3pb3/4p3/2P5/2N3P1/PP1PPPBP/R1BQK1NR b KQkq -" : [44,[10, 18, null], "book"],
  "r2qkbnr/ppp2ppp/2npb3/4p3/2P5/2N3P1/PP1PPPBP/R1BQK1NR w KQkq -" : [62,[62, 45, null], "book"],
  "rnbqkbnr/pp3ppp/2pp4/4p3/2P5/2N3P1/PP1PPP1P/R1BQKBNR w KQkq -" : [50,[61, 54, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/4p3/2P5/2N2N2/PP1PPPPP/R1BQKB1R b KQkq -" : [35,[13, 29, null], "book"],
  "rn1qkbnr/ppp2ppp/3p4/4p3/2P3b1/2N2N2/PP1PPPPP/R1BQKB1R w KQkq -" : [92,[51, 35, null], "book"],
  "rnbqkbnr/pppp2pp/8/4pp2/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq -" : [38,[52, 44, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq -" : [40,[54, 46, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/2P5/2N3P1/PP1PPP1P/R1BQKBNR b KQkq -" : [29,[14, 22, null], "book"],
  "r1bqkbnr/pppp1p1p/2n3p1/4p3/2P5/2N3P1/PP1PPP1P/R1BQKBNR w KQkq -" : [34,[51, 43, null], "book"],
  "r1bqkbnr/pppp1p1p/2n3p1/4p3/2P5/2N3P1/PP1PPPBP/R1BQK1NR b KQkq -" : [33,[5, 14, null], "book"],
  "r1bqk1nr/pppp1pbp/2n3p1/4p3/2P5/2N3P1/PP1PPPBP/R1BQK1NR w KQkq -" : [33,[56, 57, null], "book"],
  "r1bqk1nr/pppp1pbp/2n3p1/4p3/2P5/2N3P1/PP1PPPBP/1RBQK1NR b Kkq -" : [31,[6, 21, null], "book"],
  "r1bqk1nr/pppp1pbp/2n3p1/4p3/2P5/2NP2P1/PP2PPBP/R1BQK1NR b KQkq -" : [27,[8, 24, null], "book"],
  "r1bqk1nr/ppp2pbp/2np2p1/4p3/2P5/2NP2P1/PP2PPBP/R1BQK1NR w KQkq -" : [33,[56, 57, null], "book"],
  "r1bqk1nr/ppp2pbp/2np2p1/4p3/2P1P3/2NP2P1/PP3PBP/R1BQK1NR b KQkq -" : [23,[6, 12, null], "book"],
  "r1bqk1nr/pppp1pbp/2n3p1/4p3/2P5/2N1P1P1/PP1P1PBP/R1BQK1NR b KQkq -" : [36,[11, 19, null], "book"],
  "r1bqk1nr/ppp2pbp/2np2p1/4p3/2P5/2N1P1P1/PP1P1PBP/R1BQK1NR w KQkq -" : [36,[62, 52, null], "book"],
  "r1bqk1nr/ppp2pbp/2np2p1/4p3/2P5/2N1P1P1/PP1PNPBP/R1BQK2R b KQkq -" : [21,[15, 31, null], "book"],
  "r2qk1nr/ppp2pbp/2npb1p1/4p3/2P5/2N1P1P1/PP1PNPBP/R1BQK2R w KQkq -" : [54,[51, 35, null], "book"],
  "r1bqk1nr/pppp1pbp/2n3p1/4p3/2P1P3/2N3P1/PP1P1PBP/R1BQK1NR b KQkq -" : [27,[11, 19, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/2P5/2N2N2/PP1PPPPP/R1BQKB1R b KQkq -" : [14,[6, 21, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2P5/2N2N2/PP1PPPPP/R1BQKB1R w KQkq -" : [29,[54, 46, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2P5/P1N2N2/1P1PPPPP/R1BQKB1R b KQkq -" : [-4,[11, 27, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2P5/2NP1N2/PP2PPPP/R1BQKB1R b KQkq -" : [15,[11, 27, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [2,[28, 36, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/8/2PPp3/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [-6,[45, 62, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/8/2Pp4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [6,[45, 35, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2P5/2N1PN2/PP1P1PPP/R1BQKB1R b KQkq -" : [2,[5, 33, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/4p3/1bP5/2N1PN2/PP1P1PPP/R1BQKB1R w KQkq -" : [4,[59, 50, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/4p3/1bP5/2N1PN2/PPQP1PPP/R1B1KB1R b KQkq -" : [9,[33, 42, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/4p3/2P5/2b1PN2/PPQP1PPP/R1B1KB1R w KQkq -" : [10,[50, 42, null], "book"],
  "r1bq1rk1/pppp1ppp/2n2n2/4p3/1bP5/2N1PN2/PPQP1PPP/R1B1KB1R w KQ -" : [18,[42, 27, null], "book"],
  "r1bq1rk1/pppp1ppp/2n2n2/3Np3/1bP5/4PN2/PPQP1PPP/R1B1KB1R b KQ -" : [19,[33, 12, null], "book"],
  "r1bqr1k1/pppp1ppp/2n2n2/3Np3/1bP5/4PN2/PPQP1PPP/R1B1KB1R w KQ -" : [26,[45, 30, null], "book"],
  "r1bqr1k1/pppp1ppp/2n2n2/3NpQ2/1bP5/4PN2/PP1P1PPP/R1B1KB1R b KQ -" : [-27,[11, 19, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2P1P3/2N2N2/PP1P1PPP/R1BQKB1R b KQkq -" : [7,[5, 33, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2P5/2N2NP1/PP1PPP1P/R1BQKB1R b KQkq -" : [12,[5, 33, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq -" : [27,[62, 45, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/2P2P2/2N5/PP1PP1PP/R1BQKBNR b KQkq -" : [-19,[28, 37, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/2P5/2N3P1/PP1PPP1P/R1BQKBNR b KQkq -" : [25,[5, 33, null], "book"],
  "rnbqk2r/pppp1ppp/5n2/4p3/1bP5/2N3P1/PP1PPP1P/R1BQKBNR w KQkq -" : [15,[61, 54, null], "book"],
  "rnbqkb1r/pp1p1ppp/2p2n2/4p3/2P5/2N3P1/PP1PPP1P/R1BQKBNR w KQkq -" : [24,[62, 45, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3pp3/2P5/2N3P1/PP1PPP1P/R1BQKBNR w KQkq -" : [30,[34, 27, null], "book"],
  "rnbqkb1r/pppp1p1p/5np1/4p3/2P5/2N3P1/PP1PPP1P/R1BQKBNR w KQkq -" : [57,[62, 45, null], "book"],
  "rnbqkb1r/pppp1p1p/5np1/4p3/2P5/2N3P1/PP1PPPBP/R1BQK1NR b KQkq -" : [50,[5, 14, null], "book"],
  "rnbqk2r/pppp1pbp/5np1/4p3/2P5/2N3P1/PP1PPPBP/R1BQK1NR w KQkq -" : [49,[62, 45, null], "book"],
  "rnbqk2r/pppp1pbp/5np1/4p3/2P5/2NP2P1/PP2PPBP/R1BQK1NR b KQkq -" : [35,[1, 18, null], "book"],
  "rnbqk2r/ppp2pbp/3p1np1/4p3/2P5/2NP2P1/PP2PPBP/R1BQK1NR w KQkq -" : [29,[49, 33, null], "book"],
  "rnbqk2r/ppp2pbp/3p1np1/4p3/2P1P3/2NP2P1/PP3PBP/R1BQK1NR b KQkq -" : [18,[4, 6, null], "book"],
  "rnbq1rk1/ppp2pbp/3p1np1/4p3/2P1P3/2NP2P1/PP3PBP/R1BQK1NR w KQ -" : [26,[62, 52, null], "book"],
  "rnbq1rk1/ppp2pbp/3p1np1/4p3/2P1P3/2NP2P1/PP2NPBP/R1BQK2R b KQ -" : [21,[10, 26, null], "book"],
  "rnbq1rk1/pp3pbp/2pp1np1/4p3/2P1P3/2NP2P1/PP2NPBP/R1BQK2R w KQ -" : [49,[49, 33, null], "book"],
  "rnbq1rk1/pp3pbp/2pp1np1/4p3/2P1P3/2NP2P1/PP2NPBP/R1BQ1RK1 b - -" : [40,[8, 16, null], "book"],
  "rnbq1rk1/1p3pbp/p1pp1np1/4p3/2P1P3/2NP2P1/PP2NPBP/R1BQ1RK1 w - -" : [42,[49, 33, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/2P5/2N2N2/PP1PPPPP/R1BQKB1R b KQkq -" : [17,[1, 18, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/8/2P1p3/2N2N2/PP1PPPPP/R1BQKB1R w KQkq -" : [59,[45, 30, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/6N1/2P1p3/2N5/PP1PPPPP/R1BQKB1R b KQkq -" : [53,[10, 18, null], "book"],
  "rnbqkb1r/p1pp1ppp/5n2/1p4N1/2P1p3/2N5/PP1PPPPP/R1BQKB1R w KQkq -" : [70,[51, 43, null], "book"],
  "rnbqkb1r/pppp1ppp/8/6N1/2P1p1n1/2N5/PP1PPPPP/R1BQKB1R w KQkq -" : [188,[30, 36, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/2P5/5N2/PP1PPPPP/RNBQKB1R b KQkq -" : [-10,[28, 36, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/2P1p3/5N2/PP1PPPPP/RNBQKB1R w KQkq -" : [-9,[45, 35, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/Q1P5/8/PP1PPPPP/RNB1KBNR b KQkq -" : [-16,[6, 21, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/8/2P5/8/PP1PPPPP/RNBQKBNR w KQkq -" : [27,[62, 45, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq -" : [32,[6, 21, null], "book"],
  "rnbqkbnr/p1pp1ppp/1p2p3/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [59,[52, 36, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/8/2P5/5N2/PP1PPPPP/RNBQKB1R b KQkq -" : [27,[11, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/2P5/5N2/PP1PPPPP/RNBQKB1R w KQkq -" : [38,[51, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/2P5/1P3N2/P2PPPPP/RNBQKB1R b KQkq -" : [-22,[27, 35, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/2P5/1P3N2/P2PPPPP/RNBQKB1R w KQkq -" : [10,[52, 44, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/2P5/1P3N2/PB1PPPPP/RN1QKB1R b KQkq -" : [13,[10, 26, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pp4/2P5/1P3N2/PB1PPPPP/RN1QKB1R w KQkq -" : [5,[52, 44, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pp4/2P5/1P2PN2/PB1P1PPP/RN1QKB1R b KQkq -" : [9,[1, 18, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/2P5/5NP1/PP1PPP1P/RNBQKB1R b KQkq -" : [2,[27, 34, null], "book"],
  "rnbqkbnr/pp3ppp/2p1p3/3p4/2P5/5NP1/PP1PPP1P/RNBQKB1R w KQkq -" : [47,[61, 54, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/2P5/5NP1/PP1PPP1P/RNBQKB1R w KQkq -" : [32,[51, 35, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/2P5/5NP1/PP1PPPBP/RNBQK2R b KQkq -" : [21,[27, 35, null], "book"],
  "rnbqk2r/ppp1bppp/4pn2/3p4/2P5/5NP1/PP1PPPBP/RNBQK2R w KQkq -" : [51,[51, 35, null], "book"],
  "rnbqk2r/ppp1bppp/4pn2/3p4/2P5/5NP1/PP1PPPBP/RNBQ1RK1 b kq -" : [46,[10, 26, null], "book"],
  "rnbqk2r/pp2bppp/4pn2/2pp4/2P5/5NP1/PP1PPPBP/RNBQ1RK1 w kq -" : [53,[51, 35, null], "book"],
  "rnbqk2r/pp2bppp/4pn2/2pP4/8/5NP1/PP1PPPBP/RNBQ1RK1 b kq -" : [39,[20, 27, null], "book"],
  "rnbqk2r/pp2bppp/4p3/2pn4/8/5NP1/PP1PPPBP/RNBQ1RK1 w kq -" : [45,[51, 35, null], "book"],
  "rnbqk2r/pp2bppp/4p3/2pn4/8/2N2NP1/PP1PPPBP/R1BQ1RK1 b kq -" : [58,[4, 6, null], "book"],
  "r1bqk2r/pp2bppp/2n1p3/2pn4/8/2N2NP1/PP1PPPBP/R1BQ1RK1 w kq -" : [63,[51, 35, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/8/2p5/5NP1/PP1PPPBP/RNBQK2R w KQkq -" : [28,[59, 32, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/8/2P5/5N2/PP1PPPPP/RNBQKB1R w KQkq -" : [41,[54, 46, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/8/2P5/5NP1/PP1PPP1P/RNBQKB1R b KQkq -" : [41,[11, 27, null], "book"],
  "rnbqkb1r/1ppp1ppp/p3pn2/8/2P5/5NP1/PP1PPP1P/RNBQKB1R w KQkq -" : [57,[61, 54, null], "book"],
  "rnbqkb1r/1ppp1ppp/p3pn2/8/2P5/5NP1/PP1PPPBP/RNBQK2R b KQkq -" : [37,[11, 27, null], "book"],
  "rnbqkb1r/2pp1ppp/p3pn2/1p6/2P5/5NP1/PP1PPPBP/RNBQK2R w KQkq -" : [45,[49, 41, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/2P5/8/PP1PPPPP/RNBQKBNR w KQkq -" : [60,[62, 45, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/1PP5/8/P2PPPPP/RNBQKBNR b KQkq -" : [33,[12, 28, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/2P1P3/8/PP1P1PPP/RNBQKBNR b KQkq -" : [-18,[29, 36, null], "book"],
  "rnbqkbnr/ppppp1pp/8/8/2P1p3/8/PP1P1PPP/RNBQKBNR w KQkq -" : [-35,[57, 42, null], "book"],
  "rnbqkbnr/ppppp1pp/8/8/2P1p3/3P4/PP3PPP/RNBQKBNR b KQkq -" : [-31,[6, 21, null], "book"],
  "rnbqkbnr/ppppp1pp/8/8/2P1p3/2N5/PP1P1PPP/R1BQKBNR b KQkq -" : [-34,[6, 21, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/8/2P1p3/2N5/PP1P1PPP/R1BQKBNR w KQkq -" : [-34,[51, 35, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/8/2P1p1P1/2N5/PP1P1P1P/R1BQKBNR b KQkq -" : [-64,[14, 22, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/2P3P1/8/PP1PPP1P/RNBQKBNR b KQkq -" : [-26,[29, 38, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/2P5/5N2/PP1PPPPP/RNBQKB1R b KQkq -" : [65,[14, 22, null], "book"],
  "rnbqkbnr/ppp1p1pp/3p4/5p2/2P5/5N2/PP1PPPPP/RNBQKB1R w KQkq -" : [57,[51, 35, null], "book"],
  "rnbqkbnr/ppp1p1pp/3p4/5p2/2P1P3/5N2/PP1P1PPP/RNBQKB1R b KQkq -" : [-5,[29, 36, null], "book"],
  "rnbqkbnr/pppppp1p/8/6p1/2P5/8/PP1PPPPP/RNBQKBNR w KQkq -" : [120,[57, 42, null], "book"],
  "rnbqkbnr/pppppp1p/8/6p1/2PP4/8/PP2PPPP/RNBQKBNR b KQkq -" : [118,[5, 14, null], "book"],
  "rnbqk1nr/ppppppbp/8/6p1/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [126,[57, 42, null], "book"],
  "rnbqkbnr/pppp1p1p/8/4p1p1/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [144,[62, 45, null], "book"],
  "rnbqkbnr/pppppp1p/6p1/8/2P5/8/PP1PPPPP/RNBQKBNR w KQkq -" : [38,[51, 35, null], "book"],
  "rnbqkbnr/pppppp1p/6p1/8/2P1P3/8/PP1P1PPP/RNBQKBNR b KQkq -" : [26,[12, 28, null], "book"],
  "rnbqkbnr/pppp1p1p/6p1/4p3/2P1P3/8/PP1P1PPP/RNBQKBNR w KQkq -" : [35,[51, 35, null], "book"],
  "rnbqkbnr/pppppp1p/6p1/8/2P5/2N5/PP1PPPPP/R1BQKBNR b KQkq -" : [20,[10, 26, null], "book"],
  "rnbqk1nr/ppppppbp/6p1/8/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq -" : [64,[51, 35, null], "book"],
  "rnbqk1nr/ppppppbp/6p1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [60,[11, 19, null], "book"],
  "rnbqk1nr/pp1pppbp/6p1/2p5/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [59,[35, 27, null], "book"],
  "rnbqk1nr/pp1pppbp/6p1/2pP4/2P5/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [62,[14, 42, null], "book"],
  "rnbqk1nr/pp1ppp1p/6p1/2pP4/2P5/2b5/PP2PPPP/R1BQKBNR w KQkq -" : [90,[49, 42, null], "book"],
  "rnbqk1nr/pp1ppp1p/6p1/2pP4/2P5/2P5/P3PPPP/R1BQKBNR b KQkq -" : [54,[6, 21, null], "book"],
  "rnbqk1nr/pp1pp2p/6p1/2pP1p2/2P5/2P5/P3PPPP/R1BQKBNR w KQkq -" : [56,[55, 39, null], "book"],
  "r1bqkbnr/pppppppp/2n5/8/2P5/8/PP1PPPPP/RNBQKBNR w KQkq -" : [42,[51, 35, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/2P5/8/PP1PPPPP/RNBQKBNR w KQkq -" : [31,[62, 45, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/1PP5/8/P2PPPPP/RNBQKBNR b KQkq -" : [-41,[12, 28, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/2P5/6P1/PP1PPP1P/RNBQKBNR b KQkq -" : [25,[12, 28, null], "book"],
  "rnbqkb1r/ppppppp1/5n2/7p/2P5/6P1/PP1PPP1P/RNBQKBNR w KQkq -" : [47,[62, 45, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/2P5/2N5/PP1PPPPP/R1BQKBNR b KQkq -" : [31,[12, 28, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq -" : [32,[34, 27, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3P4/8/2N5/PP1PPPPP/R1BQKBNR b KQkq -" : [29,[21, 27, null], "book"],
  "rnbqkb1r/ppp1pppp/8/3n4/8/2N5/PP1PPPPP/R1BQKBNR w KQkq -" : [24,[62, 45, null], "book"],
  "rnbqkb1r/ppp1pppp/8/3n4/8/2N3P1/PP1PPP1P/R1BQKBNR b KQkq -" : [26,[27, 42, null], "book"],
  "rnbqkb1r/ppp1pp1p/6p1/3n4/8/2N3P1/PP1PPP1P/R1BQKBNR w KQkq -" : [39,[61, 54, null], "book"],
  "rnbqkb1r/ppp1pp1p/6p1/3n4/8/2N3P1/PP1PPPBP/R1BQK1NR b KQkq -" : [48,[27, 42, null], "book"],
  "rnbqkb1r/ppp1pp1p/1n4p1/8/8/2N3P1/PP1PPPBP/R1BQK1NR w KQkq -" : [48,[51, 43, null], "book"],
  "rnbqkb1r/ppp1pp1p/6p1/8/8/2n3P1/PP1PPPBP/R1BQK1NR w KQkq -" : [59,[49, 42, null], "book"],
  "rnbqkb1r/ppp1pppp/8/3n4/8/2N2N2/PP1PPPPP/R1BQKB1R b KQkq -" : [33,[10, 26, null], "book"],
  "rnbqkb1r/ppp1pp1p/6p1/3n4/8/2N2N2/PP1PPPPP/R1BQKB1R w KQkq -" : [38,[59, 41, null], "book"],
  "rnbqkb1r/ppp1pp1p/6p1/3n4/8/2N2NP1/PP1PPP1P/R1BQKB1R b KQkq -" : [16,[5, 14, null], "book"],
  "rnbqk2r/ppp1ppbp/6p1/3n4/8/2N2NP1/PP1PPP1P/R1BQKB1R w KQkq -" : [13,[61, 54, null], "book"],
  "rnbqk2r/ppp1ppbp/6p1/3n4/8/2N2NP1/PP1PPPBP/R1BQK2R b KQkq -" : [13,[10, 26, null], "book"],
  "rnbqk2r/ppp2pbp/6p1/3np3/8/2N2NP1/PP1PPPBP/R1BQK2R w KQkq -" : [27,[51, 43, null], "book"],
  "rnbqkb1r/ppp1pp1p/6p1/3n4/Q7/2N2N2/PP1PPPPP/R1B1KB1R b KQkq -" : [12,[1, 18, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/8/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq -" : [34,[52, 36, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/8/2P1P3/2N5/PP1P1PPP/R1BQKBNR b KQkq -" : [34,[11, 27, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/2p5/2P1P3/2N5/PP1P1PPP/R1BQKBNR w KQkq -" : [38,[36, 28, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/2p1P3/2P5/2N5/PP1P1PPP/R1BQKBNR b KQkq -" : [34,[21, 6, null], "book"],
  "rnbqkbnr/pp1p1ppp/4p3/2p1P3/2P5/2N5/PP1P1PPP/R1BQKBNR w KQkq -" : [43,[51, 35, null], "book"],
  "r1bqkb1r/pppp1ppp/2n1pn2/8/2P1P3/2N5/PP1P1PPP/R1BQKBNR w KQkq -" : [78,[51, 35, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/8/2P5/2N2N2/PP1PPPPP/R1BQKB1R b KQkq -" : [19,[10, 26, null], "book"],
  "rnbqkb1r/p1pp1ppp/1p2pn2/8/2P5/2N2N2/PP1PPPPP/R1BQKB1R w KQkq -" : [48,[52, 36, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/8/1bP5/2N2N2/PP1PPPPP/R1BQKB1R w KQkq -" : [32,[59, 50, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/8/1bP3P1/2N2N2/PP1PPP1P/R1BQKB1R b KQkq -" : [9,[15, 23, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq -" : [44,[51, 35, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/2P5/2N2N2/PP1PPPPP/R1BQKB1R b KQkq -" : [54,[10, 26, null], "book"],
  "rnbqk2r/ppppppbp/5np1/8/2P5/2N2N2/PP1PPPPP/R1BQKB1R w KQkq -" : [64,[52, 36, null], "book"],
  "rnbqk2r/ppppppbp/5np1/8/2P1P3/2N2N2/PP1P1PPP/R1BQKB1R b KQkq -" : [23,[10, 26, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/2P5/5N2/PP1PPPPP/RNBQKB1R b KQkq -" : [31,[10, 26, null], "book"],
  "rnbqkbnr/pppppppp/8/8/8/3P4/PPP1PPPP/RNBQKBNR b KQkq -" : [-24,[11, 27, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/8/3P4/PPP1PPPP/RNBQKBNR w KQkq -" : [3,[50, 34, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/8/2NP4/PPP1PPPP/R1BQKBNR b KQkq -" : [-39,[11, 27, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/2p5/8/2NP4/PPP1PPPP/R1BQKBNR w KQkq -" : [-12,[52, 36, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/2p5/8/2NP2P1/PPP1PP1P/R1BQKBNR b KQkq -" : [-35,[11, 27, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/3P4/PPP1PPPP/RNBQKBNR w KQkq -" : [-1,[50, 34, null], "book"],
  "rnbqkbnr/pppppp1p/6p1/8/8/3P4/PPP1PPPP/RNBQKBNR w KQkq -" : [-3,[50, 34, null], "book"],
  "rnbqkbnr/pppppp1p/6p1/8/6P1/3P4/PPP1PP1P/RNBQKBNR b KQkq -" : [-83,[11, 27, null], "book"],
  "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq -" : [31,[11, 27, null], "book"],
  "rnbqkbnr/1ppppppp/p7/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -" : [68,[52, 36, null], "book"],
  "rnbqkbnr/1ppppppp/p7/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq -" : [43,[12, 20, null], "book"],
  "rnbqkbnr/2pppppp/p7/1p6/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [73,[52, 36, null], "book"],
  "rnbqkbnr/2pppppp/p7/1p6/2PPP3/8/PP3PPP/RNBQKBNR b KQkq -" : [78,[2, 9, null], "book"],
  "rnbqkbnr/2pp1ppp/p3p3/1p6/2PPP3/8/PP3PPP/RNBQKBNR w KQkq -" : [97,[34, 25, null], "book"],
  "rnbqkbnr/2pp1ppp/p3p3/1P6/3PP3/8/PP3PPP/RNBQKBNR b KQkq -" : [90,[2, 9, null], "book"],
  "rnbqkbnr/2pp1ppp/4p3/1p6/3PP3/8/PP3PPP/RNBQKBNR w KQkq -" : [85,[61, 25, null], "book"],
  "rnbqkbnr/p1pppppp/8/1p6/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -" : [93,[52, 36, null], "book"],
  "rnbqkbnr/p1pppppp/8/1p6/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -" : [98,[8, 16, null], "book"],
  "rn1qkbnr/pbpppppp/8/1p6/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [99,[57, 51, null], "book"],
  "rn1qkbnr/pbpppppp/8/1B6/3PP3/8/PPP2PPP/RNBQK1NR b KQkq -" : [74,[9, 36, null], "book"],
  "rnbqkbnr/p1pppppp/1p6/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -" : [93,[52, 36, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -" : [77,[35, 27, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/1P1P4/8/P1P1PPPP/RNBQKBNR b KQkq -" : [-60,[26, 35, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/1p1P4/8/P1P1PPPP/RNBQKBNR w KQkq -" : [-37,[48, 40, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2pP4/8/8/PPP1PPPP/RNBQKBNR b KQkq -" : [70,[14, 22, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/2pP4/8/8/PPP1PPPP/RNBQKBNR w KQkq -" : [84,[50, 34, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/2pP4/8/2N5/PPP1PPPP/R1BQKBNR b KQkq -" : [63,[6, 21, null], "book"],
  "rnbqkbnr/pp2pp1p/3p2p1/2pP4/8/2N5/PPP1PPPP/R1BQKBNR w KQkq -" : [80,[52, 36, null], "book"],
  "rnbqkbnr/pp1p1ppp/8/2pPp3/8/8/PPP1PPPP/RNBQKBNR w KQkq e6" : [107,[57, 42, null], "book"],
  "rnbqkbnr/pp1p1ppp/8/2pPp3/4P3/8/PPP2PPP/RNBQKBNR b KQkq -" : [112,[11, 19, null], "book"],
  "rnbqkbnr/pp3ppp/3p4/2pPp3/4P3/8/PPP2PPP/RNBQKBNR w KQkq -" : [112,[62, 52, null], "book"],
  "rnbqkbnr/pp1p1ppp/4p3/2pP4/8/8/PPP1PPPP/RNBQKBNR w KQkq -" : [88,[50, 34, null], "book"],
  "rnbqkbnr/pp1p1ppp/4p3/2pP4/4P3/8/PPP2PPP/RNBQKBNR b KQkq -" : [59,[6, 21, null], "book"],
  "rnbqkbnr/pp1pp1pp/8/2pP1p2/8/8/PPP1PPPP/RNBQKBNR w KQkq -" : [119,[52, 36, null], "book"],
  "rnbqkbnr/pp1pp1pp/8/2pP1p2/4P3/8/PPP2PPP/RNBQKBNR b KQkq -" : [117,[29, 36, null], "book"],
  "r1bqkbnr/pp1ppppp/n7/2pP4/8/8/PPP1PPPP/RNBQKBNR w KQkq -" : [100,[52, 36, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2pP4/8/8/PPP1PPPP/RNBQKBNR w KQkq -" : [68,[57, 42, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2pP4/2P5/8/PP2PPPP/RNBQKBNR b KQkq -" : [73,[9, 25, null], "book"],
  "rnbqkb1r/pp1ppppp/8/2pP4/2P1n3/8/PP2PPPP/RNBQKBNR w KQkq -" : [121,[59, 50, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2pP4/8/2N5/PPP1PPPP/R1BQKBNR b KQkq -" : [67,[14, 22, null], "book"],
  "rnb1kb1r/pp1ppppp/5n2/q1pP4/8/2N5/PPP1PPPP/R1BQKBNR w KQkq -" : [119,[58, 51, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2pP4/8/5N2/PPP1PPPP/RNBQKB1R b KQkq -" : [49,[9, 25, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/3P4/2p5/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [118,[52, 36, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2P5/8/8/PPP1PPPP/RNBQKBNR b KQkq -" : [19,[12, 20, null], "book"],
  "rnbqkbnr/p2ppppp/1p6/2P5/8/8/PPP1PPPP/RNBQKBNR w KQkq -" : [122,[26, 17, null], "book"],
  "r1bqkbnr/pp1ppppp/n7/2P5/8/8/PPP1PPPP/RNBQKBNR w KQkq -" : [77,[52, 36, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq -" : [-4,[26, 35, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/3p4/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [1,[59, 35, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/1P1p4/5N2/P1P1PPPP/RNBQKB1R b KQkq -" : [-95,[12, 28, null], "book"],
  "rnbqkbnr/pp1p1ppp/8/4p3/1P1p4/5N2/P1P1PPPP/RNBQKB1R w KQkq -" : [-91,[48, 40, null], "book"],
  "rnbqkbnr/pp1ppppp/2p5/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -" : [32,[52, 36, null], "book"],
  "rnbqkbnr/pp1ppppp/2p5/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq -" : [27,[11, 27, null], "book"],
  "rnbqkbnr/pp2pppp/2pp4/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [77,[52, 36, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -" : [33,[50, 34, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq -" : [10,[10, 26, null], "book"],
  "rnbqkbnr/pp2pppp/8/2pp4/3P1B2/8/PPP1PPPP/RN1QKBNR w KQkq -" : [12,[52, 44, null], "book"],
  "rnbqkbnr/pp2pppp/8/2pp4/3PPB2/8/PPP2PPP/RN1QKBNR b KQkq -" : [-30,[27, 36, null], "book"],
  "rnbqkbnr/pp2pppp/8/2p5/3PpB2/8/PPP2PPP/RN1QKBNR w KQkq -" : [-35,[62, 52, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p2B1/3P4/8/PPP1PPPP/RN1QKBNR b KQkq -" : [-17,[13, 21, null], "book"],
  "rn1qkbnr/ppp1pppp/8/3p2B1/3P2b1/8/PPP1PPPP/RN1QKBNR w KQkq -" : [38,[53, 45, null], "book"],
  "rnbqkbnr/ppp1ppp1/7p/3p2B1/3P4/8/PPP1PPPP/RN1QKBNR w KQkq -" : [-3,[30, 37, null], "book"],
  "rnbqkbnr/ppp1ppp1/7p/3p4/3P3B/8/PPP1PPPP/RN1QKBNR b KQkq -" : [-21,[10, 26, null], "book"],
  "rnbqkbnr/pp2ppp1/2p4p/3p4/3P3B/8/PPP1PPPP/RN1QKBNR w KQkq -" : [19,[62, 45, null], "book"],
  "rnbqkbnr/pp2ppp1/2p4p/3p4/3P3B/5N2/PPP1PPPP/RN1QKB1R b KQkq -" : [-8,[3, 17, null], "book"],
  "rnb1kbnr/pp2ppp1/1qp4p/3p4/3P3B/5N2/PPP1PPPP/RN1QKB1R w KQkq -" : [-6,[57, 51, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq -" : [36,[12, 20, null], "book"],
  "rnbqkbnr/p1p1pppp/8/1p1p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [130,[34, 25, null], "book"],
  "rn1qkbnr/ppp1pppp/8/3p1b2/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [81,[34, 27, null], "book"],
  "rn1qkbnr/ppp1pppp/8/3P1b2/3P4/8/PP2PPPP/RNBQKBNR b KQkq -" : [68,[29, 57, null], "book"],
  "rn1qkbnr/ppp1pppp/8/3P4/3P4/8/PP2PPPP/RbBQKBNR w KQkq -" : [68,[59, 32, null], "book"],
  "rn1qkbnr/ppp1pppp/8/3P4/Q2P4/8/PP2PPPP/RbB1KBNR b KQkq -" : [87,[10, 18, null], "book"],
  "rn1qkbnr/pp2pppp/2p5/3P4/Q2P4/8/PP2PPPP/RbB1KBNR w KQkq -" : [76,[27, 18, null], "book"],
  "rn1qkbnr/pp2pppp/2P5/8/Q2P4/8/PP2PPPP/RbB1KBNR b KQkq -" : [81,[1, 18, null], "book"],
  "r2qkbnr/pp2pppp/2n5/8/Q2P4/8/PP2PPPP/RbB1KBNR w KQkq -" : [73,[56, 57, null], "book"],
  "r2qkbnr/pp2pppp/2n5/8/Q2P4/8/PP2PPPP/1RB1KBNR b Kkq -" : [82,[3, 35, null], "book"],
  "r3kbnr/pp2pppp/2n5/8/Q2q4/8/PP2PPPP/1RB1KBNR w Kkq -" : [78,[32, 35, null], "book"],
  "rn1qkbnr/ppp1pppp/8/3p1b2/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [36,[12, 20, null], "book"],
  "rn1qkbnr/ppp2ppp/4p3/3p1b2/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [55,[59, 41, null], "book"],
  "rn1qkbnr/ppp2ppp/4p3/3p1b2/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [37,[6, 21, null], "book"],
  "rn1qkbnr/pp3ppp/2p1p3/3p1b2/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [59,[59, 41, null], "book"],
  "r2qkbnr/ppp2ppp/2n1p3/3p1b2/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [41,[34, 27, null], "book"],
  "rn1qkbnr/ppp2ppp/4p3/3p1b2/2PP4/1QN5/PP2PPPP/R1B1KBNR b KQkq -" : [32,[1, 18, null], "book"],
  "rnbqkbnr/pp2pppp/8/2pp4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [45,[34, 27, null], "book"],
  "rnbqkbnr/pp2pppp/8/2pP4/3P4/8/PP2PPPP/RNBQKBNR b KQkq -" : [49,[3, 27, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pP4/3P4/8/PP2PPPP/RNBQKBNR w KQkq -" : [54,[52, 36, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pP4/3PP3/8/PP3PPP/RNBQKBNR b KQkq -" : [66,[21, 36, null], "book"],
  "rnbqkb1r/pp2pppp/8/2pP4/3Pn3/8/PP3PPP/RNBQKBNR w KQkq -" : [74,[35, 26, null], "book"],
  "rnbqkb1r/pp2pppp/8/2PP4/4n3/8/PP3PPP/RNBQKBNR b KQkq -" : [53,[3, 24, null], "book"],
  "rnb1kb1r/pp2pppp/8/q1PP4/4n3/8/PP3PPP/RNBQKBNR w KQkq -" : [59,[58, 51, null], "book"],
  "rnbqkbnr/pp2pppp/8/2Pp4/2P5/8/PP2PPPP/RNBQKBNR b KQkq -" : [32,[12, 20, null], "book"],
  "rnbqkbnr/pp2pppp/8/2P5/2Pp4/8/PP2PPPP/RNBQKBNR w KQkq -" : [60,[62, 45, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [40,[57, 42, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3P4/3P4/8/PP2PPPP/RNBQKBNR b KQkq -" : [40,[18, 27, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/2PP4/4P3/PP3PPP/RNBQKBNR b KQkq -" : [16,[2, 29, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/2PPP3/8/PP3PPP/RNBQKBNR b KQkq -" : [-60,[27, 36, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [37,[12, 20, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/8/2pP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [34,[52, 44, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/8/2pPP3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [19,[9, 25, null], "book"],
  "rnbqkbnr/pp3ppp/2p5/3pp3/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [54,[34, 27, null], "book"],
  "rnbqkbnr/pp3ppp/2p5/3pp3/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [-51,[27, 36, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [26,[6, 21, null], "book"],
  "rn1qkbnr/pp2pppp/2p5/3p1b2/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [105,[34, 27, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [31,[57, 42, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/3p2B1/2PP4/5N2/PP2PPPP/RN1QKB1R b KQkq -" : [-42,[27, 34, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/3P4/3P4/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [32,[18, 27, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/3p4/3P4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [32,[57, 42, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/3p4/3P4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [35,[12, 20, null], "book"],
  "r1bqkb1r/pp2pppp/2n2n2/3p4/3P4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [30,[58, 37, null], "book"],
  "r1bqkb1r/pp2pppp/2n2n2/3p4/3P1B2/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [17,[2, 29, null], "book"],
  "r2qkb1r/pp2pppp/2n2n2/3p1b2/3P1B2/2N2N2/PP2PPPP/R2QKB1R w KQkq -" : [40,[52, 44, null], "book"],
  "r2qkb1r/pp2pppp/2n2n2/3p1b2/3P1B2/2N1PN2/PP3PPP/R2QKB1R b KQkq -" : [26,[12, 20, null], "book"],
  "r2qkb1r/pp3ppp/2n1pn2/3p1b2/3P1B2/2N1PN2/PP3PPP/R2QKB1R w KQkq -" : [17,[56, 58, null], "book"],
  "r2qkb1r/pp3ppp/2n1pn2/3p1b2/3P1B2/1QN1PN2/PP3PPP/R3KB1R b KQkq -" : [32,[5, 33, null], "book"],
  "r2qk2r/pp3ppp/2n1pn2/3p1b2/1b1P1B2/1QN1PN2/PP3PPP/R3KB1R w KQkq -" : [27,[45, 28, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/4PN2/PP3PPP/RNBQKB1R b KQkq -" : [36,[2, 38, null], "book"],
  "rn1qkb1r/pp2pppp/2p2n2/3p1b2/2PP4/4PN2/PP3PPP/RNBQKB1R w KQkq -" : [30,[57, 42, null], "book"],
  "rn1qkb1r/pp2pppp/2p2n2/3P1b2/3P4/4PN2/PP3PPP/RNBQKB1R b KQkq -" : [12,[18, 27, null], "book"],
  "rn1qkb1r/pp2pppp/5n2/3p1b2/3P4/4PN2/PP3PPP/RNBQKB1R w KQkq -" : [12,[59, 41, null], "book"],
  "rn1qkb1r/pp2pppp/5n2/3p1b2/3P4/2N1PN2/PP3PPP/R1BQKB1R b KQkq -" : [7,[1, 18, null], "book"],
  "rn1qkb1r/pp2pppp/5n2/3p1b2/3P4/1Q2PN2/PP3PPP/RNB1KB1R b KQkq -" : [24,[3, 10, null], "book"],
  "rnq1kb1r/pp2pppp/5n2/3p1b2/3P4/1Q2PN2/PP3PPP/RNB1KB1R w KQkq -" : [41,[58, 51, null], "book"],
  "rnq1kb1r/pp2pppp/5n2/3p1b2/3P4/1Q2PN2/PP1B1PPP/RN2KB1R b KQkq -" : [40,[12, 20, null], "book"],
  "rnq1kb1r/pp3ppp/4pn2/3p1b2/3P4/1Q2PN2/PP1B1PPP/RN2KB1R w KQkq -" : [36,[61, 25, null], "book"],
  "rnq1kb1r/pp3ppp/4pn2/3p1b2/3P4/NQ2PN2/PP1B1PPP/R3KB1R b KQkq -" : [-18,[1, 18, null], "book"],
  "rn1qkb1r/pp2pppp/2p2n2/3p4/2PP2b1/4PN2/PP3PPP/RNBQKB1R w KQkq -" : [36,[55, 47, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/5N2/PP1NPPPP/R1BQKB1R b KQkq -" : [0,[2, 29, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [38,[12, 20, null], "book"],
  "rnbqkb1r/1p2pppp/p1p2n2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [40,[34, 26, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [106,[35, 26, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/8/2pP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [40,[48, 32, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/8/P1pP4/2N2N2/1P2PPPP/R1BQKB1R b KQkq -" : [31,[2, 29, null], "book"],
  "rn1qkb1r/pp2pppp/2p2n2/5b2/P1pP4/2N2N2/1P2PPPP/R1BQKB1R w KQkq -" : [33,[52, 44, null], "book"],
  "rn1qkb1r/pp2pppp/2p2n2/5b2/P1pP4/2N1PN2/1P3PPP/R1BQKB1R b KQkq -" : [31,[12, 20, null], "book"],
  "rn1qkb1r/pp3ppp/2p1pn2/5b2/P1pP4/2N1PN2/1P3PPP/R1BQKB1R w KQkq -" : [29,[61, 34, null], "book"],
  "rn1qkb1r/pp3ppp/2p1pn2/5b2/P1BP4/2N1PN2/1P3PPP/R1BQK2R b KQkq -" : [35,[5, 33, null], "book"],
  "rn1qk2r/pp3ppp/2p1pn2/5b2/PbBP4/2N1PN2/1P3PPP/R1BQK2R w KQkq -" : [32,[60, 62, null], "book"],
  "rn1qk2r/pp3ppp/2p1pn2/5b2/PbBP4/2N1PN2/1P3PPP/R1BQ1RK1 b kq -" : [39,[4, 6, null], "book"],
  "rn1q1rk1/pp3ppp/2p1pn2/5b2/PbBP4/2N1PN2/1P3PPP/R1BQ1RK1 w - -" : [33,[59, 52, null], "book"],
  "rn1q1rk1/pp3ppp/2p1pn2/5b2/PbBP4/2N1PN2/1P2QPPP/R1B2RK1 b - -" : [29,[15, 23, null], "book"],
  "r2qkb1r/pp2pppp/n1p2n2/5b2/P1pP4/2N1PN2/1P3PPP/R1BQKB1R w KQkq -" : [91,[61, 34, null], "book"],
  "rn1qkb1r/pp2pppp/2p2n2/4Nb2/P1pP4/2N5/1P2PPPP/R1BQKB1R b KQkq -" : [52,[12, 20, null], "book"],
  "rn1qkb1r/pp3ppp/2p1pn2/4Nb2/P1pP4/2N5/1P2PPPP/R1BQKB1R w KQkq -" : [70,[53, 45, null], "book"],
  "rn1qkb1r/pp3ppp/2p1pn2/4Nb2/P1pP4/2N2P2/1P2P1PP/R1BQKB1R b KQkq -" : [56,[18, 26, null], "book"],
  "rn1qk2r/pp3ppp/2p1pn2/4Nb2/PbpP4/2N2P2/1P2P1PP/R1BQKB1R w KQkq -" : [63,[52, 36, null], "book"],
  "rn1qk2r/pp3ppp/2p1pn2/4Nb2/PbpPP3/2N2P2/1P4PP/R1BQKB1R b KQkq -" : [58,[29, 36, null], "book"],
  "r2qkb1r/pp2pppp/n1p2n2/4Nb2/P1pP4/2N5/1P2PPPP/R1BQKB1R w KQkq -" : [62,[52, 44, null], "book"],
  "r2qkb1r/pp2pppp/n1p2n2/4Nb2/P1pPP3/2N5/1P3PPP/R1BQKB1R b KQkq -" : [8,[21, 36, null], "book"],
  "r2qkb1r/pp1npppp/2p2n2/4Nb2/P1pP4/2N5/1P2PPPP/R1BQKB1R w KQkq -" : [45,[28, 34, null], "book"],
  "r2qkb1r/pp1npppp/2p2n2/5b2/P1NP4/2N5/1P2PPPP/R1BQKB1R b KQkq -" : [40,[11, 17, null], "book"],
  "r3kb1r/ppqnpppp/2p2n2/5b2/P1NP4/2N5/1P2PPPP/R1BQKB1R w KQkq -" : [59,[54, 46, null], "book"],
  "r3kb1r/ppqnpppp/2p2n2/5b2/P1NP4/2N3P1/1P2PP1P/R1BQKB1R b KQkq -" : [58,[12, 28, null], "book"],
  "r3kb1r/ppqn1ppp/2p2n2/4pb2/P1NP4/2N3P1/1P2PP1P/R1BQKB1R w KQkq -" : [49,[35, 28, null], "book"],
  "rn1qkb1r/pp2pppp/2p2n2/5b2/P1pP3N/2N5/1P2PPPP/R1BQKB1R b KQkq -" : [13,[12, 20, null], "book"],
  "rn1qkb1r/pp2pppp/2p2n2/8/P1pP2b1/2N2N2/1P2PPPP/R1BQKB1R w KQkq -" : [71,[45, 28, null], "book"],
  "rnbqkb1r/pp3ppp/2p1pn2/8/P1pP4/2N2N2/1P2PPPP/R1BQKB1R w KQkq -" : [63,[52, 44, null], "book"],
  "r1bqkb1r/pp2pppp/n1p2n2/8/P1pP4/2N2N2/1P2PPPP/R1BQKB1R w KQkq -" : [81,[52, 36, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/8/2pP4/2N1PN2/PP3PPP/R1BQKB1R b KQkq -" : [-17,[9, 25, null], "book"],
  "rnbqkb1r/p3pppp/2p2n2/1p6/2pP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq -" : [-13,[48, 32, null], "book"],
  "rnbqkb1r/p3pppp/2p2n2/1p6/P1pP4/2N1PN2/1P3PPP/R1BQKB1R b KQkq -" : [-8,[25, 33, null], "book"],
  "rnbqkb1r/p3pppp/2p2n2/8/PppP4/2N1PN2/1P3PPP/R1BQKB1R w KQkq -" : [0,[42, 57, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/8/2pPP3/2N2N2/PP3PPP/R1BQKB1R b KQkq -" : [7,[9, 25, null], "book"],
  "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [43,[58, 37, null], "book"],
  "rnb1kb1r/pp2pppp/1qp2n2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [71,[55, 47, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [26,[62, 45, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/2pP4/4P3/PP3PPP/RNBQKBNR b KQkq -" : [43,[10, 26, null], "book"],
  "rnbqkbnr/ppp2ppp/8/4p3/2pP4/4P3/PP3PPP/RNBQKBNR w KQkq -" : [43,[61, 34, null], "book"],
  "rnbqkbnr/ppp2ppp/8/4p3/2BP4/4P3/PP3PPP/RNBQK1NR b KQkq -" : [38,[28, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/8/8/2Bp4/4P3/PP3PPP/RNBQK1NR w KQkq -" : [45,[44, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/8/8/2Bp4/1Q2P3/PP3PPP/RNB1K1NR b KQkq -" : [0,[3, 12, null], "book"],
  "rnb1kbnr/ppp1qppp/8/8/2Bp4/1Q2P3/PP3PPP/RNB1K1NR w KQkq -" : [-6,[48, 40, null], "book"],
  "rnb1kbnr/ppp1qppp/8/8/2Bp4/1Q2P3/PP3PPP/RNB2KNR b kq -" : [-59,[1, 11, null], "book"],
  "rnb1kbnr/ppp1qppp/8/8/2Bp4/1Q2P3/PP1N1PPP/R1B1K1NR b KQkq -" : [-106,[35, 44, null], "book"],
  "rnb1kbnr/ppp1qppp/8/8/2Bp4/1Q2PN2/PP3PPP/RNB1K2R b KQkq -" : [-13,[12, 33, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/2pPP3/8/PP3PPP/RNBQKBNR b KQkq -" : [51,[12, 28, null], "book"],
  "rnbqkbnr/p1p1pppp/8/1p6/2pPP3/8/PP3PPP/RNBQKBNR w KQkq -" : [50,[48, 32, null], "book"],
  "rnbqkbnr/pp2pppp/8/2p5/2pPP3/8/PP3PPP/RNBQKBNR w KQkq -" : [50,[35, 27, null], "book"],
  "rnbqkbnr/pp2pppp/8/2pP4/2p1P3/8/PP3PPP/RNBQKBNR b KQkq -" : [58,[6, 21, null], "book"],
  "rnbqkbnr/p3pppp/8/1ppP4/2p1P3/8/PP3PPP/RNBQKBNR w KQkq -" : [129,[48, 32, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pP4/2p1P3/8/PP3PPP/RNBQKBNR w KQkq -" : [61,[57, 42, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pP4/2p1P3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [66,[12, 20, null], "book"],
  "rnbqkb1r/p3pppp/5n2/1ppP4/2p1P3/2N5/PP3PPP/R1BQKBNR w KQkq -" : [72,[58, 37, null], "book"],
  "rnbqkbnr/ppp2ppp/8/4p3/2pPP3/8/PP3PPP/RNBQKBNR w KQkq -" : [43,[62, 45, null], "book"],
  "rnbqkbnr/ppp2ppp/8/4p3/2BPP3/8/PP3PPP/RNBQK1NR b KQkq -" : [-69,[3, 35, null], "book"],
  "rnbqkbnr/ppp1p1pp/8/5p2/2pPP3/8/PP3PPP/RNBQKBNR w KQkq -" : [121,[61, 34, null], "book"],
  "r1bqkbnr/ppp1pppp/2n5/8/2pPP3/8/PP3PPP/RNBQKBNR w KQkq -" : [59,[62, 45, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/8/2pPP3/8/PP3PPP/RNBQKBNR w KQkq -" : [54,[36, 28, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/2pP4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [-1,[8, 16, null], "book"],
  "rnbqkbnr/pp2pppp/8/2p5/2pP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [46,[35, 27, null], "book"],
  "rnbqkbnr/pp2pppp/8/2pP4/2p5/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [44,[8, 16, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pP4/2p5/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [72,[52, 36, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/2pP4/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [29,[6, 21, null], "book"],
  "rnbqkbnr/1pp1pppp/p7/8/2pP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [27,[52, 44, null], "book"],
  "rnbqkbnr/1pp1pppp/p7/8/2pP4/4PN2/PP3PPP/RNBQKB1R b KQkq -" : [30,[12, 20, null], "book"],
  "rnbqkbnr/2p1pppp/p7/1p6/2pP4/4PN2/PP3PPP/RNBQKB1R w KQkq -" : [47,[48, 32, null], "book"],
  "rn1qkbnr/1pp1pppp/p7/8/2pP2b1/4PN2/PP3PPP/RNBQKB1R w KQkq -" : [64,[61, 34, null], "book"],
  "rnbqkbnr/1pp1pppp/p7/8/2pPP3/5N2/PP3PPP/RNBQKB1R b KQkq -" : [0,[9, 25, null], "book"],
  "rnbqkbnr/p1p1pppp/8/1p6/2pP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [58,[48, 32, null], "book"],
  "rnbqkbnr/pp2pppp/8/2p5/2pP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [50,[35, 27, null], "book"],
  "rnbqkbnr/pp2pppp/8/2pP4/2p5/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [44,[12, 20, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pP4/2p5/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [40,[57, 42, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pP4/2p5/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [46,[12, 20, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pP4/2p5/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [58,[52, 36, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pP4/2p1P3/2N2N2/PP3PPP/R1BQKB1R b KQkq -" : [43,[20, 27, null], "book"],
  "rnbqkb1r/pp3ppp/5n2/2pp4/2p1P3/2N2N2/PP3PPP/R1BQKB1R w KQkq -" : [43,[36, 28, null], "book"],
  "rnbqkb1r/pp3ppp/5n2/2ppP3/2p5/2N2N2/PP3PPP/R1BQKB1R b KQkq -" : [43,[2, 20, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/8/2pP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [31,[52, 44, null], "book"],
  "r1bqkbnr/pppnpppp/8/8/2pP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [89,[52, 36, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/8/2pP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [34,[52, 44, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/8/2pP4/4PN2/PP3PPP/RNBQKB1R b KQkq -" : [37,[8, 16, null], "book"],
  "rn1qkb1r/ppp1pppp/4bn2/8/2pP4/4PN2/PP3PPP/RNBQKB1R w KQkq -" : [58,[57, 42, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/8/2pP2b1/4PN2/PP3PPP/RNBQKB1R w KQkq -" : [63,[61, 34, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/8/2pP4/4PN2/PP3PPP/RNBQKB1R w KQkq -" : [30,[61, 34, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/8/2BP4/4PN2/PP3PPP/RNBQK2R b KQkq -" : [31,[10, 26, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2p5/2BP4/4PN2/PP3PPP/RNBQK2R w KQkq -" : [33,[60, 62, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2p5/2BP4/4PN2/PP3PPP/RNBQ1RK1 b kq -" : [36,[8, 16, null], "book"],
  "rnbqkb1r/1p3ppp/p3pn2/2p5/2BP4/4PN2/PP3PPP/RNBQ1RK1 w kq -" : [32,[34, 52, null], "book"],
  "rnbqkb1r/1p3ppp/p3pn2/2P5/2B5/4PN2/PP3PPP/RNBQ1RK1 b kq -" : [31,[5, 26, null], "book"],
  "rnbqk2r/1p3ppp/p3pn2/2b5/2B5/4PN2/PP3PPP/RNBQ1RK1 w kq -" : [32,[59, 3, null], "book"],
  "rnbqkb1r/1p3ppp/p3pn2/2p5/2BPP3/5N2/PP3PPP/RNBQ1RK1 b kq -" : [9,[9, 25, null], "book"],
  "rnbqkb1r/1p3ppp/p3pn2/2p5/2BP4/4PN2/PP2QPPP/RNB2RK1 b kq -" : [9,[9, 25, null], "book"],
  "rnbqkb1r/5ppp/p3pn2/1pp5/2BP4/4PN2/PP2QPPP/RNB2RK1 w kq -" : [16,[34, 43, null], "book"],
  "rnbqkb1r/5ppp/p3pn2/1pp5/3P4/1B2PN2/PP2QPPP/RNB2RK1 b kq -" : [-9,[2, 9, null], "book"],
  "rn1qkb1r/1b3ppp/p3pn2/1pp5/3P4/1B2PN2/PP2QPPP/RNB2RK1 w kq -" : [0,[61, 59, null], "book"],
  "rn1qkb1r/1b3ppp/p3pn2/1pp5/3P4/1B2PN2/PP2QPPP/RNBR2K1 b kq -" : [-18,[1, 11, null], "book"],
  "r2qkb1r/1b1n1ppp/p3pn2/1pp5/3P4/1B2PN2/PP2QPPP/RNBR2K1 w kq -" : [-8,[57, 42, null], "book"],
  "r2qkb1r/1b1n1ppp/p3pn2/1pp5/3P4/1BN1PN2/PP2QPPP/R1BR2K1 b kq -" : [-24,[3, 10, null], "book"],
  "r2qk2r/1b1n1ppp/p2bpn2/1pp5/3P4/1BN1PN2/PP2QPPP/R1BR2K1 w kq -" : [-17,[44, 36, null], "book"],
  "r1bqkb1r/1p3ppp/p1n1pn2/2p5/2BP4/4PN2/PP2QPPP/RNB2RK1 w kq -" : [45,[57, 42, null], "book"],
  "r1bqkb1r/1p3ppp/p1n1pn2/2P5/2B5/4PN2/PP2QPPP/RNB2RK1 b kq -" : [29,[5, 26, null], "book"],
  "r1bqkb1r/1p3ppp/p1n1pn2/2p5/2BP4/2N1PN2/PP2QPPP/R1B2RK1 b kq -" : [37,[9, 25, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/8/2Bp4/4PN2/PP3PPP/RNBQ1RK1 w kq -" : [60,[44, 35, null], "book"],
  "r1bqkb1r/pp3ppp/2n1pn2/2p5/2BP4/4PN2/PP3PPP/RNBQ1RK1 w kq -" : [29,[57, 42, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/8/2pP4/4PN2/PP3PPP/RNBQKB1R w KQkq -" : [63,[61, 34, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/8/2pP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [17,[8, 16, null], "book"],
  "rnbqkb1r/1pp1pppp/p4n2/8/2pP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [44,[52, 36, null], "book"],
  "rnbqkb1r/1pp1pppp/p4n2/8/2pPP3/2N2N2/PP3PPP/R1BQKB1R b KQkq -" : [14,[9, 25, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/8/Q1pP4/5N2/PP2PPPP/RNB1KB1R b KQkq -" : [-15,[1, 11, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [70,[35, 28, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pP3/2P5/8/PP2PPPP/RNBQKBNR b KQkq -" : [76,[6, 12, null], "book"],
  "rnbqkbnr/ppp2ppp/8/4P3/2Pp4/8/PP2PPPP/RNBQKBNR w KQkq -" : [72,[62, 45, null], "book"],
  "rnbqkbnr/ppp2ppp/8/4P3/2Pp4/4P3/PP3PPP/RNBQKBNR b KQkq -" : [-17,[5, 33, null], "book"],
  "rnbqk1nr/ppp2ppp/8/4P3/1bPp4/4P3/PP3PPP/RNBQKBNR w KQkq -" : [-15,[58, 51, null], "book"],
  "rnbqk1nr/ppp2ppp/8/4P3/1bPp4/4P3/PP1B1PPP/RN1QKBNR b KQkq -" : [-21,[35, 44, null], "book"],
  "rnbqk1nr/ppp2ppp/8/4P3/1bP5/4p3/PP1B1PPP/RN1QKBNR w KQkq -" : [-13,[53, 44, null], "book"],
  "rnbqkbnr/ppp2ppp/8/4P3/2Pp4/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [54,[1, 18, null], "book"],
  "rnbqkbnr/pp3ppp/8/2p1P3/2Pp4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [111,[52, 44, null], "book"],
  "r1bqkbnr/ppp2ppp/2n5/4P3/2Pp4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [69,[57, 51, null], "book"],
  "r1bqkbnr/ppp2ppp/2n5/4P3/2Pp4/5NP1/PP2PP1P/RNBQKB1R b KQkq -" : [40,[6, 12, null], "book"],
  "r1bqkbnr/ppp2ppp/2n5/4P3/2Pp4/5N2/PP1NPPPP/R1BQKB1R b KQkq -" : [69,[6, 12, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [39,[62, 45, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [31,[6, 21, null], "book"],
  "rnbqkbnr/1pp2ppp/p3p3/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [37,[34, 27, null], "book"],
  "rnbqkbnr/p1p2ppp/1p2p3/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [55,[34, 27, null], "book"],
  "rnbqk1nr/ppp1bppp/4p3/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [37,[62, 45, null], "book"],
  "rnbqk1nr/ppp1bppp/4p3/3p4/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [-12,[27, 36, null], "book"],
  "rnbqk1nr/ppp1bppp/4p3/8/2PPp3/2N5/PP3PPP/R1BQKBNR w KQkq -" : [-22,[42, 36, null], "book"],
  "rnbqk1nr/ppp1bppp/4p3/8/2PPp3/2N2P2/PP4PP/R1BQKBNR b KQkq -" : [-70,[12, 21, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/2pp4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [45,[34, 27, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/2pP4/3P4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [34,[20, 27, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/3P4/3p4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [73,[59, 32, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/3P4/3Q4/2N5/PP2PPPP/R1B1KBNR b KQkq -" : [50,[1, 18, null], "book"],
  "r1bqkbnr/pp3ppp/2n1p3/3P4/3Q4/2N5/PP2PPPP/R1B1KBNR w KQkq -" : [44,[35, 59, null], "book"],
  "r1bqkbnr/pp3ppp/2n1p3/3P4/8/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [54,[20, 27, null], "book"],
  "r1bqkbnr/pp3ppp/2n5/3p4/8/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [44,[59, 27, null], "book"],
  "r1bqkbnr/pp3ppp/2n5/3Q4/8/2N5/PP2PPPP/R1B1KBNR b KQkq -" : [50,[3, 10, null], "book"],
  "r2qkbnr/pp3ppp/2n1b3/3Q4/8/2N5/PP2PPPP/R1B1KBNR w KQkq -" : [76,[27, 3, null], "book"],
  "rnbqkbnr/pp3ppp/8/2pp4/3P4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [47,[62, 45, null], "book"],
  "rnbqkbnr/pp3ppp/8/2Pp4/8/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [-10,[27, 35, null], "book"],
  "rnbqkbnr/pp3ppp/8/2P5/3p4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [0,[42, 36, null], "book"],
  "rnbqkbnr/pp3ppp/8/2P5/N2p4/8/PP2PPPP/R1BQKBNR b KQkq -" : [-36,[9, 25, null], "book"],
  "rnbqkbnr/p4ppp/8/1pP5/N2p4/8/PP2PPPP/R1BQKBNR w KQkq b6" : [-32,[26, 17, null], "book"],
  "rnbqkbnr/pp3ppp/8/2pp4/3PP3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [0,[27, 36, null], "book"],
  "rnbqkbnr/pp3ppp/8/2pp4/3P4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [46,[1, 18, null], "book"],
  "r1bqkbnr/pp3ppp/2n5/2pp4/3P4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [41,[54, 46, null], "book"],
  "r1bqkbnr/pp3ppp/2n5/2Pp4/8/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [38,[27, 35, null], "book"],
  "r1bqkbnr/pp3ppp/2n5/2P5/3p4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [41,[42, 32, null], "book"],
  "r1bqkbnr/pp3ppp/2n5/2P5/N2p4/5N2/PP2PPPP/R1BQKB1R b KQkq -" : [34,[5, 26, null], "book"],
  "r1bqkbnr/p4ppp/2n5/1pP5/N2p4/5N2/PP2PPPP/R1BQKB1R w KQkq b6" : [109,[26, 17, null], "book"],
  "r1bqkbnr/pp3ppp/2n5/2pp4/3P4/2N2NP1/PP2PP1P/R1BQKB1R b KQkq -" : [35,[6, 21, null], "book"],
  "r1bqkbnr/pp3ppp/2n5/3p4/2pP4/2N2NP1/PP2PP1P/R1BQKB1R w KQkq -" : [53,[61, 54, null], "book"],
  "r1bqkb1r/pp3ppp/2n2n2/2pp4/3P4/2N2NP1/PP2PP1P/R1BQKB1R w KQkq -" : [35,[61, 54, null], "book"],
  "r1bqkb1r/pp3ppp/2n2n2/2pp4/3P4/2N2NP1/PP2PPBP/R1BQK2R b KQkq -" : [32,[26, 35, null], "book"],
  "r1bqk2r/pp2bppp/2n2n2/2pp4/3P4/2N2NP1/PP2PPBP/R1BQK2R w KQkq -" : [39,[60, 62, null], "book"],
  "r1bqk2r/pp2bppp/2n2n2/2pp4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 b kq -" : [40,[26, 34, null], "book"],
  "r1bq1rk1/pp2bppp/2n2n2/2pp4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [37,[58, 30, null], "book"],
  "r1bq1rk1/pp2bppp/2n2n2/2pp2B1/3P4/2N2NP1/PP2PPBP/R2Q1RK1 b - -" : [46,[26, 34, null], "book"],
  "r2q1rk1/pp2bppp/2n1bn2/2pp2B1/3P4/2N2NP1/PP2PPBP/R2Q1RK1 w - -" : [77,[30, 21, null], "book"],
  "r2q1rk1/pp2bppp/2n1bn2/2pp2B1/3P4/2N2NP1/PP2PPBP/2RQ1RK1 b - -" : [31,[26, 34, null], "book"],
  "r2q1rk1/pp2bppp/2n1bn2/3p2B1/2pP4/2N2NP1/PP2PPBP/2RQ1RK1 w - -" : [33,[49, 41, null], "book"],
  "r1bq1rk1/pp2bppp/2n2n2/3p2B1/2pP4/2N2NP1/PP2PPBP/R2Q1RK1 w - -" : [37,[52, 44, null], "book"],
  "r1bq1rk1/pp2bppp/2n2n2/3p2B1/3p4/2N2NP1/PP2PPBP/R2Q1RK1 w - -" : [47,[45, 35, null], "book"],
  "r1bq1rk1/pp2bppp/2n2n2/3p2B1/3N4/2N3P1/PP2PPBP/R2Q1RK1 b - -" : [60,[3, 17, null], "book"],
  "r1bq1rk1/pp2bppp/2n2n2/2Pp4/8/2N2NP1/PP2PPBP/R1BQ1RK1 b - -" : [38,[12, 26, null], "book"],
  "r1bq1rk1/pp3ppp/2n2n2/2bp4/8/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [35,[42, 32, null], "book"],
  "r1bq1rk1/pp3ppp/2n2n2/2bp4/N7/5NP1/PP2PPBP/R1BQ1RK1 b - -" : [29,[26, 12, null], "book"],
  "r1bq1rk1/pp2bppp/2n2n2/2P5/3p4/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [64,[42, 32, null], "book"],
  "r2qkb1r/pp3ppp/2n2n2/2pp4/3P2b1/2N2NP1/PP2PPBP/R1BQK2R w KQkq -" : [75,[58, 44, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/2pp4/2PP4/2N1P3/PP3PPP/R1BQKBNR b KQkq -" : [10,[6, 21, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N1P3/PP3PPP/R1BQKBNR w KQkq -" : [16,[62, 45, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N1PN2/PP3PPP/R1BQKB1R b KQkq -" : [15,[8, 16, null], "book"],
  "r1bqkb1r/pp3ppp/2n1pn2/2pp4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq -" : [28,[48, 40, null], "book"],
  "rnbqkbnr/pp3ppp/2p1p3/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [42,[52, 36, null], "book"],
  "rnbqkbnr/pp3ppp/2p1p3/3p4/2PP4/2N1P3/PP3PPP/R1BQKBNR b KQkq -" : [32,[1, 11, null], "book"],
  "rnbqkbnr/pp4pp/2p1p3/3p1p2/2PP4/2N1P3/PP3PPP/R1BQKBNR w KQkq -" : [47,[61, 43, null], "book"],
  "rnbqkbnr/pp4pp/2p1p3/3p1p2/2PP2P1/2N1P3/PP3P1P/R1BQKBNR b KQkq -" : [16,[6, 21, null], "book"],
  "rnbqkbnr/pp3ppp/2p1p3/3p4/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [64,[27, 36, null], "book"],
  "rnbqkbnr/pp3ppp/2p1p3/8/2PPp3/2N5/PP3PPP/R1BQKBNR w KQkq -" : [60,[42, 36, null], "book"],
  "rnbqkbnr/pp3ppp/2p1p3/8/2PPp3/2N2P2/PP4PP/R1BQKBNR b KQkq -" : [-50,[6, 21, null], "book"],
  "rnbqkbnr/pp3ppp/2p1p3/8/2PPN3/8/PP3PPP/R1BQKBNR b KQkq -" : [57,[6, 21, null], "book"],
  "rnbqk1nr/pp3ppp/2p1p3/8/1bPPN3/8/PP3PPP/R1BQKBNR w KQkq -" : [70,[58, 51, null], "book"],
  "rnbqk1nr/pp3ppp/2p1p3/8/1bPPN3/8/PP1B1PPP/R2QKBNR b KQkq -" : [48,[3, 35, null], "book"],
  "rnb1k1nr/pp3ppp/2p1p3/8/1bPqN3/8/PP1B1PPP/R2QKBNR w KQkq -" : [71,[51, 33, null], "book"],
  "rnb1k1nr/pp3ppp/2p1p3/8/1BPqN3/8/PP3PPP/R2QKBNR b KQkq -" : [48,[35, 36, null], "book"],
  "rnb1k1nr/pp3ppp/2p1p3/8/1BP1q3/8/PP3PPP/R2QKBNR w KQkq -" : [27,[62, 52, null], "book"],
  "rnb1k1nr/pp3ppp/2p1p3/8/1BP1q3/8/PP2BPPP/R2QK1NR b KQkq -" : [8,[1, 16, null], "book"],
  "rnb1k1nr/pp3ppp/4p3/2p5/1BP1q3/8/PP2BPPP/R2QK1NR w KQkq -" : [85,[33, 26, null], "book"],
  "rnb1k1nr/pp3ppp/4p3/2B5/2P1q3/8/PP2BPPP/R2QK1NR b KQkq -" : [65,[36, 54, null], "book"],
  "rnb1k1nr/pp3ppp/4p3/2B5/2P5/8/PP2BPqP/R2QK1NR w KQkq -" : [74,[59, 19, null], "book"],
  "rnbqkbnr/pp3ppp/2p1p3/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [44,[6, 21, null], "book"],
  "rnbqkbnr/pp3ppp/2p1p3/8/2pP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [39,[48, 32, null], "book"],
  "rnbqkbnr/pp3ppp/2p1p3/8/P1pP4/2N2N2/1P2PPPP/R1BQKB1R b KQkq -" : [25,[5, 33, null], "book"],
  "rnbqk1nr/pp3ppp/2p1p3/8/PbpP4/2N2N2/1P2PPPP/R1BQKB1R w KQkq -" : [36,[54, 46, null], "book"],
  "rnbqk1nr/pp3ppp/2p1p3/8/PbpP4/2N1PN2/1P3PPP/R1BQKB1R b KQkq -" : [46,[9, 25, null], "book"],
  "rnbqk1nr/p4ppp/2p1p3/1p6/PbpP4/2N1PN2/1P3PPP/R1BQKB1R w KQkq -" : [39,[58, 51, null], "book"],
  "rnbqk1nr/p4ppp/2p1p3/1p6/PbpP4/2N1PN2/1P1B1PPP/R2QKB1R b KQkq -" : [25,[8, 24, null], "book"],
  "rnbqk1nr/5ppp/2p1p3/pp6/PbpP4/2N1PN2/1P1B1PPP/R2QKB1R w KQkq -" : [50,[32, 25, null], "book"],
  "rnbqkbnr/pp3ppp/2p1p3/6B1/2pP4/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [0,[5, 12, null], "book"],
  "rnbqkbnr/pp4pp/2p1pp2/6B1/2pP4/2N2N2/PP2PPPP/R2QKB1R w KQkq -" : [53,[30, 51, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [33,[58, 30, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP1B2/2N5/PP2PPPP/R2QKBNR b KQkq -" : [0,[10, 26, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR b KQkq -" : [32,[5, 12, null], "book"],
  "rnbqk2r/ppp1bppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR w KQkq -" : [26,[52, 44, null], "book"],
  "rnbqk2r/ppp1bppp/4pB2/3p4/2PP4/2N5/PP2PPPP/R2QKBNR b KQkq -" : [-19,[12, 21, null], "book"],
  "rnbqk2r/ppp1bppp/4pn2/3p2B1/2PP4/2N1P3/PP3PPP/R2QKBNR b KQkq -" : [22,[4, 6, null], "book"],
  "rnbqk2r/ppp1bppp/4p3/3p2B1/2PPn3/2N1P3/PP3PPP/R2QKBNR w KQkq -" : [50,[30, 12, null], "book"],
  "rnbq1rk1/ppp1bppp/4pn2/3p2B1/2PP4/2N1P3/PP3PPP/R2QKBNR w KQ -" : [17,[62, 45, null], "book"],
  "rnbq1rk1/ppp1bppp/4pn2/3p2B1/2PP4/2N1PN2/PP3PPP/R2QKB1R b KQ -" : [21,[15, 23, null], "book"],
  "rnbq1rk1/p1p1bppp/1p2pn2/3p2B1/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQ -" : [19,[56, 58, null], "book"],
  "rnbq1rk1/p1p1bppp/1p2pn2/3p2B1/2PP4/2NBPN2/PP3PPP/R2QK2R b KQ -" : [24,[10, 26, null], "book"],
  "rn1q1rk1/pbp1bppp/1p2pn2/3p2B1/2PP4/2NBPN2/PP3PPP/R2QK2R w KQ -" : [20,[34, 27, null], "book"],
  "rn1q1rk1/pbp1bppp/1p2pn2/3P2B1/3P4/2NBPN2/PP3PPP/R2QK2R b KQ -" : [24,[21, 27, null], "book"],
  "rn1q1rk1/pbp1bppp/1p3n2/3p2B1/3P4/2NBPN2/PP3PPP/R2QK2R w KQ -" : [44,[60, 62, null], "book"],
  "rn1q1rk1/pbp1bppp/1p3n2/3pN1B1/3P4/2NBP3/PP3PPP/R2QK2R b KQ -" : [35,[1, 11, null], "book"],
  "rnbq1rk1/ppp1bpp1/4pn1p/3p2B1/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQ -" : [22,[30, 39, null], "book"],
  "rnbq1rk1/ppp1bpp1/4pn1p/3p4/2PP3B/2N1PN2/PP3PPP/R2QKB1R b KQ -" : [20,[9, 17, null], "book"],
  "rnbq1rk1/p1p1bpp1/1p2pn1p/3p4/2PP3B/2N1PN2/PP3PPP/R2QKB1R w KQ -" : [18,[56, 58, null], "book"],
  "rnbq1rk1/p1p1bpp1/1p2pn1p/3P4/3P3B/2N1PN2/PP3PPP/R2QKB1R b KQ -" : [8,[21, 27, null], "book"],
  "rnbq1rk1/p1p1bpp1/1p2p2p/3n4/3P3B/2N1PN2/PP3PPP/R2QKB1R w KQ -" : [6,[39, 12, null], "book"],
  "rnbq1rk1/ppp1bpp1/4p2p/3p4/2PPn2B/2N1PN2/PP3PPP/R2QKB1R w KQ -" : [34,[39, 12, null], "book"],
  "rnbq1rk1/ppp1Bpp1/4p2p/3p4/2PPn3/2N1PN2/PP3PPP/R2QKB1R b KQ -" : [24,[3, 12, null], "book"],
  "rnb2rk1/ppp1qpp1/4p2p/3p4/2PPn3/2N1PN2/PP3PPP/R2QKB1R w KQ -" : [27,[34, 27, null], "book"],
  "rnb2rk1/ppp1qpp1/4p2p/3P4/3Pn3/2N1PN2/PP3PPP/R2QKB1R b KQ -" : [21,[36, 42, null], "book"],
  "rnb2rk1/ppp1qpp1/4p2p/3P4/3P4/2n1PN2/PP3PPP/R2QKB1R w KQ -" : [22,[49, 42, null], "book"],
  "rnb2rk1/ppp1qpp1/4p2p/3P4/3P4/2P1PN2/P4PPP/R2QKB1R b KQ -" : [6,[20, 27, null], "book"],
  "rnb2rk1/ppp1qpp1/4p2p/3p4/2PPn3/2N1PN2/PPQ2PPP/R3KB1R b KQ -" : [3,[36, 42, null], "book"],
  "rnbq1rk1/ppp1bpp1/4pB1p/3p4/2PP4/2N1PN2/PP3PPP/R2QKB1R b KQ -" : [17,[12, 21, null], "book"],
  "rnbq1rk1/ppp2pp1/4pb1p/3p4/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQ -" : [24,[56, 58, null], "book"],
  "rnbq1rk1/ppp2pp1/4pb1p/3p4/2PP4/2N1PN2/PP3PPP/2RQKB1R b K -" : [19,[10, 18, null], "book"],
  "rnbq1rk1/pp3pp1/2p1pb1p/3p4/2PP4/2N1PN2/PP3PPP/2RQKB1R w K -" : [20,[61, 43, null], "book"],
  "rnbq1rk1/pp3pp1/2p1pb1p/3p4/2PP4/2NBPN2/PP3PPP/2RQK2R b K -" : [24,[1, 11, null], "book"],
  "r1bq1rk1/pp1n1pp1/2p1pb1p/3p4/2PP4/2NBPN2/PP3PPP/2RQK2R w K -" : [15,[60, 62, null], "book"],
  "r1bq1rk1/pp1n1pp1/2p1pb1p/3p4/2PP4/2NBPN2/PP3PPP/2RQ1RK1 b - -" : [15,[27, 34, null], "book"],
  "r1bq1rk1/pp1n1pp1/2p1pb1p/8/2pP4/2NBPN2/PP3PPP/2RQ1RK1 w - -" : [22,[43, 34, null], "book"],
  "r1bq1rk1/pppnbppp/4pn2/3p2B1/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQ -" : [22,[59, 50, null], "book"],
  "r1bq1rk1/pppnbppp/4pn2/3p2B1/2PP4/2NBPN2/PP3PPP/R2QK2R b KQ -" : [18,[27, 34, null], "book"],
  "r1bq1rk1/pppnbppp/4pn2/3p2B1/2PP4/1QN1PN2/PP3PPP/R3KB1R b KQ -" : [20,[27, 34, null], "book"],
  "r1bq1rk1/pppnbppp/4pn2/3p2B1/2PP4/2N1PN2/PPQ2PPP/R3KB1R b KQ -" : [33,[27, 34, null], "book"],
  "r1bq1rk1/pp1nbppp/4pn2/2pp2B1/2PP4/2N1PN2/PPQ2PPP/R3KB1R w KQ -" : [34,[34, 27, null], "book"],
  "r1bq1rk1/pp1nbppp/4pn2/2pP2B1/3P4/2N1PN2/PPQ2PPP/R3KB1R b KQ -" : [44,[20, 27, null], "book"],
  "r1bq1rk1/pppnbppp/4pn2/3p2B1/2PP4/2N1PN2/PP3PPP/2RQKB1R b K -" : [33,[27, 34, null], "book"],
  "r1bq1rk1/1ppnbppp/p3pn2/3p2B1/2PP4/2N1PN2/PP3PPP/2RQKB1R w K -" : [39,[34, 26, null], "book"],
  "r1bq1rk1/p1pnbppp/1p2pn2/3p2B1/2PP4/2N1PN2/PP3PPP/2RQKB1R w K -" : [39,[34, 27, null], "book"],
  "r1bq1rk1/p1pnbppp/1p2pn2/3P2B1/3P4/2N1PN2/PP3PPP/2RQKB1R b K -" : [34,[20, 27, null], "book"],
  "r1bq1rk1/p1pnbppp/1p3n2/3p2B1/3P4/2N1PN2/PP3PPP/2RQKB1R w K -" : [32,[61, 43, null], "book"],
  "r1bq1rk1/p1pnbppp/1p3n2/1B1p2B1/3P4/2N1PN2/PP3PPP/2RQK2R b K -" : [33,[2, 9, null], "book"],
  "r1bq1rk1/p1pnbppp/1p3n2/3p2B1/3P4/2NBPN2/PP3PPP/2RQK2R b K -" : [33,[10, 26, null], "book"],
  "r1bq1rk1/pp1nbppp/2p1pn2/3p2B1/2PP4/2N1PN2/PP3PPP/2RQKB1R w K -" : [29,[48, 40, null], "book"],
  "r1bq1rk1/pp1nbppp/2p1pn2/3p2B1/2PP4/2NBPN2/PP3PPP/2RQK2R b K -" : [22,[27, 34, null], "book"],
  "r1bq1rk1/pp1nbppp/2p1pn2/6B1/2pP4/2NBPN2/PP3PPP/2RQK2R w K -" : [40,[43, 34, null], "book"],
  "r1bq1rk1/pp1nbppp/2p1pn2/6B1/2BP4/2N1PN2/PP3PPP/2RQK2R b K -" : [28,[15, 23, null], "book"],
  "r1bq1rk1/p2nbppp/2p1pn2/1p4B1/2BP4/2N1PN2/PP3PPP/2RQK2R w K -" : [45,[34, 43, null], "book"],
  "r1bq1rk1/pp1nbppp/2p1p3/3n2B1/2BP4/2N1PN2/PP3PPP/2RQK2R w K -" : [27,[30, 12, null], "book"],
  "r1bq1rk1/pp1nBppp/2p1p3/3n4/2BP4/2N1PN2/PP3PPP/2RQK2R b K -" : [41,[3, 12, null], "book"],
  "r1b2rk1/pp1nqppp/2p1p3/3n4/2BP4/2N1PN2/PP3PPP/2RQK2R w K -" : [35,[60, 62, null], "book"],
  "r1b2rk1/pp1nqppp/2p1p3/3n4/2BPN3/4PN2/PP3PPP/2RQK2R b K -" : [32,[9, 17, null], "book"],
  "r1b2rk1/pp1nqppp/2p1p3/3n4/2BP4/2N1PN2/PP3PPP/2RQ1RK1 b - -" : [34,[9, 17, null], "book"],
  "r1b2rk1/pp1nqppp/2p1p3/8/2BP4/2n1PN2/PP3PPP/2RQ1RK1 w - -" : [63,[58, 42, null], "book"],
  "r1b2rk1/pp1nqppp/2p1p3/8/2BP4/2R1PN2/PP3PPP/3Q1RK1 b - -" : [50,[20, 28, null], "book"],
  "r1b2rk1/pp1nqppp/2p5/4p3/2BP4/2R1PN2/PP3PPP/3Q1RK1 w - -" : [44,[34, 41, null], "book"],
  "r1b2rk1/pp1nqppp/2p5/4P3/2B5/2R1PN2/PP3PPP/3Q1RK1 b - -" : [10,[11, 28, null], "book"],
  "r1bq1rk1/pp1nbppp/2p1p3/3n2B1/2BP3P/2N1PN2/PP3PP1/2RQK2R b K -" : [18,[15, 23, null], "book"],
  "r1bq1rk1/pp1nbppp/2p1pn2/3p2B1/2PP4/2N1PN2/PPQ2PPP/2R1KB1R b K -" : [26,[15, 23, null], "book"],
  "r1bq1rk1/1p1nbppp/p1p1pn2/3p2B1/2PP4/2N1PN2/PPQ2PPP/2R1KB1R w K -" : [44,[34, 27, null], "book"],
  "r1bq1rk1/1p1nbppp/p1p1pn2/3P2B1/3P4/2N1PN2/PPQ2PPP/2R1KB1R b K -" : [25,[18, 27, null], "book"],
  "rnbq1rk1/ppp1bppp/4pn2/3p2B1/2PP4/2N1P3/PP3PPP/2RQKBNR b K -" : [14,[10, 26, null], "book"],
  "rnbqk2r/ppp1bppp/4pn2/3p2B1/2PP4/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [23,[4, 6, null], "book"],
  "rnbqk2r/ppp1bpp1/4pn1p/3p2B1/2PP4/2N2N2/PP2PPPP/R2QKB1R w KQkq -" : [17,[30, 39, null], "book"],
  "rnbqk2r/ppp1bpp1/4pn1p/3p4/2PP3B/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [19,[4, 6, null], "book"],
  "rnbq1rk1/ppp1bpp1/4pn1p/3p4/2PP3B/2N2N2/PP2PPPP/R2QKB1R w KQ -" : [14,[52, 44, null], "book"],
  "rnbq1rk1/ppp1bpp1/4pn1p/3p4/2PP3B/2N2N2/PP2PPPP/2RQKB1R b K -" : [4,[10, 26, null], "book"],
  "rnbq1rk1/ppp1bpp1/4pn1p/8/2pP3B/2N2N2/PP2PPPP/2RQKB1R w K -" : [16,[52, 44, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pp2B1/2PP4/2N5/PP2PPPP/R2QKBNR w KQkq -" : [27,[34, 27, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pP2B1/3P4/2N5/PP2PPPP/R2QKBNR b KQkq -" : [27,[26, 35, null], "book"],
  "rnb1kb1r/pp3ppp/1q2pn2/2pP2B1/3P4/2N5/PP2PPPP/R2QKBNR w KQkq -" : [107,[30, 21, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pp2B1/2PP4/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [0,[26, 35, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/3p2B1/2Pp4/2N2N2/PP2PPPP/R2QKB1R w KQkq -" : [16,[45, 35, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/3p2B1/2PQ4/2N2N2/PP2PPPP/R3KB1R b KQkq -" : [0,[1, 18, null], "book"],
  "r1bqkb1r/pppn1ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR w KQkq -" : [36,[52, 44, null], "book"],
  "r1bqkb1r/pppn1ppp/4pn2/3p2B1/2PP4/2N1P3/PP3PPP/R2QKBNR b KQkq -" : [25,[15, 23, null], "book"],
  "r1bqk2r/pppn1ppp/4pn2/3p2B1/1bPP4/2N1P3/PP3PPP/R2QKBNR w KQkq -" : [48,[34, 27, null], "book"],
  "r1bqk2r/pppn1ppp/4pn2/3p2B1/1bPP4/2N1PN2/PP3PPP/R2QKB1R b KQkq -" : [49,[4, 6, null], "book"],
  "r1bqk2r/pp1n1ppp/4pn2/2pp2B1/1bPP4/2N1PN2/PP3PPP/R2QKB1R w KQkq -" : [40,[34, 27, null], "book"],
  "r1bqkb1r/pp1n1ppp/2p1pn2/3p2B1/2PP4/2N1P3/PP3PPP/R2QKBNR w KQkq -" : [35,[34, 27, null], "book"],
  "r1bqkb1r/pp1n1ppp/2p1pn2/3p2B1/2PP4/2N1PN2/PP3PPP/R2QKB1R b KQkq -" : [27,[3, 24, null], "book"],
  "r1b1kb1r/pp1n1ppp/2p1pn2/q2p2B1/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQkq -" : [38,[45, 51, null], "book"],
  "r1b1kb1r/pp1n1ppp/2p1pn2/q2p2B1/2PP4/2N1P3/PP1N1PPP/R2QKB1R b KQkq -" : [30,[27, 34, null], "book"],
  "r1b1k2r/pp1n1ppp/2p1pn2/q2p2B1/1bPP4/2N1P3/PP1N1PPP/R2QKB1R w KQkq -" : [44,[56, 58, null], "book"],
  "r1b1k2r/pp1n1ppp/2p1pn2/q2p2B1/1bPP4/2N1P3/PPQN1PPP/R3KB1R b KQkq -" : [33,[27, 34, null], "book"],
  "r1b2rk1/pp1n1ppp/2p1pn2/q2p2B1/1bPP4/2N1P3/PPQN1PPP/R3KB1R w KQ -" : [32,[61, 52, null], "book"],
  "r1b2rk1/pp1n1ppp/2p1pn2/q2p4/1bPP3B/2N1P3/PPQN1PPP/R3KB1R b KQ -" : [18,[18, 26, null], "book"],
  "r1bqkb1r/pppn1ppp/4pn2/3p2B1/2PP4/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [31,[5, 12, null], "book"],
  "r1bqkb1r/pp1n1ppp/2p1pn2/3p2B1/2PP4/2N2N2/PP2PPPP/R2QKB1R w KQkq -" : [27,[52, 44, null], "book"],
  "r1bqkb1r/pp1n1ppp/2p1pn2/3p2B1/2PPP3/2N2N2/PP3PPP/R2QKB1R b KQkq -" : [13,[27, 36, null], "book"],
  "r1bqkb1r/pppn1pp1/4pn1p/3p2B1/2PP4/2N2N2/PP2PPPP/R2QKB1R w KQkq -" : [30,[30, 39, null], "book"],
  "r1bqkb1r/pppn1pp1/4pn1p/3p4/2PP3B/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [26,[5, 12, null], "book"],
  "r1bqkb1r/pppn1pp1/4pn1p/8/2pP3B/2N2N2/PP2PPPP/R2QKB1R w KQkq -" : [54,[52, 44, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3P4/3P4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [22,[20, 27, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3p4/3P4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [21,[58, 30, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3p2B1/3P4/2N5/PP2PPPP/R2QKBNR b KQkq -" : [26,[5, 12, null], "book"],
  "rnbqkb1r/pp3ppp/2p2n2/3p2B1/3P4/2N5/PP2PPPP/R2QKBNR w KQkq -" : [22,[52, 44, null], "book"],
  "rnbqkb1r/pp3ppp/2p2n2/3p2B1/3P4/2N5/PPQ1PPPP/R3KBNR b KQkq -" : [21,[15, 23, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3p4/3P4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [3,[10, 18, null], "book"],
  "r1bqkb1r/pppn1ppp/5n2/3p4/3P4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [25,[58, 30, null], "book"],
  "r1bqkb1r/pppn1ppp/5n2/3p4/3P1B2/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [20,[10, 18, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [9,[10, 26, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [34,[58, 30, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/3p2B1/1bPP4/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [34,[4, 6, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/6B1/1bpP4/2N2N2/PP2PPPP/R2QKB1R w KQkq -" : [27,[52, 36, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/3p4/QbPP4/2N2N2/PP2PPPP/R1B1KB1R b KQkq -" : [19,[1, 18, null], "book"],
  "rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [40,[58, 37, null], "book"],
  "rnbqk2r/ppp1bppp/4pn2/3p4/2PP1B2/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [28,[4, 6, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [38,[34, 27, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pP4/3P4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [27,[26, 35, null], "book"],
  "rnbqkb1r/pp3ppp/4p3/2pn4/3P4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [21,[52, 44, null], "book"],
  "rnbqkb1r/pp3ppp/4p3/2pn4/3P4/2N1PN2/PP3PPP/R1BQKB1R b KQkq -" : [15,[5, 12, null], "book"],
  "r1bqkb1r/pp3ppp/2n1p3/2pn4/3P4/2N1PN2/PP3PPP/R1BQKB1R w KQkq -" : [19,[61, 25, null], "book"],
  "r1bqkb1r/pp3ppp/2n1p3/2pn4/3P4/2NBPN2/PP3PPP/R1BQK2R b KQkq -" : [22,[5, 12, null], "book"],
  "rnbqkb1r/pp3ppp/4p3/2pn4/3PP3/2N2N2/PP3PPP/R1BQKB1R b KQkq -" : [19,[27, 42, null], "book"],
  "rnbqkb1r/pp3ppp/4p3/2p5/3PP3/2n2N2/PP3PPP/R1BQKB1R w KQkq -" : [24,[49, 42, null], "book"],
  "rnbqkb1r/pp3ppp/4p3/2p5/3PP3/2P2N2/P4PPP/R1BQKB1R b KQkq -" : [20,[26, 35, null], "book"],
  "rnbqkb1r/pp3ppp/4p3/8/3pP3/2P2N2/P4PPP/R1BQKB1R w KQkq -" : [27,[42, 35, null], "book"],
  "rnbqkb1r/pp3ppp/4p3/8/3PP3/5N2/P4PPP/R1BQKB1R b KQkq -" : [17,[5, 33, null], "book"],
  "rnbqk2r/pp3ppp/4p3/8/1b1PP3/5N2/P4PPP/R1BQKB1R w KQkq -" : [27,[58, 51, null], "book"],
  "rnbqk2r/pp3ppp/4p3/8/1b1PP3/5N2/P2B1PPP/R2QKB1R b KQkq -" : [17,[33, 51, null], "book"],
  "rnbqk2r/pp3ppp/4p3/8/3PP3/5N2/P2b1PPP/R2QKB1R w KQkq -" : [25,[59, 51, null], "book"],
  "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [43,[58, 30, null], "book"],
  "rnbqkb1r/pp3ppp/2p1pn2/3p2B1/2PP4/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [35,[15, 23, null], "book"],
  "rnbqkb1r/pp3ppp/2p1pn2/6B1/2pP4/2N2N2/PP2PPPP/R2QKB1R w KQkq -" : [41,[52, 36, null], "book"],
  "rnbqkb1r/pp3ppp/2p1pn2/6B1/2pPP3/2N2N2/PP3PPP/R2QKB1R b KQkq -" : [64,[9, 25, null], "book"],
  "rnbqkb1r/p4ppp/2p1pn2/1p4B1/2pPP3/2N2N2/PP3PPP/R2QKB1R w KQkq -" : [56,[36, 28, null], "book"],
  "rnbqkb1r/p4ppp/2p1pn2/1p2P1B1/2pP4/2N2N2/PP3PPP/R2QKB1R b KQkq -" : [57,[15, 23, null], "book"],
  "rnbqkb1r/p4pp1/2p1pn1p/1p2P1B1/2pP4/2N2N2/PP3PPP/R2QKB1R w KQkq -" : [52,[30, 39, null], "book"],
  "rnbqkb1r/p4pp1/2p1pn1p/1p2P3/2pP3B/2N2N2/PP3PPP/R2QKB1R b KQkq -" : [46,[14, 30, null], "book"],
  "rnbqkb1r/p4p2/2p1pn1p/1p2P1p1/2pP3B/2N2N2/PP3PPP/R2QKB1R w KQkq -" : [67,[45, 30, null], "book"],
  "rnbqkb1r/p4p2/2p1pP1p/1p4p1/2pP3B/2N2N2/PP3PPP/R2QKB1R b KQkq -" : [-48,[30, 39, null], "book"],
  "rnbqkb1r/p4p2/2p1pP1p/1p6/2pP3p/2N2N2/PP3PPP/R2QKB1R w KQkq -" : [-51,[45, 28, null], "book"],
  "rnbqkb1r/p4p2/2p1pP1p/1p2N3/2pP3p/2N5/PP3PPP/R2QKB1R b KQkq -" : [-66,[3, 21, null], "book"],
  "rnbqkb1r/p4p2/2p1pn1p/1p2P1N1/2pP3B/2N5/PP3PPP/R2QKB1R b KQkq -" : [49,[23, 30, null], "book"],
  "rnbqkb1r/p4p2/2p1pn2/1p2P1p1/2pP3B/2N5/PP3PPP/R2QKB1R w KQkq -" : [57,[39, 30, null], "book"],
  "rnbqkb1r/p4p2/2p1pn2/1p2P1B1/2pP4/2N5/PP3PPP/R2QKB1R b KQkq -" : [55,[1, 11, null], "book"],
  "r1bqkb1r/p2n1p2/2p1pn2/1p2P1B1/2pP4/2N5/PP3PPP/R2QKB1R w KQkq -" : [67,[54, 46, null], "book"],
  "rnbqkb1r/p4p2/2p1p2p/1p1nP1N1/2pP3B/2N5/PP3PPP/R2QKB1R w KQkq -" : [145,[30, 13, null], "book"],
  "rnbqkb1r/pp3pp1/2p1pn1p/3p2B1/2PP4/2N2N2/PP2PPPP/R2QKB1R w KQkq -" : [31,[30, 21, null], "book"],
  "rnbqkb1r/pp3pp1/2p1pn1p/3p4/2PP3B/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [26,[27, 34, null], "book"],
  "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R b KQkq -" : [30,[1, 11, null], "book"],
  "rnbqkb1r/1p3ppp/p1p1pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq -" : [34,[49, 41, null], "book"],
  "r1bqkb1r/pp1n1ppp/2p1pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq -" : [33,[61, 43, null], "book"],
  "r1bqkb1r/pp1n1ppp/2p1pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R b KQkq -" : [27,[27, 34, null], "book"],
  "r1bqk2r/pp1n1ppp/2p1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQkq -" : [50,[48, 40, null], "book"],
  "r1bqk2r/pp1n1ppp/2pbpn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQkq -" : [67,[44, 36, null], "book"],
  "r1bqk2r/pp1nbppp/2p1pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQkq -" : [42,[60, 62, null], "book"],
  "r1bqkb1r/pp1n1ppp/2p1pn2/8/2pP4/2NBPN2/PP3PPP/R1BQK2R w KQkq -" : [39,[43, 34, null], "book"],
  "r1bqkb1r/pp1n1ppp/2p1pn2/8/2BP4/2N1PN2/PP3PPP/R1BQK2R b KQkq -" : [27,[9, 25, null], "book"],
  "r1bqkb1r/p2n1ppp/2p1pn2/1p6/2BP4/2N1PN2/PP3PPP/R1BQK2R w KQkq -" : [26,[34, 43, null], "book"],
  "r1bqkb1r/p2n1ppp/2p1pn2/1p6/3P4/2NBPN2/PP3PPP/R1BQK2R b KQkq -" : [33,[8, 16, null], "book"],
  "r1bqkb1r/3n1ppp/p1p1pn2/1p6/3P4/2NBPN2/PP3PPP/R1BQK2R w KQkq -" : [36,[44, 36, null], "book"],
  "r1bqkb1r/3n1ppp/p1p1pn2/1p6/3PP3/2NB1N2/PP3PPP/R1BQK2R b KQkq -" : [17,[18, 26, null], "book"],
  "r1bqkb1r/3n1ppp/p1p1pn2/8/1p1PP3/2NB1N2/PP3PPP/R1BQK2R w KQkq -" : [47,[42, 32, null], "book"],
  "r1bqkb1r/3n1ppp/p3pn2/1pp5/3PP3/2NB1N2/PP3PPP/R1BQK2R w KQkq -" : [28,[35, 27, null], "book"],
  "r1bqkb1r/3n1ppp/p3pn2/1pp1P3/3P4/2NB1N2/PP3PPP/R1BQK2R b KQkq -" : [25,[26, 35, null], "book"],
  "r1bqkb1r/3n1ppp/p3pn2/1p2P3/3p4/2NB1N2/PP3PPP/R1BQK2R w KQkq -" : [38,[42, 25, null], "book"],
  "r1bqkb1r/3n1ppp/p3pn2/1N2P3/3p4/3B1N2/PP3PPP/R1BQK2R b KQkq -" : [23,[16, 25, null], "book"],
  "r1bqkb1r/5ppp/p3pn2/1N2n3/3p4/3B1N2/PP3PPP/R1BQK2R w KQkq -" : [74,[45, 28, null], "book"],
  "r1bqkb1r/5ppp/p3pn2/1N2N3/3p4/3B4/PP3PPP/R1BQK2R b KQkq -" : [55,[16, 25, null], "book"],
  "r1bqkb1r/5ppp/4pn2/1p2N3/3p4/3B4/PP3PPP/R1BQK2R w KQkq -" : [76,[43, 25, null], "book"],
  "r1bqkb1r/3n1ppp/p1p1pn2/1p6/3P4/2NBPN2/PP3PPP/R1BQ1RK1 b kq -" : [8,[18, 26, null], "book"],
  "r1bqkb1r/p2n1ppp/2p1pn2/8/1p1P4/2NBPN2/PP3PPP/R1BQK2R w KQkq -" : [35,[42, 36, null], "book"],
  "r2qkb1r/pb1n1ppp/2p1pn2/1p6/3P4/2NBPN2/PP3PPP/R1BQK2R w KQkq -" : [39,[44, 36, null], "book"],
  "r2qkb1r/pb1n1ppp/2p1pn2/1p6/3PP3/2NB1N2/PP3PPP/R1BQK2R b KQkq -" : [18,[25, 33, null], "book"],
  "r2qkb1r/pb1n1ppp/2p1pn2/8/1p1PP3/2NB1N2/PP3PPP/R1BQK2R w KQkq -" : [30,[42, 32, null], "book"],
  "r2qkb1r/pb1n1ppp/2p1pn2/8/Np1PP3/3B1N2/PP3PPP/R1BQK2R b KQkq -" : [29,[18, 26, null], "book"],
  "r2qkb1r/pb1n1ppp/4pn2/2p5/Np1PP3/3B1N2/PP3PPP/R1BQK2R w KQkq -" : [37,[36, 28, null], "book"],
  "r1bqkb1r/pp1n1ppp/2p1pn2/3pN3/2PP4/2N1P3/PP3PPP/R1BQKB1R b KQkq -" : [6,[27, 34, null], "book"],
  "r1bqkb1r/pp1n1ppp/2p1pn2/3p4/2PP4/2N1PN2/PPQ2PPP/R1B1KB1R b KQkq -" : [19,[5, 19, null], "book"],
  "r1bqk2r/pp1n1ppp/2pbpn2/3p4/2PP4/2N1PN2/PPQ2PPP/R1B1KB1R w KQkq -" : [23,[61, 43, null], "book"],
  "r1bqk2r/pp1n1ppp/2pbpn2/3p4/2PPP3/2N2N2/PPQ2PPP/R1B1KB1R b KQkq -" : [-20,[27, 36, null], "book"],
  "r1bqk2r/pp1n1ppp/2pbpn2/8/2PPp3/2N2N2/PPQ2PPP/R1B1KB1R w KQkq -" : [-9,[42, 36, null], "book"],
  "r1bqk2r/pp1n1ppp/2pbpn2/8/2PPN3/5N2/PPQ2PPP/R1B1KB1R b KQkq -" : [-24,[21, 36, null], "book"],
  "r1bqk2r/pp1n1ppp/2pbp3/8/2PPn3/5N2/PPQ2PPP/R1B1KB1R w KQkq -" : [-31,[50, 36, null], "book"],
  "r1bqk2r/pp1n1ppp/2pbp3/8/2PPQ3/5N2/PP3PPP/R1B1KB1R b KQkq -" : [-27,[20, 28, null], "book"],
  "r1bqk2r/pp1n1ppp/2pb4/4p3/2PPQ3/5N2/PP3PPP/R1B1KB1R w KQkq -" : [-22,[34, 26, null], "book"],
  "r1bqk2r/pp1n1ppp/2pb4/4P3/2P1Q3/5N2/PP3PPP/R1B1KB1R b KQkq -" : [-20,[4, 6, null], "book"],
  "r1bqk2r/pp1n1ppp/2pbpn2/3p4/2PP2P1/2N1PN2/PPQ2P1P/R1B1KB1R b KQkq -" : [16,[15, 23, null], "book"],
  "rnbqkb1r/pp3ppp/2p1p3/3p4/2PPn3/2N1PN2/PP3PPP/R1BQKB1R w KQkq -" : [73,[61, 43, null], "book"],
  "rnbqkb1r/pp3ppp/2p1p3/3p4/2PPn3/2NBPN2/PP3PPP/R1BQK2R b KQkq -" : [56,[13, 29, null], "book"],
  "rnbqkb1r/pp4pp/2p1p3/3p1p2/2PPn3/2NBPN2/PP3PPP/R1BQK2R w KQkq -" : [57,[45, 28, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/8/2pP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [46,[52, 36, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [34,[27, 34, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/2pp4/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [46,[34, 27, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/2pP4/3P4/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [34,[20, 27, null], "book"],
  "rnbqkbnr/pp3ppp/8/2pp4/3P4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [42,[54, 46, null], "book"],
  "rnbqkbnr/pp3ppp/8/2pp2B1/3P4/5N2/PP2PPPP/RN1QKB1R b KQkq -" : [37,[5, 12, null], "book"],
  "rnbqkbnr/pp3ppp/2p1p3/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [42,[54, 46, null], "book"],
  "rnbqkbnr/pp3ppp/2p1p3/8/2pP4/2N2NP1/PP2PP1P/R1BQKB1R b KQkq -" : [12,[6, 21, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [43,[54, 46, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p2B1/2PP4/5N2/PP2PPPP/RN1QKB1R b KQkq -" : [26,[5, 12, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/3p2B1/1bPP4/5N2/PP2PPPP/RN1QKB1R w KQkq -" : [34,[57, 42, null], "book"],
  "rnbqkb1r/ppp2pp1/4pn1p/3p2B1/2PP4/5N2/PP2PPPP/RN1QKB1R w KQkq -" : [25,[30, 21, null], "book"],
  "rnbqkb1r/ppp2pp1/4pB1p/3p4/2PP4/5N2/PP2PPPP/RN1QKB1R b KQkq -" : [34,[3, 21, null], "book"],
  "rnb1kb1r/ppp2pp1/4pq1p/3p4/2PP4/5N2/PP2PPPP/RN1QKB1R w KQkq -" : [35,[57, 42, null], "book"],
  "rnb1kb1r/ppp2pp1/4pq1p/3p4/2PP4/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [18,[10, 18, null], "book"],
  "rnb1kb1r/pp3pp1/2p1pq1p/3p4/2PP4/2N2N2/PP2PPPP/R2QKB1R w KQkq -" : [33,[52, 44, null], "book"],
  "rnb1kb1r/pp3pp1/2p1pq1p/3p4/2PP4/1QN2N2/PP2PPPP/R3KB1R b KQkq -" : [11,[27, 34, null], "book"],
  "r1bqkb1r/pppn1ppp/4pn2/3p2B1/2PP4/5N2/PP2PPPP/RN1QKB1R w KQkq -" : [30,[52, 44, null], "book"],
  "r1bqkb1r/pppn1ppp/4pn2/3p2B1/2PP4/4PN2/PP3PPP/RN1QKB1R b KQkq -" : [39,[5, 33, null], "book"],
  "r1bqkb1r/pp1n1ppp/2p1pn2/3p2B1/2PP4/4PN2/PP3PPP/RN1QKB1R w KQkq -" : [37,[57, 42, null], "book"],
  "r1bqkb1r/pp1n1ppp/2p1pn2/3p2B1/2PP4/4PN2/PP1N1PPP/R2QKB1R b KQkq -" : [23,[5, 12, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/4PN2/PP3PPP/RNBQKB1R b KQkq -" : [15,[5, 12, null], "book"],
  "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/4PN2/PP3PPP/RNBQKB1R w KQkq -" : [40,[57, 42, null], "book"],
  "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/4PN2/PP1N1PPP/R1BQKB1R b KQkq -" : [31,[5, 12, null], "book"],
  "r1bqkb1r/pp1n1ppp/2p1pn2/3p4/2PP4/4PN2/PP1N1PPP/R1BQKB1R w KQkq -" : [31,[61, 43, null], "book"],
  "r1bqkb1r/pp1n1ppp/2p1pn2/3p4/2PP4/3BPN2/PP1N1PPP/R1BQK2R b KQkq -" : [34,[5, 12, null], "book"],
  "r1bqkb1r/pp1n1ppp/4pn2/2pp4/2PP4/3BPN2/PP1N1PPP/R1BQK2R w KQkq -" : [51,[60, 62, null], "book"],
  "rnbqkbnr/ppp1pp1p/6p1/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [67,[34, 27, null], "book"],
  "r1bqkbnr/ppp1pppp/2n5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [54,[57, 42, null], "book"],
  "r1bqkbnr/ppp1pppp/2n5/3P4/3P4/8/PP2PPPP/RNBQKBNR b KQkq -" : [50,[3, 27, null], "book"],
  "r1b1kbnr/ppp1pppp/2n5/3q4/3P4/8/PP2PPPP/RNBQKBNR w KQkq -" : [40,[52, 44, null], "book"],
  "r1b1kbnr/ppp1pppp/2n5/3q4/3P4/4P3/PP3PPP/RNBQKBNR b KQkq -" : [47,[12, 28, null], "book"],
  "r1b1kbnr/ppp2ppp/2n5/3qp3/3P4/4P3/PP3PPP/RNBQKBNR w KQkq -" : [54,[57, 42, null], "book"],
  "r1b1kbnr/ppp2ppp/2n5/3qp3/3P4/2N1P3/PP3PPP/R1BQKBNR b KQkq -" : [40,[5, 33, null], "book"],
  "r1b1k1nr/ppp2ppp/2n5/3qp3/1b1P4/2N1P3/PP3PPP/R1BQKBNR w KQkq -" : [52,[48, 40, null], "book"],
  "r1b1k1nr/ppp2ppp/2n5/3qp3/1b1P4/2N1P3/PP1B1PPP/R2QKBNR b KQkq -" : [42,[33, 42, null], "book"],
  "r1b1k1nr/ppp2ppp/2n5/3qp3/3P4/2b1P3/PP1B1PPP/R2QKBNR w KQkq -" : [44,[49, 42, null], "book"],
  "r1b1k1nr/ppp2ppp/2n5/3qp3/3P4/2B1P3/PP3PPP/R2QKBNR b KQkq -" : [31,[28, 35, null], "book"],
  "r1b1k1nr/ppp2ppp/2n5/3q4/3p4/2B1P3/PP3PPP/R2QKBNR w KQkq -" : [46,[62, 52, null], "book"],
  "r1b1k1nr/ppp2ppp/2n5/3q4/3p4/2B1P3/PP2NPPP/R2QKB1R b KQkq -" : [38,[6, 21, null], "book"],
  "r1bqkbnr/ppp1pppp/2n5/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [63,[12, 20, null], "book"],
  "r1bqkbnr/ppp1pppp/2n5/8/2pP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [95,[62, 45, null], "book"],
  "r1bqkbnr/ppp1pppp/2n5/8/2pP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [67,[6, 21, null], "book"],
  "r1bqkbnr/ppp2ppp/2n5/3pp3/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [77,[34, 27, null], "book"],
  "r1bqkb1r/ppp1pppp/2n2n2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [67,[62, 45, null], "book"],
  "r1bqkb1r/ppp1pppp/2n2n2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [61,[12, 20, null], "book"],
  "r1bqkb1r/ppp1pppp/2n2n2/8/2pP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [55,[52, 36, null], "book"],
  "r1bqkbnr/ppp1pppp/2n5/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [59,[12, 20, null], "book"],
  "r2qkbnr/ppp1pppp/2n5/3p4/2PP2b1/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [57,[34, 27, null], "book"],
  "r2qkbnr/ppp1pppp/2n5/3p4/Q1PP2b1/5N2/PP2PPPP/RNB1KB1R b KQkq -" : [28,[38, 45, null], "book"],
  "r1bqkbnr/ppp2ppp/2n5/3pp3/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [70,[45, 28, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [75,[34, 27, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3P4/3P4/8/PP2PPPP/RNBQKBNR b KQkq -" : [71,[10, 18, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/3P4/3P4/8/PP2PPPP/RNBQKBNR w KQkq -" : [80,[27, 18, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/3P4/4P3/PPP2PPP/RNBQKBNR b KQkq -" : [16,[12, 20, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/3P4/4P3/PPP2PPP/RNBQKBNR w KQkq -" : [18,[62, 45, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/3P4/3BP3/PPP2PPP/RNBQK1NR b KQkq -" : [-24,[10, 26, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/3BP3/PPP2PPP/RNBQK1NR w KQkq -" : [-16,[62, 45, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2PBP3/PP3PPP/RNBQK1NR b KQkq -" : [-44,[1, 18, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -" : [-74,[27, 36, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/3Pp3/8/PPP2PPP/RNBQKBNR w KQkq -" : [-62,[57, 42, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/2BPp3/8/PPP2PPP/RNBQK1NR b KQkq -" : [-82,[1, 18, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/3Pp3/4B3/PPP2PPP/RN1QKBNR b KQkq -" : [-68,[6, 21, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/3Pp3/5P2/PPP3PP/RNBQKBNR b KQkq -" : [-86,[12, 28, null], "book"],
  "rnbqkbnr/ppp1p1pp/8/5p2/3Pp3/5P2/PPP3PP/RNBQKBNR w KQkq -" : [10,[57, 42, null], "book"],
  "r1bqkbnr/ppp1pppp/2n5/8/3Pp3/5P2/PPP3PP/RNBQKBNR w KQkq -" : [-27,[35, 27, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/3Pp3/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [-50,[6, 21, null], "book"],
  "rn1qkbnr/pppbpppp/8/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [56,[42, 36, null], "book"],
  "rn1qkbnr/ppp1pppp/8/5b2/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [-31,[54, 38, null], "book"],
  "rn1qkbnr/ppp1pppp/8/5b2/3Pp3/2N2P2/PPP3PP/R1BQKBNR b KQkq -" : [-53,[6, 21, null], "book"],
  "rn1qkbnr/ppp1pppp/8/5b2/3P4/2N2p2/PPP3PP/R1BQKBNR w KQkq -" : [-1,[59, 45, null], "book"],
  "rn1qkbnr/ppp1pppp/8/5b2/3P4/2N2Q2/PPP3PP/R1B1KBNR b KQkq -" : [0,[3, 2, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/3P4/2N2Q2/PPP3PP/R1B1KBNR w KQkq -" : [22,[58, 30, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/5b2/3Pp3/2N2P2/PPP3PP/R1BQKBNR w KQkq -" : [-60,[54, 38, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/5b2/2BPp3/2N2P2/PPP3PP/R1BQK1NR b KQkq -" : [-101,[12, 20, null], "book"],
  "rnbqkbnr/pp2pppp/8/2p5/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [11,[62, 52, null], "book"],
  "rnbqkbnr/ppp2ppp/8/4p3/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [0,[62, 52, null], "book"],
  "rnbqkbnr/ppp2ppp/8/4p3/3Pp3/2N1B3/PPP2PPP/R2QKBNR b KQkq -" : [-36,[28, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/8/4P3/4p3/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [-38,[3, 59, null], "book"],
  "rnbqkbnr/ppp2ppp/8/4p3/3Pp3/2N5/PPP1NPPP/R1BQKB1R b KQkq -" : [-15,[1, 18, null], "book"],
  "rnbqkbnr/ppp2ppp/8/4p3/3PN3/8/PPP2PPP/R1BQKBNR b KQkq -" : [-43,[3, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/8/4p2Q/3Pp3/2N5/PPP2PPP/R1B1KBNR b KQkq -" : [-84,[3, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [60,[42, 36, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/8/3Pp3/2N1B3/PPP2PPP/R2QKBNR b KQkq -" : [-85,[6, 21, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/8/3Pp3/2N2P2/PPP3PP/R1BQKBNR b KQkq -" : [-67,[5, 33, null], "book"],
  "rnbqkbnr/ppp1p1pp/8/5p2/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [2,[58, 30, null], "book"],
  "r1bqkbnr/ppp1pppp/2n5/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [31,[35, 27, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [-50,[58, 30, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/8/3Pp3/2N1B3/PPP2PPP/R2QKBNR b KQkq -" : [-98,[2, 29, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/6B1/3Pp3/2N5/PPP2PPP/R2QKBNR b KQkq -" : [-57,[2, 29, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/5bB1/3Pp3/2N5/PPP2PPP/R2QKBNR w KQkq -" : [-44,[53, 45, null], "book"],
  "rn1qkb1r/ppp1pppp/5B2/5b2/3Pp3/2N5/PPP2PPP/R2QKBNR b KQkq -" : [-52,[12, 21, null], "book"],
  "rn1qkb1r/ppp2ppp/5p2/5b2/3Pp3/2N5/PPP2PPP/R2QKBNR w KQkq -" : [-40,[59, 52, null], "book"],
  "rn1qkb1r/ppp2ppp/5p2/5b2/3Pp1P1/2N5/PPP2P1P/R2QKBNR b KQkq -" : [-104,[29, 22, null], "book"],
  "rn1qkb1r/ppp2ppp/5pb1/8/3Pp1P1/2N5/PPP2P1P/R2QKBNR w KQkq -" : [-112,[55, 39, null], "book"],
  "rn1qkb1r/ppp2ppp/5pb1/8/3Pp1P1/2N5/PPP1QP1P/R3KBNR b KQkq -" : [-156,[3, 35, null], "book"],
  "rn1qk2r/ppp2ppp/5pb1/8/1b1Pp1P1/2N5/PPP1QP1P/R3KBNR w KQkq -" : [-130,[52, 25, null], "book"],
  "rn1qk2r/ppp2ppp/5pb1/1Q6/1b1Pp1P1/2N5/PPP2P1P/R3KBNR b KQkq -" : [-136,[1, 18, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/8/3Pp3/2N2P2/PPP3PP/R1BQKBNR b KQkq -" : [-64,[36, 45, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/5b2/3PpB2/2N2P2/PPP3PP/R2QKBNR b KQkq -" : [-120,[1, 18, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/3P1b2/4p3/2N2P2/PPP3PP/R1BQKBNR b KQkq -" : [-137,[12, 20, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/5b2/3PP3/2N5/PPP3PP/R1BQKBNR b KQkq -" : [-63,[21, 36, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/5b2/3Pp1P1/2N2P2/PPP4P/R1BQKBNR b KQkq -" : [-62,[29, 22, null], "book"],
  "rn1qkb1r/ppp1pppp/5nb1/8/3Pp1P1/2N2P2/PPP4P/R1BQKBNR w KQkq -" : [-59,[38, 30, null], "book"],
  "rn1qkb1r/ppp1pppp/5nb1/6P1/3Pp3/2N2P2/PPP4P/R1BQKBNR b KQkq -" : [-63,[21, 27, null], "book"],
  "rn1qkb1r/ppp1pppp/6b1/3n2P1/3Pp3/2N2P2/PPP4P/R1BQKBNR w KQkq -" : [-58,[61, 54, null], "book"],
  "rn1qkb1r/ppp1pppp/6b1/3n2P1/3PP3/2N5/PPP4P/R1BQKBNR b KQkq -" : [-84,[27, 42, null], "book"],
  "rn1qkb1r/ppp1pppp/5nb1/8/3Pp1PP/2N2P2/PPP5/R1BQKBNR b KQkq -" : [-84,[15, 23, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2p5/3Pp3/2N2P2/PPP3PP/R1BQKBNR w KQkq -" : [-35,[35, 27, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/8/3Pp3/2N2P2/PPP3PP/R1BQKBNR w KQkq -" : [-30,[42, 36, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/8/3P4/2N1pP2/PPP3PP/R1BQKBNR w KQkq -" : [33,[58, 44, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/4p3/3Pp3/2N2P2/PPP3PP/R1BQKBNR w KQkq -" : [111,[35, 28, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/8/3Pp3/2N2P2/PPP3PP/R1BQKBNR w KQkq -" : [48,[45, 36, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/8/3PP3/2N5/PPP3PP/R1BQKBNR b KQkq -" : [50,[10, 26, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/8/1b1PP3/2N5/PPP3PP/R1BQKBNR w KQkq -" : [64,[48, 40, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/8/1b1PP3/2NB4/PPP3PP/R1BQK1NR b KQkq -" : [-59,[21, 36, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/8/3PP3/2bB4/PPP3PP/R1BQK1NR w KQkq -" : [160,[49, 42, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/8/3PP3/2PB4/P1P3PP/R1BQK1NR b KQkq -" : [145,[20, 28, null], "book"],
  "rnbqk2r/ppp2ppp/4p3/8/3Pn3/2PB4/P1P3PP/R1BQK1NR w KQkq -" : [154,[59, 38, null], "book"],
  "rnbqk2r/ppp2ppp/4p3/8/3Pn3/2PBB3/P1P3PP/R2QK1NR b KQkq -" : [-55,[4, 6, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/8/3P4/2N2p2/PPP3PP/R1BQKBNR w KQkq -" : [-58,[62, 45, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/8/3P4/2N2N2/PPP3PP/R1BQKB1R b KQkq -" : [-67,[10, 18, null], "book"],
  "rnbqkb1r/p1p1pppp/1p3n2/8/3P4/2N2N2/PPP3PP/R1BQKB1R w KQkq -" : [124,[45, 28, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/5b2/3P4/2N2N2/PPP3PP/R1BQKB1R w KQkq -" : [-55,[61, 43, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/8/3P2b1/2N2N2/PPP3PP/R1BQKB1R w KQkq -" : [-12,[55, 47, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2p5/3P4/2N2N2/PPP3PP/R1BQKB1R w KQkq -" : [-14,[35, 26, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/8/3P4/2N2N2/PPP3PP/R1BQKB1R w KQkq -" : [-72,[61, 43, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/8/3P4/2N2N2/PPP3PP/R1BQKB1R w KQkq -" : [-31,[61, 43, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/6B1/3P4/2N2N2/PPP3PP/R2QKB1R b KQkq -" : [-53,[5, 12, null], "book"],
  "rnbqk2r/ppp1bppp/4pn2/6B1/3P4/2N2N2/PPP3PP/R2QKB1R w KQkq -" : [-55,[59, 51, null], "book"],
  "rnbqk2r/ppp1bppp/4pn2/6B1/3P4/2NB1N2/PPP3PP/R2QK2R b KQkq -" : [-55,[1, 18, null], "book"],
  "r1bqk2r/ppp1bppp/2n1pn2/6B1/3P4/2NB1N2/PPP3PP/R2QK2R w KQkq -" : [-55,[48, 40, null], "book"],
  "r1bqk2r/ppp1bppp/2n1pn2/6B1/3P4/2NB1N2/PPP3PP/R2Q1RK1 b kq -" : [-124,[18, 35, null], "book"],
  "r1bqk2r/ppp1bppp/4pn2/6B1/3n4/2NB1N2/PPP3PP/R2Q1RK1 w kq -" : [-118,[62, 63, null], "book"],
  "r1bqk2r/ppp1bppp/4pn2/6B1/3n4/2NB1N2/PPP3PP/R2Q1R1K b kq -" : [-127,[15, 23, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/8/3P4/2NB1N2/PPP3PP/R1BQK2R b KQkq -" : [-34,[5, 12, null], "book"],
  "r1bqkb1r/ppp2ppp/2n1pn2/8/3P4/2NB1N2/PPP3PP/R1BQK2R w KQkq -" : [-29,[48, 40, null], "book"],
  "r1bqkb1r/ppp2ppp/2n1pn2/6B1/3P4/2NB1N2/PPP3PP/R2QK2R b KQkq -" : [-56,[18, 33, null], "book"],
  "r1bqk2r/ppp1bppp/2n1pn2/6B1/3PN3/3B1N2/PPP3PP/R2QK2R b KQkq -" : [-76,[21, 36, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/8/3P4/2N2N2/PPP3PP/R1BQKB1R w KQkq -" : [-56,[58, 37, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/8/2BP4/2N2N2/PPP3PP/R1BQK2R b KQkq -" : [-52,[5, 14, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/8/2BP4/2N2N2/PPP3PP/R1BQK2R w KQkq -" : [-52,[58, 30, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/8/2BP3P/2N2N2/PPP3P1/R1BQK2R b KQkq -" : [-111,[4, 6, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/4N3/2BP4/2N5/PPP3PP/R1BQK2R b KQkq -" : [-98,[4, 6, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/8/2BP4/2N2N2/PPP3PP/R1BQ1RK1 b kq -" : [-66,[4, 6, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/8/2BP4/2N2N2/PPP3PP/R1BQ1RK1 w - -" : [-57,[55, 47, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/8/2BP4/2N2N2/PPP3PP/R1BQ1R1K b - -" : [-90,[2, 38, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/8/2BP4/2N2N2/PPP3PP/R1B1QRK1 b - -" : [-98,[2, 38, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/8/3P1B2/2N2N2/PPP3PP/R2QKB1R b KQkq -" : [-54,[5, 14, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/4N3/3P4/2N5/PPP3PP/R1BQKB1R b KQkq -" : [-116,[2, 20, null], "book"],
  "rnbqkb1r/ppp1ppp1/5n2/7p/3P4/2N2N2/PPP3PP/R1BQKB1R w KQkq -" : [55,[61, 34, null], "book"],
  "r1bqkb1r/pppnpppp/5n2/8/3P4/2N2N2/PPP3PP/R1BQKB1R w KQkq -" : [-43,[61, 34, null], "book"],
  "r1bqkb1r/ppp1pppp/2n2n2/8/3P4/2N2N2/PPP3PP/R1BQKB1R w KQkq -" : [-39,[61, 25, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/8/3P4/2N2Q2/PPP3PP/R1B1KBNR b KQkq -" : [-134,[3, 35, null], "book"],
  "r1bqkb1r/ppp1pppp/2n2n2/8/3P4/2N2Q2/PPP3PP/R1B1KBNR w KQkq -" : [-104,[61, 25, null], "book"],
  "rnb1kb1r/ppp1pppp/5n2/8/3q4/2N2Q2/PPP3PP/R1B1KBNR w KQkq -" : [-139,[58, 44, null], "book"],
  "rnb1kb1r/ppp1pppp/5n2/8/3q4/2N1BQ2/PPP3PP/R3KBNR b KQkq -" : [-128,[35, 39, null], "book"],
  "rnb1kb1r/ppp1pppp/5n2/8/6q1/2N1BQ2/PPP3PP/R3KBNR w KQkq -" : [-124,[45, 53, null], "book"],
  "rnb1kb1r/ppp1pppp/5n2/8/6q1/2N1B3/PPP2QPP/R3KBNR b KQkq -" : [-135,[38, 29, null], "book"],
  "rnb1kb1r/ppp1pppp/8/8/4n1q1/2N1B3/PPP2QPP/R3KBNR w KQkq -" : [28,[42, 36, null], "book"],
  "rnb1kb1r/ppp1pppp/8/8/4N1q1/4B3/PPP2QPP/R3KBNR b KQkq -" : [0,[38, 36, null], "book"],
  "rnb1kb1r/ppp1pppp/8/8/4q3/4B3/PPP2QPP/R3KBNR w KQkq -" : [31,[61, 43, null], "book"],
  "rnb1kb1r/ppp1pppp/8/8/4q3/4B3/PPP2QPP/2KR1BNR b kq -" : [-74,[1, 18, null], "book"],
  "r1b1kb1r/ppp1pppp/2n5/8/4q3/4B3/PPP2QPP/2KR1BNR w kq -" : [-66,[61, 43, null], "book"],
  "r1b1kb1r/ppp1pppp/2n5/8/4q3/3BB3/PPP2QPP/2KR2NR b kq -" : [-91,[36, 32, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/8/3Pp3/2N2P2/PPP3PP/R1BQKBNR w KQkq -" : [48,[45, 36, null], "book"],
  "r1bqkb1r/ppp1pppp/2n2n2/8/3Pp3/2N2P2/PPP3PP/R1BQKBNR w KQkq -" : [-17,[35, 27, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/3P1P2/8/PPP1P1PP/RNBQKBNR b KQkq -" : [-59,[2, 29, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/3P2P1/8/PPP1PP1P/RNBQKBNR b KQkq -" : [-161,[2, 38, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/3P4/2N5/PPP1PPPP/R1BQKBNR b KQkq -" : [0,[6, 21, null], "book"],
  "rn1qkbnr/ppp1pppp/8/3p1b2/3P4/2N5/PPP1PPPP/R1BQKBNR w KQkq -" : [27,[53, 45, null], "book"],
  "rn1qkbnr/ppp1pppp/8/3p4/3P2b1/2N5/PPP1PPPP/R1BQKBNR w KQkq -" : [73,[53, 45, null], "book"],
  "rnbqkbnr/pp2pppp/8/2pp4/3P4/2N5/PPP1PPPP/R1BQKBNR w KQkq -" : [18,[52, 36, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/3P4/2N5/PPP1PPPP/R1BQKBNR w KQkq -" : [103,[35, 28, null], "book"],
  "rnbqkbnr/ppp1p1pp/8/3p1p2/3P4/2N5/PPP1PPPP/R1BQKBNR w KQkq -" : [46,[58, 37, null], "book"],
  "rnbqkbnr/ppp1pp1p/6p1/3p4/3P4/2N5/PPP1PPPP/R1BQKBNR w KQkq -" : [46,[52, 36, null], "book"],
  "rnbqkbnr/ppp1pp1p/6p1/3p4/3P4/2N2N2/PPP1PPPP/R1BQKB1R b KQkq -" : [7,[6, 21, null], "book"],
  "rnbqk1nr/ppp1ppbp/6p1/3p4/3P4/2N2N2/PPP1PPPP/R1BQKB1R w KQkq -" : [48,[52, 36, null], "book"],
  "rnbqkbnr/ppp1ppp1/8/3p3p/3P4/2N5/PPP1PPPP/R1BQKBNR w KQkq -" : [51,[52, 36, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/3P4/2N5/PPP1PPPP/R1BQKBNR w KQkq -" : [2,[58, 37, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p2B1/3P4/2N5/PPP1PPPP/R2QKBNR b KQkq -" : [-14,[15, 23, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/3p1bB1/3P4/2N5/PPP1PPPP/R2QKBNR w KQkq -" : [-11,[52, 44, null], "book"],
  "rn1qkb1r/ppp1pppp/5B2/3p1b2/3P4/2N5/PPP1PPPP/R2QKBNR b KQkq -" : [-18,[14, 21, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/3p1bB1/3P4/2N2P2/PPP1P1PP/R2QKBNR b KQkq -" : [-28,[10, 18, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p2B1/3P4/2N5/PPP1PPPP/R2QKBNR w KQkq -" : [39,[52, 36, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p2B1/3P4/2N2N2/PPP1PPPP/R2QKB1R b KQkq -" : [-28,[5, 33, null], "book"],
  "r1bqkb1r/pppnpppp/5n2/3p2B1/3P4/2N5/PPP1PPPP/R2QKBNR w KQkq -" : [-17,[62, 45, null], "book"],
  "r1bqkb1r/pppnpppp/5n2/3p2B1/3P4/2N2N2/PPP1PPPP/R2QKB1R b KQkq -" : [-13,[15, 23, null], "book"],
  "r1bqkb1r/pppnpp1p/5np1/3p2B1/3P4/2N2N2/PPP1PPPP/R2QKB1R w KQkq -" : [8,[52, 44, null], "book"],
  "rnbqkb1r/ppp1pppp/8/3p2B1/3Pn3/2N5/PPP1PPPP/R2QKBNR w KQkq -" : [50,[42, 36, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [-59,[21, 36, null], "book"],
  "rnbqkb1r/ppp1pppp/8/3p4/3Pn3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [-59,[42, 36, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq -" : [40,[12, 20, null], "book"],
  "rn1qkbnr/ppp1pppp/8/3p4/3P2b1/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [74,[45, 28, null], "book"],
  "rn1qkbnr/ppp1pppp/8/3pN3/3P2b1/8/PPP1PPPP/RNBQKB1R b KQkq -" : [60,[38, 29, null], "book"],
  "rn1qkbnr/ppp1pppp/8/3pNb2/3P4/8/PPP1PPPP/RNBQKB1R w KQkq -" : [70,[50, 34, null], "book"],
  "rn1qkbnr/ppp1pppp/8/3pNb2/3P2P1/8/PPP1PP1P/RNBQKB1R b KQkq -" : [54,[29, 2, null], "book"],
  "rnbqkbnr/pp2pppp/8/2pp4/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [40,[50, 34, null], "book"],
  "rnbqkbnr/pp2pppp/8/2pp4/3P4/5NP1/PPP1PP1P/RNBQKB1R b KQkq -" : [12,[6, 21, null], "book"],
  "rnbqkbnr/pp2pppp/8/3p4/3p4/5NP1/PPP1PP1P/RNBQKB1R w KQkq -" : [16,[61, 54, null], "book"],
  "rnbqkbnr/pp2pppp/8/3p4/3p4/5NP1/PPP1PPBP/RNBQK2R b KQkq -" : [0,[6, 21, null], "book"],
  "r1bqkbnr/ppp1pppp/2n5/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [54,[50, 34, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [34,[50, 34, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq -" : [7,[10, 26, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pp4/3P1B2/5N2/PPP1PPPP/RN1QKB1R w KQkq -" : [5,[52, 44, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pp4/3P1B2/4PN2/PPP2PPP/RN1QKB1R b KQkq -" : [8,[1, 18, null], "book"],
  "rnb1kb1r/pp2pppp/1q3n2/2pp4/3P1B2/4PN2/PPP2PPP/RN1QKB1R w KQkq -" : [39,[50, 34, null], "book"],
  "rnb1kb1r/pp2pppp/1q3n2/2pp4/3P1B2/2N1PN2/PPP2PPP/R2QKB1R b KQkq -" : [8,[26, 34, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p2B1/3P4/5N2/PPP1PPPP/RN1QKB1R b KQkq -" : [-19,[21, 36, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p2B1/3P4/5N2/PPP1PPPP/RN1QKB1R w KQkq -" : [19,[52, 44, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p2B1/3P4/4PN2/PPP2PPP/RN1QKB1R b KQkq -" : [15,[10, 26, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pp2B1/3P4/4PN2/PPP2PPP/RN1QKB1R w KQkq -" : [21,[50, 42, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pp2B1/3P4/2P1PN2/PP3PPP/RN1QKB1R b KQkq -" : [22,[1, 11, null], "book"],
  "rnb1kb1r/pp3ppp/1q2pn2/2pp2B1/3P4/2P1PN2/PP3PPP/RN1QKB1R w KQkq -" : [21,[59, 50, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3p2B1/3P4/5N2/PPP1PPPP/RN1QKB1R w KQkq -" : [16,[50, 34, null], "book"],
  "rnbqkb1r/ppp1pppp/8/3p2B1/3Pn3/5N2/PPP1PPPP/RN1QKB1R w KQkq -" : [-2,[30, 37, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [37,[27, 34, null], "book"],
  "rnbqkb1r/p1p1pppp/5n2/1p1p4/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [125,[34, 25, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R b KQkq -" : [14,[12, 20, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/3p1b2/3P4/4PN2/PPP2PPP/RNBQKB1R w KQkq -" : [31,[50, 34, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R w KQkq -" : [18,[49, 41, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/3BPN2/PPP2PPP/RNBQK2R b KQkq -" : [16,[1, 11, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pp4/3P4/3BPN2/PPP2PPP/RNBQK2R w KQkq -" : [14,[49, 41, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pp4/3P4/1P1BPN2/P1P2PPP/RNBQK2R b KQkq -" : [18,[9, 17, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/3P4/5NP1/PPP1PP1P/RNBQKB1R b KQkq -" : [2,[10, 26, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/3P4/3Q4/PPP1PPPP/RNB1KBNR b KQkq -" : [-44,[10, 26, null], "book"],
  "r1bqkbnr/ppp1pppp/2n5/3p4/3P4/3Q4/PPP1PPPP/RNB1KBNR w KQkq -" : [13,[62, 45, null], "book"],
  "r1bqkbnr/ppp1pppp/2n5/3p4/3P4/2NQ4/PPP1PPPP/R1B1KBNR b KQkq -" : [-73,[12, 28, null], "book"],
  "rnbqkbnr/ppp1pppp/3p4/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -" : [60,[52, 36, null], "book"],
  "rnbqkbnr/ppp1pppp/3p4/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq -" : [32,[12, 28, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/4p3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [35,[35, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/4P3/2P5/8/PP2PPPP/RNBQKBNR b KQkq -" : [-11,[19, 28, null], "book"],
  "r1bqkbnr/ppp2ppp/2np4/4P3/2P5/8/PP2PPPP/RNBQKBNR w KQkq -" : [29,[28, 19, null], "book"],
  "rnbqkbnr/ppp1pppp/3p4/8/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq -" : [55,[6, 21, null], "book"],
  "rn1qkbnr/ppp1pppp/3p4/8/3P2b1/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [86,[52, 36, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -" : [122,[35, 28, null], "book"],
  "rnbqkbnr/pppp1ppp/8/3Pp3/8/8/PPP1PPPP/RNBQKBNR b KQkq -" : [-14,[6, 21, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2bPp3/8/8/PPP1PPPP/RNBQKBNR w KQkq -" : [-11,[52, 36, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2bPp3/4P3/8/PPP2PPP/RNBQKBNR b KQkq -" : [-21,[11, 19, null], "book"],
  "rnb1k1nr/pppp1ppp/8/2bPp3/4P2q/8/PPP2PPP/RNBQKBNR w KQkq -" : [24,[59, 52, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4P3/8/8/PPP1PPPP/RNBQKBNR b KQkq -" : [114,[1, 18, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/4P3/8/8/PPP1PPPP/RNBQKBNR w KQkq -" : [129,[62, 45, null], "book"],
  "rnbqkbnr/pppp2pp/5p2/4P3/8/8/PPP1PPPP/RNBQKBNR w KQkq -" : [135,[62, 45, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4P3/8/8/PPP1PPPP/RNBQKBNR w KQkq -" : [115,[62, 45, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4P3/8/5N2/PPP1PPPP/RNBQKB1R b KQkq -" : [131,[3, 12, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1P3/8/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [155,[57, 42, null], "book"],
  "r1bqkbnr/pppp2pp/2n2p2/4P3/8/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [143,[58, 37, null], "book"],
  "r1bqkbnr/pppp1pp1/2n4p/4P3/8/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [159,[52, 36, null], "book"],
  "r1bqkb1r/ppppnppp/2n5/4P3/8/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [141,[58, 37, null], "book"],
  "r1b1kbnr/ppppqppp/2n5/4P3/8/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [126,[58, 30, null], "book"],
  "r1b1kbnr/ppppqppp/2n5/3QP3/8/5N2/PPP1PPPP/RNB1KB1R b KQkq -" : [100,[13, 21, null], "book"],
  "rnb1kbnr/pppp1ppp/8/4P3/7q/8/PPP1PPPP/RNBQKBNR w KQkq -" : [235,[62, 45, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -" : [39,[52, 36, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/8/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq -" : [18,[6, 21, null], "book"],
  "rnbqkbnr/pppp2pp/4p3/5p2/3P1B2/8/PPP1PPPP/RN1QKBNR w KQkq -" : [63,[52, 44, null], "book"],
  "rnbqkbnr/pppp2pp/4p3/5p2/3P1BP1/8/PPP1PP1P/RN1QKBNR b KQkq -" : [41,[29, 38, null], "book"],
  "rnbqkbnr/p1pp1ppp/1p2p3/8/2PPP3/8/PP3PPP/RNBQKBNR b KQkq -" : [63,[5, 33, null], "book"],
  "rn1qkbnr/pbpp1ppp/1p2p3/8/2PPP3/8/PP3PPP/RNBQKBNR w KQkq -" : [87,[61, 43, null], "book"],
  "rn1qkbnr/pbpp1ppp/1p2p3/8/2PPP3/3B4/PP3PPP/RNBQK1NR b KQkq -" : [69,[1, 18, null], "book"],
  "r2qkbnr/pbpp1ppp/1pn1p3/8/2PPP3/3B4/PP3PPP/RNBQK1NR w KQkq -" : [63,[62, 52, null], "book"],
  "rn1qkbnr/pbpp1ppp/1p2p3/8/2PPP3/5P2/PP4PP/RNBQKBNR b KQkq -" : [61,[5, 33, null], "book"],
  "rn1qkbnr/pbpp2pp/1p2p3/5p2/2PPP3/5P2/PP4PP/RNBQKBNR w KQkq -" : [66,[57, 42, null], "book"],
  "rn1qkbnr/pbpp2pp/1p2p3/5P2/2PP4/5P2/PP4PP/RNBQKBNR b KQkq -" : [0,[1, 18, null], "book"],
  "rn1qkb1r/pbpp2pp/1p2p2n/5P2/2PP4/5P2/PP4PP/RNBQKBNR w KQkq -" : [-13,[29, 20, null], "book"],
  "rnbqkbnr/p1pp1ppp/1p2p3/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [60,[11, 27, null], "book"],
  "rn1qkbnr/pbpp2pp/1p2p3/3P1p2/2P1P3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [-8,[29, 36, null], "book"],
  "rnbqk1nr/pppp1ppp/4p3/8/1bPP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [40,[58, 51, null], "book"],
  "rnbqk1nr/pppp1ppp/4p3/8/1bPP4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [20,[6, 21, null], "book"],
  "rnbqkbnr/pp1p1ppp/4p3/2p5/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [79,[35, 27, null], "book"],
  "rnbqkbnr/pp1p1ppp/4p3/2pP4/2P5/8/PP2PPPP/RNBQKBNR b KQkq -" : [85,[11, 19, null], "book"],
  "rnbqkbnr/pp1p1ppp/8/2pp4/2P5/8/PP2PPPP/RNBQKBNR w KQkq -" : [80,[34, 27, null], "book"],
  "rnbqkbnr/pp1p1ppp/8/2pP4/8/8/PP2PPPP/RNBQKBNR b KQkq -" : [91,[6, 21, null], "book"],
  "rnbqkbnr/pp3ppp/3p4/2pP4/8/8/PP2PPPP/RNBQKBNR w KQkq -" : [72,[52, 36, null], "book"],
  "rnbqkbnr/pp3ppp/3p4/2pP4/8/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [86,[14, 22, null], "book"],
  "rnbqkbnr/pp3p1p/3p2p1/2pP4/8/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [81,[55, 47, null], "book"],
  "rnbqkbnr/pp3p1p/3p2p1/2pP4/4P3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [62,[6, 21, null], "book"],
  "rnbqk1nr/pp3pbp/3p2p1/2pP4/4P3/2N5/PP3PPP/R1BQKBNR w KQkq -" : [73,[55, 47, null], "book"],
  "rnbqk1nr/pp3pbp/3p2p1/2pP4/4P3/2N2N2/PP3PPP/R1BQKB1R b KQkq -" : [61,[8, 16, null], "book"],
  "rnbqk2r/pp2npbp/3p2p1/2pP4/4P3/2N2N2/PP3PPP/R1BQKB1R w KQkq -" : [114,[58, 37, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [124,[35, 28, null], "book"],
  "rnbqkbnr/pppp2pp/4p3/5p2/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [62,[48, 40, null], "book"],
  "rnbqkbnr/pppp2pp/4p3/5p2/2PPP3/8/PP3PPP/RNBQKBNR b KQkq -" : [-34,[29, 36, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -" : [61,[50, 34, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq -" : [55,[12, 20, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5pB1/3P4/8/PPP1PPPP/RN1QKBNR b KQkq -" : [54,[14, 22, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/2PP4/8/PP2PPPP/RNBQKBNR b KQkq -" : [62,[11, 19, null], "book"],
  "rnbqkbnr/pppp2pp/4p3/5p2/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [53,[5, 33, null], "book"],
  "rnbqkb1r/pppp2pp/4pn2/5p2/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [44,[48, 40, null], "book"],
  "rnbqkb1r/pppp2pp/4pn2/5p2/2PP4/2N3P1/PP2PP1P/R1BQKBNR b KQkq -" : [52,[5, 33, null], "book"],
  "rnbqkb1r/pp1p2pp/2p1pn2/5p2/2PP4/2N3P1/PP2PP1P/R1BQKBNR w KQkq -" : [70,[58, 37, null], "book"],
  "rnbqkb1r/pp1p2pp/2p1pn2/5p2/2PP4/2N3P1/PP2PPBP/R1BQK1NR b KQkq -" : [53,[11, 27, null], "book"],
  "rnbqkb1r/pp4pp/2p1pn2/3p1p2/2PP4/2N3P1/PP2PPBP/R1BQK1NR w KQkq -" : [51,[62, 47, null], "book"],
  "rnbqkbnr/ppppp2p/6p1/5p2/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [108,[55, 39, null], "book"],
  "rnbqkbnr/ppppp2p/6p1/5p2/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [73,[10, 26, null], "book"],
  "rnbqkb1r/ppppp2p/6pn/5p2/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [118,[55, 39, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/5p2/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [61,[54, 46, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/5p2/2PP4/6P1/PP2PP1P/RNBQKBNR b KQkq -" : [55,[12, 20, null], "book"],
  "rnbqkb1r/pppp2pp/4pn2/5p2/2PP4/6P1/PP2PP1P/RNBQKBNR w KQkq -" : [51,[61, 54, null], "book"],
  "rnbqkb1r/pppp2pp/4pn2/5p2/2PP4/6P1/PP2PPBP/RNBQK1NR b KQkq -" : [48,[5, 12, null], "book"],
  "rnbqk2r/pppp2pp/4pn2/5p2/1bPP4/6P1/PP2PPBP/RNBQK1NR w KQkq -" : [68,[57, 51, null], "book"],
  "rnbqk2r/ppppb1pp/4pn2/5p2/2PP4/6P1/PP2PPBP/RNBQK1NR w KQkq -" : [71,[62, 47, null], "book"],
  "rnbqk2r/ppppb1pp/4pn2/5p2/2PP4/2N3P1/PP2PPBP/R1BQK1NR b KQkq -" : [51,[11, 27, null], "book"],
  "rnbq1rk1/ppppb1pp/4pn2/5p2/2PP4/2N3P1/PP2PPBP/R1BQK1NR w KQ -" : [54,[49, 41, null], "book"],
  "rnbq1rk1/ppppb1pp/4pn2/5p2/2PP4/2N1P1P1/PP3PBP/R1BQK1NR b KQ -" : [52,[11, 27, null], "book"],
  "rnbqk2r/ppppb1pp/4pn2/5p2/2PP4/5NP1/PP2PPBP/RNBQK2R b KQkq -" : [51,[11, 27, null], "book"],
  "rnbq1rk1/ppppb1pp/4pn2/5p2/2PP4/5NP1/PP2PPBP/RNBQK2R w KQ -" : [57,[35, 27, null], "book"],
  "rnbq1rk1/ppppb1pp/4pn2/5p2/2PP4/5NP1/PP2PPBP/RNBQ1RK1 b - -" : [50,[11, 27, null], "book"],
  "rnbq1rk1/ppp1b1pp/4pn2/3p1p2/2PP4/5NP1/PP2PPBP/RNBQ1RK1 w - -" : [48,[49, 41, null], "book"],
  "rnbq1rk1/ppp1b1pp/4pn2/3p1p2/2PP4/1P3NP1/P3PPBP/RNBQ1RK1 b - -" : [52,[21, 36, null], "book"],
  "rnbq1rk1/pp2b1pp/2p1pn2/3p1p2/2PP4/1P3NP1/P3PPBP/RNBQ1RK1 w - -" : [49,[57, 42, null], "book"],
  "rnbq1rk1/ppp1b1pp/4pn2/3p1p2/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 b - -" : [52,[10, 18, null], "book"],
  "rnbq1rk1/ppp1b1pp/3ppn2/5p2/2PP4/5NP1/PP2PPBP/RNBQ1RK1 w - -" : [64,[49, 41, null], "book"],
  "rnbq1rk1/ppp1b1pp/3ppn2/5p2/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 b - -" : [56,[21, 36, null], "book"],
  "rnb1qrk1/ppp1b1pp/3ppn2/5p2/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [85,[49, 33, null], "book"],
  "rnb1qrk1/ppp1b1pp/3ppn2/5p2/2PP4/1PN2NP1/P3PPBP/R1BQ1RK1 b - -" : [77,[21, 36, null], "book"],
  "rnb1qrk1/ppp1b1pp/3ppn2/5p2/2PP4/2N2NP1/PPQ1PPBP/R1B2RK1 b - -" : [66,[8, 24, null], "book"],
  "rnbq1rk1/ppppb1pp/4p3/5p2/2PPn3/5NP1/PP2PPBP/RNBQ1RK1 w - -" : [60,[57, 42, null], "book"],
  "rnbqkb1r/ppppp2p/5np1/5p2/2PP4/6P1/PP2PP1P/RNBQKBNR w KQkq -" : [64,[61, 54, null], "book"],
  "rnbqkb1r/ppppp2p/5np1/5p2/2PP4/6P1/PP2PPBP/RNBQK1NR b KQkq -" : [59,[5, 14, null], "book"],
  "rnbqk2r/ppppp1bp/5np1/5p2/2PP4/6P1/PP2PPBP/RNBQK1NR w KQkq -" : [57,[62, 45, null], "book"],
  "rnbqk2r/ppppp1bp/5np1/5p2/2PP4/5NP1/PP2PPBP/RNBQK2R b KQkq -" : [69,[11, 19, null], "book"],
  "rnbq1rk1/ppppp1bp/5np1/5p2/2PP4/5NP1/PP2PPBP/RNBQK2R w KQ -" : [64,[57, 42, null], "book"],
  "rnbq1rk1/ppppp1bp/5np1/5p2/2PP4/5NP1/PP2PPBP/RNBQ1RK1 b - -" : [68,[11, 19, null], "book"],
  "rnbq1rk1/ppp1p1bp/3p1np1/5p2/2PP4/5NP1/PP2PPBP/RNBQ1RK1 w - -" : [51,[57, 42, null], "book"],
  "rnbq1rk1/ppp1p1bp/3p1np1/5p2/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 b - -" : [48,[10, 18, null], "book"],
  "rnbq1rk1/pp2p1bp/2pp1np1/5p2/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [55,[59, 41, null], "book"],
  "r1bq1rk1/ppp1p1bp/2np1np1/5p2/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [85,[35, 27, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/5p2/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [57,[12, 20, null], "book"],
  "rnbqkb1r/ppp1p1pp/3p1n2/5p2/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [65,[62, 45, null], "book"],
  "rnbqkb1r/ppp1p1pp/3p1n2/5p2/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [55,[14, 22, null], "book"],
  "r1bqkb1r/ppp1p1pp/2np1n2/5p2/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [95,[35, 27, null], "book"],
  "rnbqkb1r/ppppp2p/5np1/5p2/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [72,[55, 39, null], "book"],
  "rnbqkb1r/ppppp2p/5np1/5p2/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [62,[5, 14, null], "book"],
  "rnbqk2r/ppppp1bp/5np1/5p2/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [60,[54, 46, null], "book"],
  "rnbqk2r/ppppp1bp/5np1/5pB1/2PP4/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [36,[21, 36, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -" : [19,[29, 36, null], "book"],
  "rnbqkbnr/ppp1p1pp/3p4/5p2/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [106,[57, 42, null], "book"],
  "rnbqkbnr/ppppp1pp/8/8/3Pp3/8/PPP2PPP/RNBQKBNR w KQkq -" : [9,[57, 42, null], "book"],
  "rnbqkbnr/ppppp1pp/8/8/3Pp3/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [26,[6, 21, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [16,[53, 45, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/6B1/3Pp3/2N5/PPP2PPP/R2QKBNR b KQkq -" : [11,[14, 22, null], "book"],
  "rnbqkb1r/p1ppp1pp/1p3n2/6B1/3Pp3/2N5/PPP2PPP/R2QKBNR w KQkq -" : [95,[53, 45, null], "book"],
  "rnbqkb1r/pp1pp1pp/2p2n2/6B1/3Pp3/2N5/PPP2PPP/R2QKBNR w KQkq -" : [35,[53, 45, null], "book"],
  "rnbqkb1r/ppppp2p/5np1/6B1/3Pp3/2N5/PPP2PPP/R2QKBNR w KQkq -" : [17,[53, 45, null], "book"],
  "rnbqkb1r/ppppp2p/5np1/6B1/3Pp3/2N2P2/PPP3PP/R2QKBNR b KQkq -" : [16,[11, 27, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/8/3Pp3/2N2P2/PPP3PP/R1BQKBNR b KQkq -" : [-10,[11, 27, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/8/3Pp1P1/2N5/PPP2P1P/R1BQKBNR b KQkq -" : [-77,[15, 23, null], "book"],
  "rnbqkbnr/ppppp1pp/8/8/3Pp3/8/PPPN1PPP/R1BQKBNR b KQkq -" : [-52,[6, 21, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/3P4/6P1/PPP1PP1P/RNBQKBNR b KQkq -" : [62,[6, 21, null], "book"],
  "rnbqkbnr/ppppp2p/6p1/5p2/3P4/6P1/PPP1PP1P/RNBQKBNR w KQkq -" : [86,[55, 39, null], "book"],
  "rnbqkbnr/ppppp2p/6p1/5p2/3P4/6P1/PPP1PPBP/RNBQK1NR b KQkq -" : [61,[5, 14, null], "book"],
  "rnbqk1nr/ppppp1bp/6p1/5p2/3P4/6P1/PPP1PPBP/RNBQK1NR w KQkq -" : [63,[50, 34, null], "book"],
  "rnbqk1nr/ppppp1bp/6p1/5p2/3P4/5NP1/PPP1PPBP/RNBQK2R b KQkq -" : [59,[6, 21, null], "book"],
  "rnbqk1nr/pp1pp1bp/2p3p1/5p2/3P4/5NP1/PPP1PPBP/RNBQK2R w KQkq -" : [58,[50, 34, null], "book"],
  "rnbqk1nr/pp1pp1bp/2p3p1/5p2/3P4/5NP1/PPP1PPBP/RNBQ1RK1 b kq -" : [50,[6, 21, null], "book"],
  "rnbqk2r/pp1pp1bp/2p3pn/5p2/3P4/5NP1/PPP1PPBP/RNBQ1RK1 w kq -" : [100,[50, 34, null], "book"],
  "rnbqk1nr/ppppp1bp/6p1/5p2/3P4/6PN/PPP1PPBP/RNBQK2R b KQkq -" : [42,[1, 18, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/5p2/3P4/6P1/PPP1PP1P/RNBQKBNR w KQkq -" : [60,[62, 45, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/5p2/3P4/6P1/PPP1PPBP/RNBQK1NR b KQkq -" : [58,[11, 27, null], "book"],
  "rnbqkb1r/ppp1p1pp/3p1n2/5p2/3P4/6P1/PPP1PPBP/RNBQK1NR w KQkq -" : [57,[62, 45, null], "book"],
  "rnbqkb1r/pppp2pp/4pn2/5p2/3P4/6P1/PPP1PPBP/RNBQK1NR w KQkq -" : [58,[62, 47, null], "book"],
  "rnbqkb1r/pppp2pp/4pn2/5p2/3P4/5NP1/PPP1PPBP/RNBQK2R b KQkq -" : [50,[11, 27, null], "book"],
  "rnbqk2r/ppppb1pp/4pn2/5p2/3P4/5NP1/PPP1PPBP/RNBQK2R w KQkq -" : [63,[60, 62, null], "book"],
  "rnbqk2r/ppppb1pp/4pn2/5p2/3P4/5NP1/PPP1PPBP/RNBQ1RK1 b kq -" : [53,[11, 27, null], "book"],
  "rnbq1rk1/ppppb1pp/4pn2/5p2/3P4/5NP1/PPP1PPBP/RNBQ1RK1 w - -" : [55,[50, 34, null], "book"],
  "rnbqkb1r/pppp2pp/4pn2/5p2/3P4/6PN/PPP1PPBP/RNBQK2R b KQkq -" : [48,[5, 12, null], "book"],
  "rnbqkb1r/ppppp2p/5np1/5p2/3P4/6P1/PPP1PPBP/RNBQK1NR w KQkq -" : [64,[55, 39, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/3P2P1/8/PPP1PP1P/RNBQKBNR b KQkq -" : [-19,[11, 27, null], "book"],
  "rnbqkbnr/pppp2pp/8/4pp2/3P2P1/8/PPP1PP1P/RNBQKBNR w KQkq -" : [59,[38, 29, null], "book"],
  "rnbqkbnr/ppppp1pp/8/8/3P2p1/8/PPP1PP1P/RNBQKBNR w KQkq -" : [15,[55, 47, null], "book"],
  "rnbqkbnr/ppppp1pp/8/8/3PP1p1/8/PPP2P1P/RNBQKBNR b KQkq -" : [-48,[11, 27, null], "book"],
  "rnbqkbnr/ppp1p1pp/8/3p4/3PP1p1/8/PPP2P1P/RNBQKBNR w KQkq -" : [-52,[61, 54, null], "book"],
  "rnbqkbnr/ppp1p1pp/8/3p4/3PP1p1/2N5/PPP2P1P/R1BQKBNR b KQkq -" : [-48,[27, 36, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/3P4/7P/PPP1PPP1/RNBQKBNR b KQkq -" : [41,[12, 20, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/5p2/3P4/7P/PPP1PPP1/RNBQKBNR w KQkq -" : [42,[58, 37, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/5p2/3P2P1/7P/PPP1PP2/RNBQKBNR b KQkq -" : [-23,[11, 27, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/3P4/2N5/PPP1PPPP/R1BQKBNR b KQkq -" : [41,[6, 21, null], "book"],
  "rnbqkbnr/ppp1p1pp/8/3p1p2/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [0,[27, 36, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/5p2/3P4/2N5/PPP1PPPP/R1BQKBNR w KQkq -" : [27,[58, 30, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/5p2/3P2P1/2N5/PPP1PP1P/R1BQKBNR b KQkq -" : [-26,[11, 27, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq -" : [54,[12, 20, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/5p2/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [62,[50, 34, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/5p2/3P4/2P2N2/PP2PPPP/RNBQKB1R b KQkq -" : [32,[12, 20, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/3P4/3Q4/PPP1PPPP/RNB1KBNR b KQkq -" : [44,[12, 20, null], "book"],
  "rnbqkbnr/ppp1p1pp/8/3p1p2/3P4/3Q4/PPP1PPPP/RNB1KBNR w KQkq -" : [53,[50, 34, null], "book"],
  "rnbqkbnr/ppp1p1pp/8/3p1p2/3P2P1/3Q4/PPP1PP1P/RNB1KBNR b KQkq -" : [-11,[29, 38, null], "book"],
  "rnbqkbnr/ppp1p1pp/3p4/5p2/3P4/3Q4/PPP1PPPP/RNB1KBNR w KQkq -" : [57,[57, 42, null], "book"],
  "rnbqkbnr/ppp1p1pp/3p4/5p2/3P2P1/3Q4/PPP1PP1P/RNB1KBNR b KQkq -" : [34,[29, 38, null], "book"],
  "rnbqkbnr/pppp2pp/4p3/5p2/3P4/3Q4/PPP1PPPP/RNB1KBNR w KQkq -" : [42,[50, 34, null], "book"],
  "rnbqkbnr/pppp2pp/4p3/5p2/3P2P1/3Q4/PPP1PP1P/RNB1KBNR b KQkq -" : [42,[6, 21, null], "book"],
  "rnbqkbnr/ppppp2p/6p1/5p2/3P4/3Q4/PPP1PPPP/RNB1KBNR w KQkq -" : [76,[55, 39, null], "book"],
  "rnbqkbnr/ppppp2p/6p1/5p2/3P2P1/3Q4/PPP1PP1P/RNB1KBNR b KQkq -" : [26,[29, 38, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/5p2/3P4/3Q4/PPP1PPPP/RNB1KBNR w KQkq -" : [77,[43, 29, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/5p2/3P2P1/3Q4/PPP1PP1P/RNB1KBNR b KQkq -" : [-39,[21, 38, null], "book"],
  "rnbqkbnr/pppppp1p/8/6p1/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -" : [210,[58, 30, null], "book"],
  "rnbqkbnr/pppppp1p/6p1/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -" : [69,[52, 36, null], "book"],
  "rnbqkbnr/pppppp1p/6p1/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq -" : [34,[6, 21, null], "book"],
  "rnbqk1nr/ppppppbp/6p1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [49,[52, 36, null], "book"],
  "rnbqk1nr/ppppppbp/6p1/8/2PPP3/8/PP3PPP/RNBQKBNR b KQkq -" : [56,[6, 21, null], "book"],
  "rnbqk1nr/ppp1ppbp/3p2p1/8/2PPP3/8/PP3PPP/RNBQKBNR w KQkq -" : [47,[62, 45, null], "book"],
  "rnbqk1nr/ppp1ppbp/3p2p1/8/2PPP3/4B3/PP3PPP/RN1QKBNR b KQkq -" : [26,[10, 26, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/4B3/PP3PPP/RN1QKBNR w KQkq -" : [28,[53, 45, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/4BP2/PP4PP/RN1QKBNR b KQkq -" : [31,[10, 26, null], "book"],
  "rnbqk1nr/ppp1ppbp/3p2p1/8/2PPP3/5N2/PP3PPP/RNBQKB1R b KQkq -" : [36,[2, 38, null], "book"],
  "rn1qk1nr/ppp1ppbp/3p2p1/8/2PPP1b1/5N2/PP3PPP/RNBQKB1R w KQkq -" : [37,[61, 52, null], "book"],
  "rnbqk1nr/pppp1pbp/6p1/4p3/2PPP3/8/PP3PPP/RNBQKBNR w KQkq -" : [78,[35, 28, null], "book"],
  "rnbqk1nr/ppp1ppbp/3p2p1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [55,[52, 36, null], "book"],
  "rnbqk1nr/ppp1ppbp/3p2p1/8/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [60,[6, 21, null], "book"],
  "rnbqk1nr/pp2ppbp/3p2p1/2p5/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq -" : [88,[35, 27, null], "book"],
  "rnbqk1nr/pp2ppbp/3p2p1/2p5/2PPP3/2N2N2/PP3PPP/R1BQKB1R b KQkq -" : [43,[1, 18, null], "book"],
  "rnb1k1nr/pp2ppbp/3p2p1/q1p5/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQkq -" : [66,[35, 27, null], "book"],
  "rnbqk1nr/ppp1p1bp/3p2p1/5p2/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq -" : [95,[36, 29, null], "book"],
  "r1bqk1nr/ppp1ppbp/2np2p1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq -" : [77,[58, 44, null], "book"],
  "rnbqkbnr/pppppp1p/6p1/8/3P3P/8/PPP1PPP1/RNBQKBNR b KQkq -" : [32,[6, 21, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/3P3P/8/PPP1PPP1/RNBQKBNR w KQkq -" : [18,[50, 34, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/7P/3P4/8/PPP1PPP1/RNBQKBNR b KQkq -" : [-8,[21, 31, null], "book"],
  "r1bqkbnr/pppppppp/2n5/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -" : [78,[35, 27, null], "book"],
  "r1bqkbnr/pppppppp/2n5/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq -" : [64,[11, 27, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [54,[35, 27, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/3Pp3/2P5/8/PP2PPPP/RNBQKBNR b KQkq -" : [54,[5, 33, null], "book"],
  "r1bqkbnr/ppppnppp/8/3Pp3/2P5/8/PP2PPPP/RNBQKBNR w KQkq -" : [61,[57, 42, null], "book"],
  "r1bqkbnr/pppp1ppp/8/3Pp3/2Pn4/8/PP2PPPP/RNBQKBNR w KQkq -" : [84,[52, 44, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4P3/2P5/8/PP2PPPP/RNBQKBNR b KQkq -" : [5,[18, 28, null], "book"],
  "r1bqkbnr/pppp1ppp/8/4n3/2P5/8/PP2PPPP/RNBQKBNR w KQkq -" : [-7,[59, 50, null], "book"],
  "r1bqkbnr/pppp1ppp/8/4n3/2P5/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [6,[28, 34, null], "book"],
  "r1bqkbnr/pppp1ppp/8/8/2n5/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [8,[52, 36, null], "book"],
  "r1bqkbnr/pppppppp/2n5/3P4/8/8/PPP1PPPP/RNBQKBNR b KQkq -" : [75,[18, 1, null], "book"],
  "rnbqkbnr/pppppppp/8/3P4/8/8/PPP1PPPP/RNBQKBNR w KQkq -" : [77,[52, 36, null], "book"],
  "rnbqkbnr/pppppppp/8/3P4/4P3/8/PPP2PPP/RNBQKBNR b KQkq -" : [87,[12, 28, null], "book"],
  "rnbqkb1r/pppppppp/5n2/3P4/4P3/8/PPP2PPP/RNBQKBNR w KQkq -" : [159,[36, 28, null], "book"],
  "rnbqkb1r/pppppppp/5n2/3PP3/8/8/PPP2PPP/RNBQKBNR b KQkq -" : [151,[21, 6, null], "book"],
  "rnbqkbnr/pppppppp/8/3PP3/8/8/PPP2PPP/RNBQKBNR w KQkq -" : [160,[57, 42, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -" : [41,[50, 34, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/3P4/1P6/P1P1PPPP/RNBQKBNR b KQkq -" : [-31,[10, 26, null], "book"],
  "rnbqkb1r/pppppppp/5n2/6B1/3P4/8/PPP1PPPP/RN1QKBNR b KQkq -" : [19,[11, 27, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2p3B1/3P4/8/PPP1PPPP/RN1QKBNR w KQkq -" : [25,[30, 21, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2pP2B1/8/8/PPP1PPPP/RN1QKBNR b KQkq -" : [19,[11, 19, null], "book"],
  "rnb1kb1r/pp1ppppp/1q3n2/2pP2B1/8/8/PPP1PPPP/RN1QKBNR w KQkq -" : [65,[57, 42, null], "book"],
  "rnb1kb1r/pp1ppppp/1q3n2/2pP2B1/8/2N5/PPP1PPPP/R2QKBNR b KQkq -" : [62,[11, 19, null], "book"],
  "rnb1kb1r/pp1ppppp/5n2/2pP2B1/8/2N5/PqP1PPPP/R2QKBNR w KQkq -" : [75,[30, 51, null], "book"],
  "rnb1kb1r/pp1ppppp/5n2/2pP4/8/2N5/PqPBPPPP/R2QKBNR b KQkq -" : [47,[49, 17, null], "book"],
  "rnb1kb1r/pp1ppppp/1q3n2/2pP4/8/2N5/P1PBPPPP/R2QKBNR w KQkq -" : [67,[52, 36, null], "book"],
  "rnbqkb1r/pppppppp/8/6B1/3Pn3/8/PPP1PPPP/RN1QKBNR w KQkq -" : [15,[30, 39, null], "book"],
  "rnbqkb1r/pppppppp/8/8/3PnB2/8/PPP1PPPP/RN1QKBNR b KQkq -" : [12,[11, 27, null], "book"],
  "rnbqkb1r/pppppp1p/8/6p1/3PnB2/8/PPP1PPPP/RN1QKBNR w KQkq -" : [77,[37, 58, null], "book"],
  "rnbqkb1r/pppppppp/8/8/3Pn2B/8/PPP1PPPP/RN1QKBNR b KQkq -" : [10,[14, 30, null], "book"],
  "rnbqkb1r/pp1ppppp/2p5/8/3Pn2B/8/PPP1PPPP/RN1QKBNR w KQkq -" : [44,[57, 51, null], "book"],
  "rnbqkb1r/pp1ppppp/2p5/8/3Pn2B/8/PPPNPPPP/R2QKBNR b KQkq -" : [46,[36, 51, null], "book"],
  "rnb1kb1r/pp1ppppp/2p5/q7/3Pn2B/8/PPPNPPPP/R2QKBNR w KQkq -" : [32,[50, 42, null], "book"],
  "rnb1kb1r/pp1ppppp/2p5/q7/3Pn2B/2P5/PP1NPPPP/R2QKBNR b KQkq -" : [35,[36, 51, null], "book"],
  "rnb1kb1r/pp1ppppp/2p5/q7/3P3B/2P5/PP1nPPPP/R2QKBNR w KQkq -" : [36,[59, 51, null], "book"],
  "rnb1kb1r/pp1ppppp/2p5/q7/3P3B/2P5/PP1QPPPP/R3KBNR b KQkq -" : [26,[11, 27, null], "book"],
  "rnb1kb1r/pp2pppp/2p5/q2p4/3P3B/2P5/PP1QPPPP/R3KBNR w KQkq -" : [36,[51, 50, null], "book"],
  "rnb1kb1r/pp2pppp/2p5/q2p4/3PP2B/2P5/PP1Q1PPP/R3KBNR b KQkq -" : [2,[27, 36, null], "book"],
  "rnbqkb1r/ppp1pppp/8/3p4/3Pn2B/8/PPP1PPPP/RN1QKBNR w KQkq -" : [22,[53, 45, null], "book"],
  "rnbqkb1r/ppp1pppp/8/3p4/3Pn2B/5P2/PPP1P1PP/RN1QKBNR b KQkq -" : [24,[36, 21, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/3P3B/5P2/PPP1P1PP/RN1QKBNR w KQkq -" : [26,[57, 42, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/3P3B/2N2P2/PPP1P1PP/R2QKBNR b KQkq -" : [8,[10, 26, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/3p1b2/3P3B/2N2P2/PPP1P1PP/R2QKBNR w KQkq -" : [54,[59, 51, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/3p1b2/3PP2B/2N2P2/PPP3PP/R2QKBNR b KQkq -" : [30,[27, 36, null], "book"],
  "rnbqkb1r/pppppppp/8/6B1/3Pn2P/8/PPP1PPP1/RN1QKBNR b KQkq -" : [-5,[11, 27, null], "book"],
  "rnbqkb1r/pppppppp/8/6n1/3P3P/8/PPP1PPP1/RN1QKBNR w KQkq -" : [51,[39, 30, null], "book"],
  "rnbqkb1r/pppppppp/8/6P1/3P4/8/PPP1PPP1/RN1QKBNR b KQkq -" : [22,[10, 26, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4p1P1/3P4/8/PPP1PPP1/RN1QKBNR w KQkq -" : [77,[35, 28, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq -" : [27,[14, 22, null], "book"],
  "rnbqkb1r/p1pppppp/5n2/1p6/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [104,[34, 25, null], "book"],
  "rnbqkb1r/p1pppppp/1p3n2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [66,[53, 45, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2p5/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [79,[35, 27, null], "book"],
  "rnbqkb1r/p2ppppp/5n2/1ppP4/2P5/8/PP2PPPP/RNBQKBNR w KQkq -" : [69,[34, 25, null], "book"],
  "rnbqkb1r/p2ppppp/5n2/1ppP4/P1P5/8/1P2PPPP/RNBQKBNR b KQkq -" : [-12,[25, 33, null], "book"],
  "rnbqkb1r/p2ppppp/5n2/1ppP2B1/2P5/8/PP2PPPP/RN1QKBNR b KQkq -" : [-3,[21, 36, null], "book"],
  "rnbqkb1r/p2ppppp/5n2/1PpP4/8/8/PP2PPPP/RNBQKBNR b KQkq -" : [71,[8, 16, null], "book"],
  "rnbqkb1r/3ppppp/p4n2/1PpP4/8/8/PP2PPPP/RNBQKBNR w KQkq -" : [68,[52, 44, null], "book"],
  "rnbqkb1r/3ppppp/pP3n2/2pP4/8/8/PP2PPPP/RNBQKBNR b KQkq -" : [30,[3, 17, null], "book"],
  "rnbqkb1r/3ppppp/P4n2/2pP4/8/8/PP2PPPP/RNBQKBNR b KQkq -" : [54,[12, 20, null], "book"],
  "rn1qkb1r/3ppppp/b4n2/2pP4/8/8/PP2PPPP/RNBQKBNR w KQkq -" : [78,[57, 42, null], "book"],
  "rn1qkb1r/3ppppp/b4n2/2pP4/8/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [76,[14, 22, null], "book"],
  "rn1qkb1r/4pppp/b2p1n2/2pP4/8/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [73,[52, 36, null], "book"],
  "rn1qkb1r/4pppp/b2p1n2/2pP4/4P3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [76,[16, 61, null], "book"],
  "rn1qkb1r/4pppp/3p1n2/2pP4/4P3/2N5/PP3PPP/R1BQKbNR w KQkq -" : [76,[60, 61, null], "book"],
  "rn1qkb1r/4pppp/3p1n2/2pP4/4P3/2N5/PP3PPP/R1BQ1KNR b kq -" : [77,[14, 22, null], "book"],
  "rn1qkb1r/4pp1p/3p1np1/2pP4/4P3/2N5/PP3PPP/R1BQ1KNR w kq -" : [85,[54, 46, null], "book"],
  "rn1qkb1r/4pp1p/3p1np1/2pP4/4P3/2N3P1/PP3P1P/R1BQ1KNR b kq -" : [82,[5, 14, null], "book"],
  "rn1qk2r/4ppbp/3p1np1/2pP4/4P3/2N3P1/PP3P1P/R1BQ1KNR w kq -" : [74,[62, 45, null], "book"],
  "rn1qk2r/4ppbp/3p1np1/2pP4/4P3/2N3P1/PP3PKP/R1BQ2NR b kq -" : [92,[3, 17, null], "book"],
  "rn1q1rk1/4ppbp/3p1np1/2pP4/4P3/2N3P1/PP3PKP/R1BQ2NR w - -" : [91,[62, 45, null], "book"],
  "rn1qkb1r/4pppp/b2p1n2/2pP4/5P2/2N5/PP2P1PP/R1BQKBNR b KQkq -" : [45,[14, 22, null], "book"],
  "rn1qkb1r/3ppp1p/b4np1/2pP4/8/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [83,[52, 36, null], "book"],
  "rn1qkb1r/3ppp1p/b4np1/2pP4/8/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [49,[5, 14, null], "book"],
  "rn1qkb1r/4pp1p/b2p1np1/2pP4/8/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [70,[52, 36, null], "book"],
  "rn1qkb1r/4pp1p/b2p1np1/2pP4/8/2N2NP1/PP2PP1P/R1BQKB1R b KQkq -" : [57,[5, 14, null], "book"],
  "rn1qk2r/4ppbp/b2p1np1/2pP4/8/2N2NP1/PP2PP1P/R1BQKB1R w KQkq -" : [62,[61, 54, null], "book"],
  "rn1qk2r/4ppbp/b2p1np1/2pP4/8/2N2NP1/PP2PPBP/R1BQK2R b KQkq -" : [63,[4, 6, null], "book"],
  "rnbqkb1r/3ppppp/p4n2/1PpP4/8/4P3/PP3PPP/RNBQKBNR b KQkq -" : [83,[12, 20, null], "book"],
  "rnbqkb1r/3ppppp/p4n2/1PpP4/8/5P2/PP2P1PP/RNBQKBNR b KQkq -" : [16,[16, 25, null], "book"],
  "rnbqkb1r/3ppppp/p4n2/1PpP4/8/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [32,[16, 25, null], "book"],
  "rnbqkb1r/3ppppp/5n2/1ppP4/8/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [51,[42, 25, null], "book"],
  "rnbqkb1r/3ppppp/5n2/1ppP4/4P3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [-10,[25, 33, null], "book"],
  "rnbqkb1r/3ppppp/5n2/2pP4/1p2P3/2N5/PP3PPP/R1BQKBNR w KQkq -" : [-18,[42, 25, null], "book"],
  "rnbqkb1r/3ppppp/5n2/1NpP4/1p2P3/8/PP3PPP/R1BQKBNR b KQkq -" : [-21,[11, 19, null], "book"],
  "rnbqkb1r/4pppp/3p1n2/1NpP4/1p2P3/8/PP3PPP/R1BQKBNR w KQkq -" : [-13,[36, 28, null], "book"],
  "rnbqkb1r/4pppp/3p1n2/1NpP4/1p2P3/5N2/PP3PPP/R1BQKB1R b KQkq -" : [-16,[14, 22, null], "book"],
  "rnbqkb1r/4pp1p/3p1np1/1NpP4/1p2P3/5N2/PP3PPP/R1BQKB1R w KQkq -" : [-22,[36, 28, null], "book"],
  "rnbqkb1r/4pp1p/3p1np1/1NpP4/1pB1P3/5N2/PP3PPP/R1BQK2R b KQkq -" : [-30,[5, 14, null], "book"],
  "rnbqkb1r/p2ppppp/5n2/1ppP4/2P1P3/8/PP3PPP/RNBQKBNR b KQkq -" : [-22,[21, 36, null], "book"],
  "rnbqkb1r/p2ppppp/5n2/1ppP4/2P5/5P2/PP2P1PP/RNBQKBNR b KQkq -" : [7,[25, 34, null], "book"],
  "rnbqkb1r/p2ppppp/5n2/1ppP4/2P3P1/8/PP2PP1P/RNBQKBNR b KQkq -" : [-69,[21, 38, null], "book"],
  "rnbqkb1r/p2ppppp/5n2/1ppP4/2P5/8/PP1NPPPP/R1BQKBNR b KQkq -" : [37,[25, 34, null], "book"],
  "rnbqkb1r/p2ppppp/5n2/1ppP4/2P5/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [33,[25, 33, null], "book"],
  "rnbqkb1r/pp2pppp/3p1n2/2pP4/2P5/8/PP2PPPP/RNBQKBNR w KQkq -" : [70,[57, 42, null], "book"],
  "rnbqkb1r/pp2pppp/3p1n2/2pP4/2P5/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [91,[14, 22, null], "book"],
  "rnbqkb1r/pp2pp1p/3p1np1/2pP4/2P5/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [89,[52, 36, null], "book"],
  "rnbqkb1r/pp2pp1p/3p1np1/2pP4/2P1P3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [88,[5, 14, null], "book"],
  "rnbqkb1r/p3pp1p/3p1np1/1ppP4/2P1P3/2N5/PP3PPP/R1BQKBNR w KQkq -" : [106,[34, 25, null], "book"],
  "rnbqkb1r/pp1p1ppp/5n2/2pPp3/2P5/8/PP2PPPP/RNBQKBNR w KQkq e6" : [108,[57, 42, null], "book"],
  "rnbqkb1r/pp1p1ppp/5n2/2pPp3/2P5/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [113,[14, 22, null], "book"],
  "rnbqkb1r/pp3ppp/3p1n2/2pPp3/2P5/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [116,[52, 36, null], "book"],
  "rnbqkb1r/pp3ppp/3p1n2/2pPp3/2P1P3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [108,[14, 22, null], "book"],
  "rnbqk2r/pp2bppp/3p1n2/2pPp3/2P1P3/2N5/PP3PPP/R1BQKBNR w KQkq -" : [119,[55, 47, null], "book"],
  "rnbqkb1r/pp3p1p/3p1np1/2pPp3/2P1P3/2N5/PP3PPP/R1BQKBNR w KQkq -" : [115,[62, 45, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/2pP4/2P5/8/PP2PPPP/RNBQKBNR w KQkq -" : [91,[57, 42, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/2pP4/2P5/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [83,[11, 19, null], "book"],
  "rnbqkb1r/pp1p1ppp/5n2/2pp4/2P5/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [82,[34, 27, null], "book"],
  "rnbqkb1r/pp1p1ppp/5n2/2pP4/8/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [73,[11, 19, null], "book"],
  "rnbqk2r/pp1p1ppp/3b1n2/2pP4/8/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [106,[62, 45, null], "book"],
  "rnbqkb1r/pp3ppp/3p1n2/2pP4/8/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [94,[52, 36, null], "book"],
  "rnbqkb1r/pp3ppp/3p1n2/2pP4/4P3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [104,[14, 22, null], "book"],
  "rnbqkb1r/pp3p1p/3p1np1/2pP4/4P3/2N5/PP3PPP/R1BQKBNR w KQkq -" : [88,[55, 47, null], "book"],
  "rnbqkb1r/pp3p1p/3p1np1/2pP4/4PP2/2N5/PP4PP/R1BQKBNR b KQkq -" : [81,[5, 14, null], "book"],
  "rnbqk2r/pp3pbp/3p1np1/2pP4/4PP2/2N5/PP4PP/R1BQKBNR w KQkq -" : [73,[61, 25, null], "book"],
  "rnbqk2r/pp3pbp/3p1np1/1BpP4/4PP2/2N5/PP4PP/R1BQK1NR b KQkq -" : [76,[21, 11, null], "book"],
  "rnbqk2r/pp3pbp/3p1np1/2pPP3/5P2/2N5/PP4PP/R1BQKBNR b KQkq -" : [-2,[21, 11, null], "book"],
  "rnbqk2r/pp3pbp/3p1np1/2pP4/4PP2/2N2N2/PP4PP/R1BQKB1R b KQkq -" : [20,[4, 6, null], "book"],
  "rnbq1rk1/pp3pbp/3p1np1/2pP4/4PP2/2N2N2/PP4PP/R1BQKB1R w KQ -" : [39,[61, 52, null], "book"],
  "rnbq1rk1/pp3pbp/3p1np1/2pP4/4PP2/2N2N2/PP2B1PP/R1BQK2R b KQ -" : [33,[5, 4, null], "book"],
  "rnbqr1k1/pp3pbp/3p1np1/2pP4/4PP2/2N2N2/PP2B1PP/R1BQK2R w KQ -" : [37,[36, 28, null], "book"],
  "rnbqkb1r/pp3p1p/3p1np1/2pP4/4P3/2N2N2/PP3PPP/R1BQKB1R b KQkq -" : [75,[8, 16, null], "book"],
  "rnbqk2r/pp3pbp/3p1np1/2pP4/4P3/2N2N2/PP3PPP/R1BQKB1R w KQkq -" : [83,[45, 51, null], "book"],
  "rnbqk2r/pp3pbp/3p1np1/2pP4/4P3/2N2N2/PP2BPPP/R1BQK2R b KQkq -" : [59,[2, 38, null], "book"],
  "rnbq1rk1/pp3pbp/3p1np1/2pP4/4P3/2N2N2/PP2BPPP/R1BQK2R w KQ -" : [82,[45, 51, null], "book"],
  "rnbq1rk1/pp3pbp/3p1np1/2pP4/4P3/2N2N2/PP2BPPP/R1BQ1RK1 b - -" : [58,[2, 38, null], "book"],
  "rnbq1rk1/1p3pbp/p2p1np1/2pP4/4P3/2N2N2/PP2BPPP/R1BQ1RK1 w - -" : [59,[48, 32, null], "book"],
  "rnbq1rk1/1p3pbp/p2p1np1/2pP4/P3P3/2N2N2/1P2BPPP/R1BQ1RK1 b - -" : [67,[2, 38, null], "book"],
  "rn1q1rk1/1p3pbp/p2p1np1/2pP4/P3P1b1/2N2N2/1P2BPPP/R1BQ1RK1 w - -" : [64,[58, 37, null], "book"],
  "rnbqr1k1/pp3pbp/3p1np1/2pP4/4P3/2N2N2/PP2BPPP/R1BQ1RK1 w - -" : [83,[45, 51, null], "book"],
  "rnbqr1k1/pp3pbp/3p1np1/2pP4/4P3/2N5/PP1NBPPP/R1BQ1RK1 b - -" : [74,[1, 16, null], "book"],
  "r1bqr1k1/pp3pbp/n2p1np1/2pP4/4P3/2N5/PP1NBPPP/R1BQ1RK1 w - -" : [78,[53, 45, null], "book"],
  "r1bqr1k1/pp3pbp/n2p1np1/2pP4/4P3/2N2P2/PP1NB1PP/R1BQ1RK1 b - -" : [83,[16, 10, null], "book"],
  "rnbqk2r/pp3pbp/3p1np1/2pP2B1/4P3/2N2N2/PP3PPP/R2QKB1R b KQkq -" : [54,[8, 16, null], "book"],
  "rnbqkb1r/pp3ppp/3p1n2/2pP4/8/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [77,[14, 22, null], "book"],
  "rnbqkb1r/pp3p1p/3p1np1/2pP4/8/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [66,[55, 47, null], "book"],
  "rnbqkb1r/pp3p1p/3p1np1/2pP2B1/8/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [45,[15, 23, null], "book"],
  "rnbqkb1r/pp3p1p/3p1np1/2pP4/8/2N2NP1/PP2PP1P/R1BQKB1R b KQkq -" : [47,[5, 14, null], "book"],
  "rnbqk2r/pp3pbp/3p1np1/2pP4/8/2N2NP1/PP2PP1P/R1BQKB1R w KQkq -" : [44,[61, 54, null], "book"],
  "rnbqk2r/pp3pbp/3p1np1/2pP4/8/2N2NP1/PP2PPBP/R1BQK2R b KQkq -" : [25,[4, 6, null], "book"],
  "rnbq1rk1/pp3pbp/3p1np1/2pP4/8/2N2NP1/PP2PPBP/R1BQK2R w KQ -" : [52,[60, 62, null], "book"],
  "rnbq1rk1/pp3pbp/3p1np1/2pP4/8/2N2NP1/PP2PPBP/R1BQ1RK1 b - -" : [42,[5, 4, null], "book"],
  "rnbq1rk1/1p3pbp/p2p1np1/2pP4/8/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [40,[48, 32, null], "book"],
  "rnbq1rk1/1p3pbp/p2p1np1/2pP4/P7/2N2NP1/1P2PPBP/R1BQ1RK1 b - -" : [31,[5, 4, null], "book"],
  "r1bq1rk1/1p1n1pbp/p2p1np1/2pP4/P7/2N2NP1/1P2PPBP/R1BQ1RK1 w - -" : [48,[58, 37, null], "book"],
  "r1bq1rk1/1p1n1pbp/p2p1np1/2pP4/P7/2N3P1/1P1NPPBP/R1BQ1RK1 b - -" : [19,[5, 4, null], "book"],
  "r1bq1rk1/pp1n1pbp/3p1np1/2pP4/8/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [60,[58, 37, null], "book"],
  "rnbqkb1r/pp3p1p/3p1np1/2pP4/8/2N5/PP1NPPPP/R1BQKB1R b KQkq -" : [75,[5, 14, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2P5/2P5/8/PP2PPPP/RNBQKBNR b KQkq -" : [2,[12, 20, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/2P5/2P5/8/PP2PPPP/RNBQKBNR w KQkq -" : [4,[52, 44, null], "book"],
  "rnbqkb1r/ppp1pppp/3p1n2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [49,[62, 45, null], "book"],
  "rnbqkb1r/ppp1pppp/3p1n2/8/2PP2P1/8/PP2PP1P/RNBQKBNR b KQkq -" : [-131,[2, 38, null], "book"],
  "rnbqkb1r/ppp1pppp/3p1n2/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [58,[12, 28, null], "book"],
  "rn1qkb1r/ppp1pppp/3p1n2/5b2/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [70,[53, 45, null], "book"],
  "rn1qkb1r/ppp1pppp/3p1n2/5b2/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [32,[29, 36, null], "book"],
  "rnbqkb1r/ppp2ppp/3p1n2/4p3/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [58,[62, 45, null], "book"],
  "rnbqkb1r/ppp2ppp/3p1n2/4p3/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [52,[28, 35, null], "book"],
  "r1bqkb1r/pppn1ppp/3p1n2/4p3/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [73,[52, 36, null], "book"],
  "r1bqkb1r/pppn1ppp/3p1n2/4p3/2PPP3/2N2N2/PP3PPP/R1BQKB1R b KQkq -" : [81,[14, 22, null], "book"],
  "r1bqkb1r/pppnpppp/3p1n2/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [73,[52, 36, null], "book"],
  "r1bqkb1r/pppnpppp/3p1n2/8/2PP4/2N1P3/PP3PPP/R1BQKBNR b KQkq -" : [40,[14, 22, null], "book"],
  "r1bqkb1r/pppn1ppp/3p1n2/4p3/2PP4/2N1P3/PP3PPP/R1BQKBNR w KQkq -" : [27,[61, 52, null], "book"],
  "r1bqkb1r/pppn1ppp/3p1n2/4p3/2PP4/2NBP3/PP3PPP/R1BQK1NR b KQkq -" : [20,[14, 22, null], "book"],
  "rnbqkb1r/ppp1pppp/3p1n2/8/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [56,[14, 22, null], "book"],
  "rn1qkb1r/ppp1pppp/3p1n2/8/2PP2b1/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [70,[57, 42, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [73,[35, 28, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4P3/2P5/8/PP2PPPP/RNBQKBNR b KQkq -" : [53,[21, 38, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4P3/2P1n3/8/PP2PPPP/RNBQKBNR w KQkq -" : [114,[48, 40, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4P3/2P1n3/P7/1P2PPPP/RNBQKBNR b KQkq -" : [115,[11, 19, null], "book"],
  "rnbqkb1r/p1pp1ppp/1p6/4P3/2P1n3/P7/1P2PPPP/RNBQKBNR w KQkq -" : [139,[62, 45, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4P3/2P1n3/8/PPQ1PPPP/RNB1KBNR b KQkq -" : [92,[5, 33, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4P3/2P3n1/8/PP2PPPP/RNBQKBNR w KQkq -" : [71,[58, 37, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4P3/2P2Bn1/8/PP2PPPP/RN1QKBNR b KQkq -" : [75,[1, 18, null], "book"],
  "r1bqkb1r/pppp1ppp/2n5/4P3/2P2Bn1/8/PP2PPPP/RN1QKBNR w KQkq -" : [67,[62, 45, null], "book"],
  "r1bqkb1r/pppp1ppp/2n5/4P3/2P2Bn1/5N2/PP2PPPP/RN1QKB1R b KQkq -" : [50,[5, 33, null], "book"],
  "r1bqk2r/pppp1ppp/2n5/4P3/1bP2Bn1/5N2/PP2PPPP/RN1QKB1R w KQkq -" : [71,[57, 42, null], "book"],
  "r1bqk2r/pppp1ppp/2n5/4P3/1bP2Bn1/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [52,[33, 42, null], "book"],
  "r1bqk2r/pppp1ppp/2n5/4P3/2P2Bn1/2b2N2/PP2PPPP/R2QKB1R w KQkq -" : [66,[49, 42, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4P3/2P1P1n1/8/PP3PPP/RNBQKBNR b KQkq -" : [47,[38, 28, null], "book"],
  "rnbqkb1r/ppp2ppp/3p4/4P3/2P1P1n1/8/PP3PPP/RNBQKBNR w KQkq -" : [106,[61, 52, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4n3/2P1P3/8/PP3PPP/RNBQKBNR w KQkq -" : [51,[48, 40, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4n3/2P1PP2/8/PP4PP/RNBQKBNR b KQkq -" : [58,[28, 18, null], "book"],
  "rnbqk2r/pppp1ppp/8/2b1n3/2P1PP2/8/PP4PP/RNBQKBNR w KQkq -" : [279,[37, 28, null], "book"],
  "r1bqkb1r/pppp1ppp/2n5/4n3/2P1PP2/8/PP4PP/RNBQKBNR w KQkq -" : [191,[37, 28, null], "book"],
  "rnbqkb1r/pppp1ppp/2n5/8/2P1PP2/8/PP4PP/RNBQKBNR w KQkq -" : [59,[57, 42, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4P3/2P3n1/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [64,[1, 18, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [43,[54, 46, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/6B1/2PP4/8/PP2PPPP/RN1QKBNR b KQkq -" : [-3,[15, 23, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/6P1/PP2PP1P/RNBQKBNR b KQkq -" : [35,[11, 27, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/6P1/PP2PP1P/RNBQKBNR w KQkq -" : [31,[61, 54, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/6P1/PP2PPBP/RNBQK1NR b KQkq -" : [34,[5, 33, null], "book"],
  "rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/6P1/PP2PPBP/RNBQK1NR w KQkq -" : [27,[62, 45, null], "book"],
  "rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/5NP1/PP2PPBP/RNBQK2R b KQkq -" : [45,[4, 6, null], "book"],
  "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/5NP1/PP2PPBP/RNBQK2R w KQ -" : [39,[60, 62, null], "book"],
  "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/5NP1/PP2PPBP/RNBQ1RK1 b - -" : [33,[27, 34, null], "book"],
  "r1bq1rk1/pppnbppp/4pn2/3p4/2PP4/5NP1/PP2PPBP/RNBQ1RK1 w - -" : [49,[59, 50, null], "book"],
  "r1bq1rk1/pppnbppp/4pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 b - -" : [25,[27, 34, null], "book"],
  "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [42,[59, 43, null], "book"],
  "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2NQ1NP1/PP2PPBP/R1B2RK1 b - -" : [34,[9, 17, null], "book"],
  "r1bq1rk1/pppnbppp/4pn2/3p4/2PP4/5NP1/PPQ1PPBP/RNB2RK1 b - -" : [45,[15, 23, null], "book"],
  "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/5NP1/PPQ1PPBP/RNB2RK1 w - -" : [49,[61, 59, null], "book"],
  "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/5NP1/PPQNPPBP/R1B2RK1 b - -" : [51,[18, 26, null], "book"],
  "r1bq1rk1/p2nbppp/1pp1pn2/3p4/2PP4/5NP1/PPQNPPBP/R1B2RK1 w - -" : [52,[52, 36, null], "book"],
  "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/5NP1/PPQ1PPBP/RNBR2K1 b - -" : [47,[9, 17, null], "book"],
  "r1bq1rk1/p2nbppp/1pp1pn2/3p4/2PP4/5NP1/PPQ1PPBP/RNBR2K1 w - -" : [37,[57, 51, null], "book"],
  "r1bq1rk1/p2nbppp/1pp1pn2/3p4/P1PP4/5NP1/1PQ1PPBP/RNBR2K1 b - -" : [15,[2, 16, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/6P1/PP2PPBP/RNBQK1NR w KQkq -" : [44,[34, 27, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/5NP1/PP2PPBP/RNBQK2R b KQkq -" : [40,[26, 35, null], "book"],
  "r1bqkb1r/pp3ppp/2n1pn2/2pp4/2PP4/5NP1/PP2PPBP/RNBQK2R w KQkq -" : [44,[34, 27, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/8/2pP4/6P1/PP2PPBP/RNBQK1NR w KQkq -" : [40,[62, 45, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/8/2pP4/5NP1/PP2PPBP/RNBQK2R b KQkq -" : [42,[5, 33, null], "book"],
  "rnbqk2r/ppp1bppp/4pn2/8/2pP4/5NP1/PP2PPBP/RNBQK2R w KQkq -" : [48,[59, 32, null], "book"],
  "r1bqkb1r/ppp2ppp/2n1pn2/8/2pP4/5NP1/PP2PPBP/RNBQK2R w KQkq -" : [36,[59, 32, null], "book"],
  "r1bqkb1r/ppp2ppp/2n1pn2/8/Q1pP4/5NP1/PP2PPBP/RNB1K2R b KQkq -" : [57,[5, 33, null], "book"],
  "r1bqk2r/ppp2ppp/2n1pn2/8/QbpP4/5NP1/PP2PPBP/RNB1K2R w KQkq -" : [42,[58, 51, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/8/Q1pP4/6P1/PP2PPBP/RNB1K1NR b KQkq -" : [33,[1, 11, null], "book"],
  "r1bqkb1r/pppn1ppp/4pn2/8/Q1pP4/6P1/PP2PPBP/RNB1K1NR w KQkq -" : [47,[32, 34, null], "book"],
  "r1bqkb1r/pppn1ppp/4pn2/8/2QP4/6P1/PP2PPBP/RNB1K1NR b KQkq -" : [24,[20, 28, null], "book"],
  "r1bqkb1r/1ppn1ppp/p3pn2/8/2QP4/6P1/PP2PPBP/RNB1K1NR w KQkq -" : [37,[34, 50, null], "book"],
  "r1bqkb1r/1ppn1ppp/p3pn2/8/3P4/6P1/PPQ1PPBP/RNB1K1NR b KQkq -" : [23,[10, 26, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/2PP4/6P1/PP2PP1P/RNBQKBNR w KQkq -" : [100,[35, 28, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/8/2PP2P1/8/PP2PP1P/RNBQKBNR b KQkq -" : [-59,[21, 38, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [19,[5, 33, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [25,[59, 50, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/P1N5/1P2PPPP/R1BQKBNR b KQkq -" : [21,[33, 42, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/8/2PP4/P1b5/1P2PPPP/R1BQKBNR w KQkq -" : [1,[49, 42, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/8/2PP4/P1P5/4PPPP/R1BQKBNR b KQkq -" : [0,[4, 6, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/2p5/2PP4/P1P5/4PPPP/R1BQKBNR w KQkq -" : [15,[52, 44, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/2p5/2PP4/P1P1P3/5PPP/R1BQKBNR b KQkq -" : [28,[9, 17, null], "book"],
  "rnbqk2r/p2p1ppp/1p2pn2/2p5/2PP4/P1P1P3/5PPP/R1BQKBNR w KQkq -" : [26,[61, 43, null], "book"],
  "r1bqk2r/pp1p1ppp/2n1pn2/2p5/2PP4/P1P1P3/5PPP/R1BQKBNR w KQkq -" : [41,[61, 43, null], "book"],
  "r1bqk2r/pp1p1ppp/2n1pn2/2p5/2PP4/P1PBP3/5PPP/R1BQK1NR b KQkq -" : [31,[4, 6, null], "book"],
  "r1bq1rk1/pp1p1ppp/2n1pn2/2p5/2PP4/P1PBP3/5PPP/R1BQK1NR w KQ -" : [34,[62, 52, null], "book"],
  "r1bq1rk1/pp1p1ppp/2n1pn2/2p5/2PP4/P1PBP3/4NPPP/R1BQK2R b KQ -" : [0,[9, 17, null], "book"],
  "r1bq1rk1/p2p1ppp/1pn1pn2/2p5/2PP4/P1PBP3/4NPPP/R1BQK2R w KQ -" : [14,[60, 62, null], "book"],
  "r1bq1rk1/p2p1ppp/1pn1pn2/2p5/2PPP3/P1PB4/4NPPP/R1BQK2R b KQ -" : [23,[21, 4, null], "book"],
  "r1bqnrk1/p2p1ppp/1pn1p3/2p5/2PPP3/P1PB4/4NPPP/R1BQK2R w KQ -" : [8,[60, 62, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/2p5/2PP4/P1P2P2/4P1PP/R1BQKBNR b KQkq -" : [-8,[11, 27, null], "book"],
  "rnbqk2r/pp3ppp/4pn2/2pp4/2PP4/P1P2P2/4P1PP/R1BQKBNR w KQkq -" : [0,[52, 44, null], "book"],
  "rnbqk2r/pp3ppp/4pn2/2pP4/3P4/P1P2P2/4P1PP/R1BQKBNR b KQkq -" : [28,[20, 27, null], "book"],
  "rnbqk2r/pp3ppp/4p3/2pn4/3P4/P1P2P2/4P1PP/R1BQKBNR w KQkq -" : [44,[35, 26, null], "book"],
  "rnbqk2r/pp3ppp/4p3/2Pn4/8/P1P2P2/4P1PP/R1BQKBNR b KQkq -" : [43,[13, 29, null], "book"],
  "rnbqk2r/pp4pp/4p3/2Pn1p2/8/P1P2P2/4P1PP/R1BQKBNR w KQkq -" : [52,[62, 47, null], "book"],
  "rnbqk2r/pp3ppp/4pn2/2pp4/2PP4/P1P1PP2/6PP/R1BQKBNR b KQkq -" : [4,[1, 18, null], "book"],
  "rnbq1rk1/pp3ppp/4pn2/2pp4/2PP4/P1P1PP2/6PP/R1BQKBNR w KQ -" : [0,[34, 27, null], "book"],
  "rnbq1rk1/pp3ppp/4pn2/2pP4/3P4/P1P1PP2/6PP/R1BQKBNR b KQ -" : [-26,[21, 27, null], "book"],
  "rnbq1rk1/pp3ppp/4p3/2pn4/3P4/P1P1PP2/6PP/R1BQKBNR w KQ -" : [-13,[59, 50, null], "book"],
  "rnbq1rk1/pppp1ppp/4pn2/8/2PP4/P1P5/4PPPP/R1BQKBNR w KQ -" : [18,[52, 44, null], "book"],
  "rnbq1rk1/pppp1ppp/4pn2/8/2PP4/P1P1P3/5PPP/R1BQKBNR b KQ -" : [15,[5, 4, null], "book"],
  "rnbq1rk1/pp1p1ppp/4pn2/2p5/2PP4/P1P1P3/5PPP/R1BQKBNR w KQ -" : [25,[61, 43, null], "book"],
  "rnbq1rk1/pp1p1ppp/4pn2/2p5/2PP4/P1PBP3/5PPP/R1BQK1NR b KQ -" : [23,[1, 18, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/6B1/1bPP4/2N5/PP2PPPP/R2QKBNR b KQkq -" : [-1,[10, 26, null], "book"],
  "rnbqk2r/pppp1pp1/4pn1p/6B1/1bPP4/2N5/PP2PPPP/R2QKBNR w KQkq -" : [16,[30, 39, null], "book"],
  "rnbqk2r/pppp1pp1/4pn1p/8/1bPP3B/2N5/PP2PPPP/R2QKBNR b KQkq -" : [14,[10, 26, null], "book"],
  "rnbqk2r/pp1p1pp1/4pn1p/2p5/1bPP3B/2N5/PP2PPPP/R2QKBNR w KQkq -" : [22,[52, 44, null], "book"],
  "rnbqk2r/pp1p1pp1/4pn1p/2pP4/1bP4B/2N5/PP2PPPP/R2QKBNR b KQkq -" : [-30,[11, 19, null], "book"],
  "rnbqk2r/p2p1pp1/4pn1p/1ppP4/1bP4B/2N5/PP2PPPP/R2QKBNR w KQkq -" : [21,[52, 44, null], "book"],
  "rnbqk2r/pp3pp1/3ppn1p/2pP4/1bP4B/2N5/PP2PPPP/R2QKBNR w KQkq -" : [-32,[52, 44, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N1P3/PP3PPP/R1BQKBNR b KQkq -" : [22,[4, 6, null], "book"],
  "rnbqk2r/p1pp1ppp/1p2pn2/8/1bPP4/2N1P3/PP3PPP/R1BQKBNR w KQkq -" : [42,[62, 52, null], "book"],
  "rnbqk2r/p1pp1ppp/1p2pn2/8/1bPP4/2N1P3/PP2NPPP/R1BQKB1R b KQkq -" : [36,[4, 6, null], "book"],
  "rn1qk2r/p1pp1ppp/bp2pn2/8/1bPP4/2N1P3/PP2NPPP/R1BQKB1R w KQkq -" : [33,[48, 40, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/2p5/1bPP4/2N1P3/PP3PPP/R1BQKBNR w KQkq -" : [19,[61, 43, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/2p5/1bPP4/2NBP3/PP3PPP/R1BQK1NR b KQkq -" : [28,[11, 27, null], "book"],
  "r1bqk2r/pp1p1ppp/2n1pn2/2p5/1bPP4/2NBP3/PP3PPP/R1BQK1NR w KQkq -" : [31,[62, 52, null], "book"],
  "r1bqk2r/pp1p1ppp/2n1pn2/2p5/1bPP4/2NBPN2/PP3PPP/R1BQK2R b KQkq -" : [36,[4, 6, null], "book"],
  "r1bqk2r/pp1p1ppp/2n1pn2/2p5/2PP4/2bBPN2/PP3PPP/R1BQK2R w KQkq -" : [39,[49, 42, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/2p5/1bPP4/2N1P3/PP2NPPP/R1BQKB1R b KQkq -" : [19,[11, 27, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/8/1bPp4/2N1P3/PP2NPPP/R1BQKB1R w KQkq -" : [34,[44, 35, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/8/1bPP4/2N5/PP2NPPP/R1BQKB1R b KQkq -" : [32,[4, 6, null], "book"],
  "rnbq1rk1/pp1p1ppp/4pn2/8/1bPP4/2N5/PP2NPPP/R1BQKB1R w KQ -" : [40,[48, 40, null], "book"],
  "rnbq1rk1/pp1p1ppp/4pn2/2P5/1b1P4/2N5/PP2NPPP/R1BQKB1R b KQ -" : [-17,[11, 19, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/2p5/1bPP4/2N1PN2/PP3PPP/R1BQKB1R b KQkq -" : [15,[4, 6, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/8/1bPp4/2N1PN2/PP3PPP/R1BQKB1R w KQkq -" : [27,[44, 35, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/8/1bPP4/2N2N2/PP3PPP/R1BQKB1R b KQkq -" : [24,[11, 27, null], "book"],
  "rnbqk2r/pp3ppp/4pn2/3p4/1bPP4/2N2N2/PP3PPP/R1BQKB1R w KQkq -" : [36,[34, 27, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N1P3/PP3PPP/R1BQKBNR w KQkq -" : [21,[58, 51, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/P1N1P3/1P3PPP/R1BQKBNR b KQkq -" : [23,[33, 42, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/3p4/2PP4/P1b1P3/1P3PPP/R1BQKBNR w KQkq -" : [20,[49, 42, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/3p4/2PP4/P1P1P3/5PPP/R1BQKBNR b KQkq -" : [21,[4, 6, null], "book"],
  "rnbqk2r/pp3ppp/4pn2/2pp4/2PP4/P1P1P3/5PPP/R1BQKBNR w KQkq -" : [23,[34, 27, null], "book"],
  "rnbqk2r/pp3ppp/4pn2/2pP4/3P4/P1P1P3/5PPP/R1BQKBNR b KQkq -" : [39,[20, 27, null], "book"],
  "rnbqk2r/pp3ppp/5n2/2pp4/3P4/P1P1P3/5PPP/R1BQKBNR w KQkq -" : [36,[61, 43, null], "book"],
  "rnbqk2r/pp3ppp/5n2/2pp4/3P4/P1PBP3/5PPP/R1BQK1NR b KQkq -" : [42,[4, 6, null], "book"],
  "rnbq1rk1/pp3ppp/5n2/2pp4/3P4/P1PBP3/5PPP/R1BQK1NR w KQ -" : [32,[62, 52, null], "book"],
  "rnbq1rk1/pp3ppp/5n2/2pp4/3P4/P1PBP3/4NPPP/R1BQK2R b KQ -" : [19,[9, 17, null], "book"],
  "rnbq1rk1/p4ppp/1p3n2/2pp4/3P4/P1PBP3/4NPPP/R1BQK2R w KQ -" : [41,[60, 62, null], "book"],
  "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N1P3/PP3PPP/R1BQKBNR w KQkq -" : [50,[58, 51, null], "book"],
  "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N1PN2/PP3PPP/R1BQKB1R b KQkq -" : [10,[33, 42, null], "book"],
  "r1bq1rk1/pppp1ppp/2n1pn2/8/1bPP4/2N1PN2/PP3PPP/R1BQKB1R w KQ -" : [40,[59, 50, null], "book"],
  "r1bq1rk1/pppp1ppp/2n1pn2/8/1bPP4/2NBPN2/PP3PPP/R1BQK2R b KQ -" : [20,[33, 42, null], "book"],
  "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ -" : [53,[60, 62, null], "book"],
  "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQ1RK1 b - -" : [51,[27, 34, null], "book"],
  "r1bq1rk1/ppp2ppp/2n1pn2/8/1bpP4/2NBPN2/PP3PPP/R1BQ1RK1 w - -" : [39,[43, 34, null], "book"],
  "rnbq1rk1/pppp1ppp/4pn2/8/1bPP4/2N1P3/PP3PPP/R1BQKBNR w KQ -" : [11,[61, 43, null], "book"],
  "rnbq1rk1/pppp1ppp/4pn2/8/1bPP4/2NBP3/PP3PPP/R1BQK1NR b KQ -" : [6,[11, 27, null], "book"],
  "rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/2NBP3/PP3PPP/R1BQK1NR w KQ -" : [14,[34, 27, null], "book"],
  "rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/P1NBP3/1P3PPP/R1BQK1NR b KQ -" : [-3,[27, 34, null], "book"],
  "rnbq1rk1/ppp2ppp/4pn2/3p4/2PP4/P1bBP3/1P3PPP/R1BQK1NR w KQ -" : [4,[49, 42, null], "book"],
  "rnbq1rk1/ppp2ppp/4pn2/3p4/2PP4/P1PBP3/5PPP/R1BQK1NR b KQ -" : [13,[27, 34, null], "book"],
  "rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R b KQ -" : [16,[10, 26, null], "book"],
  "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ -" : [19,[60, 62, null], "book"],
  "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQ1RK1 b - -" : [24,[27, 34, null], "book"],
  "rnbq1rk1/pp3ppp/4pn2/2p5/1bpP4/2NBPN2/PP3PPP/R1BQ1RK1 w - -" : [21,[43, 34, null], "book"],
  "rnbq1rk1/pp3ppp/4pn2/2p5/1bBP4/2N1PN2/PP3PPP/R1BQ1RK1 b - -" : [22,[1, 18, null], "book"],
  "rnbq1rk1/p4ppp/1p2pn2/2p5/1bBP4/2N1PN2/PP3PPP/R1BQ1RK1 w - -" : [30,[59, 52, null], "book"],
  "rnbq1rk1/p4ppp/1p2pn2/2p5/1bBP4/2N1PN2/PP2QPPP/R1B2RK1 b - -" : [27,[26, 35, null], "book"],
  "rn1q1rk1/pb3ppp/1p2pn2/2p5/1bBP4/2N1PN2/PP2QPPP/R1B2RK1 w - -" : [27,[35, 26, null], "book"],
  "rn1q1rk1/pb3ppp/1p2pn2/2p5/1bBP4/2N1PN2/PP2QPPP/R1BR2K1 b - -" : [21,[3, 12, null], "book"],
  "rnq2rk1/pb3ppp/1p2pn2/2p5/1bBP4/2N1PN2/PP2QPPP/R1BR2K1 w - -" : [6,[58, 51, null], "book"],
  "rn1q1rk1/pp1b1ppp/4pn2/2p5/1bBP4/2N1PN2/PP3PPP/R1BQ1RK1 w - -" : [30,[48, 40, null], "book"],
  "r1bq1rk1/pp1n1ppp/4pn2/2p5/1bBP4/2N1PN2/PP3PPP/R1BQ1RK1 w - -" : [44,[59, 52, null], "book"],
  "r1bq1rk1/pp1n1ppp/4pn2/2p5/1bBP4/4PN2/PP2NPPP/R1BQ1RK1 b - -" : [-12,[26, 35, null], "book"],
  "rnb2rk1/pp2qppp/4pn2/2p5/1bBP4/2N1PN2/PP3PPP/R1BQ1RK1 w - -" : [40,[48, 40, null], "book"],
  "rnbq1rk1/pppp1ppp/4pn2/8/1bPP4/2N1P3/PP2NPPP/R1BQKB1R b KQ -" : [0,[11, 27, null], "book"],
  "rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/2N1P3/PP2NPPP/R1BQKB1R w KQ -" : [12,[48, 40, null], "book"],
  "rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/P1N1P3/1P2NPPP/R1BQKB1R b KQ -" : [0,[33, 12, null], "book"],
  "rnbq1rk1/ppp2ppp/3bpn2/3p4/2PP4/P1N1P3/1P2NPPP/R1BQKB1R w KQ -" : [20,[52, 46, null], "book"],
  "rnbq1rk1/pppp1ppp/4pn2/8/1bPP4/2N1PN2/PP3PPP/R1BQKB1R b KQ -" : [4,[10, 26, null], "book"],
  "rnbq1rk1/pp1p1ppp/4pn2/2p5/1bPP4/2N1PN2/PP3PPP/R1BQKB1R w KQ -" : [21,[61, 43, null], "book"],
  "rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/2N1PN2/PP3PPP/R1BQKB1R w KQ -" : [15,[58, 51, null], "book"],
  "rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/P1N1PN2/1P3PPP/R1BQKB1R b KQ -" : [8,[33, 42, null], "book"],
  "rnbq1rk1/p1p2ppp/1p2pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ -" : [12,[34, 27, null], "book"],
  "rnbq1rk1/p4ppp/1p2pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQ1RK1 w - -" : [26,[34, 27, null], "book"],
  "r1bq1rk1/pp3ppp/2n1pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQ1RK1 w - -" : [31,[34, 27, null], "book"],
  "r1bq1rk1/pp3ppp/2n1pn2/2pp4/1bPP4/P1NBPN2/1P3PPP/R1BQ1RK1 b - -" : [16,[33, 42, null], "book"],
  "r1bq1rk1/pp3ppp/2n1pn2/2pp4/2PP4/P1bBPN2/1P3PPP/R1BQ1RK1 w - -" : [7,[49, 42, null], "book"],
  "r1bq1rk1/pp3ppp/2n1pn2/2pp4/2PP4/P1PBPN2/5PPP/R1BQ1RK1 b - -" : [18,[18, 24, null], "book"],
  "r1bq1rk1/pp3ppp/2n1pn2/2p5/2pP4/P1PBPN2/5PPP/R1BQ1RK1 w - -" : [9,[43, 34, null], "book"],
  "r1bq1rk1/pp3ppp/2n1pn2/2p5/2BP4/P1P1PN2/5PPP/R1BQ1RK1 b - -" : [11,[3, 10, null], "book"],
  "r1bq1rk1/pp3ppp/2n1pn2/2p5/1bpP4/P1NBPN2/1P3PPP/R1BQ1RK1 w - -" : [50,[40, 33, null], "book"],
  "r1bq1rk1/pp3ppp/2n1pn2/2p5/1bBP4/P1N1PN2/1P3PPP/R1BQ1RK1 b - -" : [17,[33, 42, null], "book"],
  "r1bq1rk1/pp3ppp/2n1pn2/8/1bBp4/P1N1PN2/1P3PPP/R1BQ1RK1 w - -" : [47,[40, 33, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N2P2/PP2P1PP/R1BQKBNR b KQkq -" : [-4,[11, 27, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N3P1/PP2PP1P/R1BQKBNR b KQkq -" : [0,[33, 42, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [28,[9, 17, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/2p5/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [46,[54, 46, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/2pP4/1bP5/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [-13,[4, 6, null], "book"],
  "rnbqk2r/p2p1ppp/4pn2/1ppP4/1bP5/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [56,[27, 20, null], "book"],
  "rnbqk2r/pp1p1ppp/4p3/2pP4/1bP1n3/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [22,[59, 43, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/2p5/1bPP4/2N2NP1/PP2PP1P/R1BQKB1R b KQkq -" : [24,[26, 35, null], "book"],
  "rnbq1rk1/pp1p1ppp/4pn2/2p5/1bPP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ -" : [30,[61, 54, null], "book"],
  "rnbq1rk1/pp1p1ppp/4pn2/2p5/1bPP4/2N2NP1/PP2PPBP/R1BQK2R b KQ -" : [15,[26, 35, null], "book"],
  "rnbq1rk1/pp1p1ppp/4pn2/8/1bPp4/2N2NP1/PP2PPBP/R1BQK2R w KQ -" : [27,[45, 35, null], "book"],
  "rnbq1rk1/pp1p1ppp/4pn2/8/1bPN4/2N3P1/PP2PPBP/R1BQK2R b KQ -" : [27,[11, 27, null], "book"],
  "rnbq1rk1/pp3ppp/4pn2/3p4/1bPN4/2N3P1/PP2PPBP/R1BQK2R w KQ -" : [22,[34, 27, null], "book"],
  "rnbq1rk1/pp3ppp/4pn2/3P4/1b1N4/2N3P1/PP2PPBP/R1BQK2R b KQ -" : [35,[21, 27, null], "book"],
  "rnbq1rk1/pp3ppp/4p3/3n4/1b1N4/2N3P1/PP2PPBP/R1BQK2R w KQ -" : [19,[58, 51, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/1QN5/PP2PPPP/R1B1KBNR b KQkq -" : [6,[10, 26, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/2p5/1bPP4/1QN5/PP2PPPP/R1B1KBNR w KQkq -" : [0,[62, 45, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/2P5/1bP5/1QN5/PP2PPPP/R1B1KBNR b KQkq -" : [20,[1, 18, null], "book"],
  "r1bqk2r/pp1p1ppp/2n1pn2/2P5/1bP5/1QN5/PP2PPPP/R1B1KBNR w KQkq -" : [18,[62, 45, null], "book"],
  "r1bqk2r/pp1p1ppp/2n1pn2/2P5/1bP5/1QN2N2/PP2PPPP/R1B1KB1R b KQkq -" : [19,[4, 6, null], "book"],
  "r1bqk2r/pp1p1ppp/2n1p3/2P5/1bP1n3/1QN2N2/PP2PPPP/R1B1KB1R w KQkq -" : [26,[58, 51, null], "book"],
  "r1bqk2r/pp1p1ppp/2n1p3/2P5/1bP1n3/1QN2N2/PP1BPPPP/R3KB1R b KQkq -" : [12,[36, 51, null], "book"],
  "r1bqk2r/pp1p1ppp/2n1p3/2n5/1bP5/1QN2N2/PP1BPPPP/R3KB1R w KQkq -" : [56,[41, 50, null], "book"],
  "r1bqk2r/pp1p1ppp/2n1p3/2n5/1bP5/2N2N2/PPQBPPPP/R3KB1R b KQkq -" : [50,[4, 6, null], "book"],
  "r1bqk2r/pp1p2pp/2n1p3/2n2p2/1bP5/2N2N2/PPQBPPPP/R3KB1R w KQkq -" : [71,[48, 40, null], "book"],
  "r1bqk2r/pp1p2pp/2n1p3/2n2p2/1bP5/2N2NP1/PPQBPP1P/R3KB1R b KQkq -" : [70,[4, 6, null], "book"],
  "r1bqk2r/pp1p1ppp/2n1p3/2P5/1bP5/1QN2N2/PP1nPPPP/R3KB1R w KQkq -" : [21,[45, 51, null], "book"],
  "r1bqk2r/pp1p1ppp/2n1p3/2P5/1bP5/1QN5/PP1NPPPP/R3KB1R b KQkq -" : [20,[33, 26, null], "book"],
  "r1bq1rk1/pp1p1ppp/2n1p3/2P5/1bP5/1QN5/PP1NPPPP/R3KB1R w KQ -" : [6,[54, 46, null], "book"],
  "r1bq1rk1/pp1p1ppp/2n1p3/2P5/1bP5/1QN5/PP1NPPPP/2KR1B1R b - -" : [-73,[33, 26, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PPQ1PPPP/R1B1KBNR b KQkq -" : [19,[11, 27, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/2p5/1bPP4/2N5/PPQ1PPPP/R1B1KBNR w KQkq -" : [54,[35, 26, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/2P5/1bP5/2N5/PPQ1PPPP/R1B1KBNR b KQkq -" : [41,[33, 26, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/2P5/2P5/2b5/PPQ1PPPP/R1B1KBNR w KQkq -" : [84,[50, 42, null], "book"],
  "rnbq1rk1/pp1p1ppp/4pn2/2P5/1bP5/2N5/PPQ1PPPP/R1B1KBNR w KQ -" : [44,[48, 40, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N5/PPQ1PPPP/R1B1KBNR w KQkq -" : [20,[34, 27, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/P1N5/1PQ1PPPP/R1B1KBNR b KQkq -" : [7,[33, 42, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/3p4/2PP4/P1b5/1PQ1PPPP/R1B1KBNR w KQkq -" : [13,[50, 42, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/3p4/2PP4/P1Q5/1P2PPPP/R1B1KBNR b KQkq -" : [7,[4, 6, null], "book"],
  "r1bqk2r/ppp2ppp/2n1pn2/3p4/2PP4/P1Q5/1P2PPPP/R1B1KBNR w KQkq -" : [54,[62, 45, null], "book"],
  "rnbqk2r/ppp2ppp/4p3/3p4/2PPn3/P1Q5/1P2PPPP/R1B1KBNR w KQkq -" : [47,[42, 50, null], "book"],
  "rnbqk2r/ppp2ppp/4p3/3p4/2PPn3/P7/1PQ1PPPP/R1B1KBNR b KQkq -" : [43,[10, 26, null], "book"],
  "r1bqk2r/ppp2ppp/2n1p3/3p4/2PPn3/P7/1PQ1PPPP/R1B1KBNR w KQkq -" : [80,[52, 44, null], "book"],
  "r1bqk2r/ppp2ppp/2n1p3/3p4/2PPn3/P3P3/1PQ2PPP/R1B1KBNR b KQkq -" : [42,[20, 28, null], "book"],
  "r1bqk2r/ppp2ppp/2n5/3pp3/2PPn3/P3P3/1PQ2PPP/R1B1KBNR w KQkq -" : [69,[53, 45, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/3P4/1b1P4/2N5/PPQ1PPPP/R1B1KBNR b KQkq -" : [15,[20, 27, null], "book"],
  "rnbqk2r/ppp2ppp/5n2/3p4/1b1P4/2N5/PPQ1PPPP/R1B1KBNR w KQkq -" : [17,[58, 37, null], "book"],
  "rnbqk2r/ppp2ppp/5n2/3p4/1b1P4/2N2N2/PPQ1PPPP/R1B1KB1R b KQkq -" : [-9,[10, 26, null], "book"],
  "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N5/PPQ1PPPP/R1B1KBNR w KQkq -" : [41,[52, 44, null], "book"],
  "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PPQ1PPPP/R1B1KB1R b KQkq -" : [48,[33, 42, null], "book"],
  "r1bqk2r/ppp2ppp/2nppn2/8/1bPP4/2N2N2/PPQ1PPPP/R1B1KB1R w KQkq -" : [62,[58, 51, null], "book"],
  "r1bqk2r/ppp2ppp/2nppn2/8/1bPP4/P1N2N2/1PQ1PPPP/R1B1KB1R b KQkq -" : [28,[33, 42, null], "book"],
  "rnbq1rk1/pppp1ppp/4pn2/8/1bPP4/2N5/PPQ1PPPP/R1B1KBNR w KQ -" : [24,[52, 36, null], "book"],
  "rnbq1rk1/pppp1ppp/4pn2/8/1bPP4/P1N5/1PQ1PPPP/R1B1KBNR b KQ -" : [20,[33, 42, null], "book"],
  "rnbq1rk1/pppp1ppp/4pn2/8/2PP4/P1b5/1PQ1PPPP/R1B1KBNR w KQ -" : [5,[50, 42, null], "book"],
  "rnbq1rk1/pppp1ppp/4pn2/8/2PP4/P1Q5/1P2PPPP/R1B1KBNR b KQ -" : [11,[9, 17, null], "book"],
  "rnbq1rk1/p1pp1ppp/4pn2/1p6/2PP4/P1Q5/1P2PPPP/R1B1KBNR w KQ -" : [39,[34, 25, null], "book"],
  "rnbq1rk1/p1pp1ppp/1p2pn2/8/2PP4/P1Q5/1P2PPPP/R1B1KBNR w KQ -" : [9,[58, 30, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [42,[11, 27, null], "book"],
  "rnbqkb1r/1ppp1ppp/p3pn2/8/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [39,[57, 42, null], "book"],
  "rnbqkb1r/p1pp1ppp/1p2pn2/8/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [43,[54, 46, null], "book"],
  "rnbqkb1r/p1pp1ppp/1p2pn2/8/2PP4/P4N2/1P2PPPP/RNBQKB1R b KQkq -" : [22,[2, 9, null], "book"],
  "rn1qkb1r/p1pp1ppp/bp2pn2/8/2PP4/P4N2/1P2PPPP/RNBQKB1R w KQkq -" : [49,[59, 50, null], "book"],
  "rn1qkb1r/p1pp1ppp/bp2pn2/8/2PP4/P4N2/1PQ1PPPP/RNB1KB1R b KQkq -" : [44,[16, 9, null], "book"],
  "rn1qkb1r/pbpp1ppp/1p2pn2/8/2PP4/P4N2/1PQ1PPPP/RNB1KB1R w KQkq -" : [54,[57, 42, null], "book"],
  "rn1qkb1r/pbpp1ppp/1p2pn2/8/2PP4/P4N2/1P2PPPP/RNBQKB1R w KQkq -" : [33,[58, 37, null], "book"],
  "rn1qkb1r/pbpp1ppp/1p2pn2/8/2PP4/P1N2N2/1P2PPPP/R1BQKB1R b KQkq -" : [16,[11, 27, null], "book"],
  "rn1qkb1r/pbp2ppp/1p2pn2/3p4/2PP4/P1N2N2/1P2PPPP/R1BQKB1R w KQkq -" : [25,[59, 50, null], "book"],
  "rn1qkb1r/pbp2ppp/1p2pn2/3P4/3P4/P1N2N2/1P2PPPP/R1BQKB1R b KQkq -" : [11,[21, 27, null], "book"],
  "rn1qkb1r/pbp2ppp/1p2p3/3n4/3P4/P1N2N2/1P2PPPP/R1BQKB1R w KQkq -" : [17,[58, 51, null], "book"],
  "rn1qkb1r/pbp2ppp/1p2p3/3n4/3P4/P1N2N2/1PQ1PPPP/R1B1KB1R b KQkq -" : [0,[27, 42, null], "book"],
  "rn1qkb1r/pb3ppp/1p2p3/2pn4/3P4/P1N2N2/1PQ1PPPP/R1B1KB1R w KQkq -" : [22,[35, 26, null], "book"],
  "rn1qkb1r/pb3ppp/1p2p3/2pn4/3PP3/P1N2N2/1PQ2PPP/R1B1KB1R b KQkq -" : [19,[27, 42, null], "book"],
  "rn1qkb1r/pb3ppp/1p2p3/2p5/3PP3/P1n2N2/1PQ2PPP/R1B1KB1R w KQkq -" : [9,[49, 42, null], "book"],
  "rn1qkb1r/pb3ppp/1p2p3/2p5/3PP3/P1P2N2/2Q2PPP/R1B1KB1R b KQkq -" : [21,[8, 16, null], "book"],
  "r2qkb1r/pb3ppp/1pn1p3/2p5/3PP3/P1P2N2/2Q2PPP/R1B1KB1R w KQkq -" : [69,[58, 49, null], "book"],
  "r2qkb1r/pb3ppp/1pn1p3/2p5/3PP3/P1P2N2/1BQ2PPP/R3KB1R b KQkq -" : [45,[0, 2, null], "book"],
  "r2qkb1r/pb3ppp/1pn1p3/8/3pP3/P1P2N2/1BQ2PPP/R3KB1R w KQkq -" : [78,[42, 35, null], "book"],
  "r2qkb1r/pb3ppp/1pn1p3/8/3PP3/P4N2/1BQ2PPP/R3KB1R b KQkq -" : [37,[0, 2, null], "book"],
  "2rqkb1r/pb3ppp/1pn1p3/8/3PP3/P4N2/1BQ2PPP/R3KB1R w KQk -" : [45,[56, 59, null], "book"],
  "2rqkb1r/pb3ppp/1pn1p3/8/3PP3/P4N2/1BQ2PPP/3RKB1R b Kk -" : [17,[5, 19, null], "book"],
  "2rqk2r/pb3ppp/1pnbp3/8/3PP3/P4N2/1BQ2PPP/3RKB1R w Kk -" : [32,[35, 27, null], "book"],
  "rnbqkb1r/p1pp1ppp/1p2pn2/8/2PP1B2/5N2/PP2PPPP/RN1QKB1R b KQkq -" : [16,[5, 33, null], "book"],
  "rnbqkb1r/p1pp1ppp/1p2pn2/8/2PP4/4PN2/PP3PPP/RNBQKB1R b KQkq -" : [11,[11, 27, null], "book"],
  "rn1qkb1r/pbpp1ppp/1p2pn2/8/2PP4/4PN2/PP3PPP/RNBQKB1R w KQkq -" : [16,[57, 42, null], "book"],
  "rn1qkb1r/pbpp1ppp/1p2pn2/8/2PP4/3BPN2/PP3PPP/RNBQK2R b KQkq -" : [7,[11, 27, null], "book"],
  "rn1qkb1r/pb1p1ppp/1p2pn2/2p5/2PP4/3BPN2/PP3PPP/RNBQK2R w KQkq -" : [20,[60, 62, null], "book"],
  "rn1qkb1r/pb1p1ppp/1p2pn2/2p5/2PP4/3BPN2/PP3PPP/RNBQ1RK1 b kq -" : [38,[5, 12, null], "book"],
  "rn1qk2r/pb1pbppp/1p2pn2/2p5/2PP4/3BPN2/PP3PPP/RNBQ1RK1 w kq -" : [33,[57, 42, null], "book"],
  "rn1qk2r/pb1pbppp/1p2pn2/2p5/2PP4/1P1BPN2/P4PPP/RNBQ1RK1 b kq -" : [8,[26, 35, null], "book"],
  "rn1q1rk1/pb1pbppp/1p2pn2/2p5/2PP4/1P1BPN2/P4PPP/RNBQ1RK1 w - -" : [35,[35, 26, null], "book"],
  "rn1q1rk1/pb1pbppp/1p2pn2/2p5/2PP4/1P1BPN2/PB3PPP/RN1Q1RK1 b - -" : [18,[26, 35, null], "book"],
  "rn1q1rk1/pb1pbppp/1p2pn2/8/2Pp4/1P1BPN2/PB3PPP/RN1Q1RK1 w - -" : [11,[44, 35, null], "book"],
  "rn1q1rk1/pb1pbppp/1p2pn2/8/2PN4/1P1BP3/PB3PPP/RN1Q1RK1 b - -" : [2,[11, 27, null], "book"],
  "rnbqkb1r/p1pp1ppp/1p2pn2/8/2PP4/5NP1/PP2PP1P/RNBQKB1R b KQkq -" : [54,[5, 33, null], "book"],
  "rn1qkb1r/p1pp1ppp/bp2pn2/8/2PP4/5NP1/PP2PP1P/RNBQKB1R w KQkq -" : [49,[59, 50, null], "book"],
  "rn1qkb1r/p1pp1ppp/bp2pn2/8/2PP4/1P3NP1/P3PP1P/RNBQKB1R b KQkq -" : [38,[5, 33, null], "book"],
  "rn1qkb1r/p1pp1ppp/bp2pn2/8/Q1PP4/5NP1/PP2PP1P/RNB1KB1R b KQkq -" : [22,[10, 26, null], "book"],
  "rn1qkb1r/p1pp1ppp/bp2pn2/8/2PP4/1Q3NP1/PP2PP1P/RNB1KB1R b KQkq -" : [29,[1, 18, null], "book"],
  "rn1qkb1r/pbpp1ppp/1p2pn2/8/2PP4/5NP1/PP2PP1P/RNBQKB1R w KQkq -" : [44,[61, 54, null], "book"],
  "rn1qkb1r/pbpp1ppp/1p2pn2/8/2PP4/5NP1/PP2PPBP/RNBQK2R b KQkq -" : [41,[5, 33, null], "book"],
  "rn1qk2r/pbpp1ppp/1p2pn2/8/1bPP4/5NP1/PP2PPBP/RNBQK2R w KQkq -" : [51,[58, 51, null], "book"],
  "rn1qk2r/pbpp1ppp/1p2pn2/8/1bPP4/5NP1/PP1BPPBP/RN1QK2R b KQkq -" : [42,[33, 51, null], "book"],
  "rn1qk2r/1bpp1ppp/1p2pn2/p7/1bPP4/5NP1/PP1BPPBP/RN1QK2R w KQkq -" : [55,[60, 62, null], "book"],
  "rn1qk2r/pbppbppp/1p2pn2/8/2PP4/5NP1/PP1BPPBP/RN1QK2R w KQkq -" : [59,[60, 62, null], "book"],
  "rn1qk2r/pbppbppp/1p2pn2/8/2PP4/5NP1/PP2PPBP/RNBQK2R w KQkq -" : [66,[35, 27, null], "book"],
  "rn1qk2r/pbppbppp/1p2pn2/8/2PP4/2N2NP1/PP2PPBP/R1BQK2R b KQkq -" : [41,[4, 6, null], "book"],
  "rn1qk2r/pbppbppp/1p2p3/8/2PPn3/2N2NP1/PP2PPBP/R1BQK2R w KQkq -" : [38,[58, 51, null], "book"],
  "rn1qk2r/pbppbppp/1p2p3/8/2PPn3/2N2NP1/PP1BPPBP/R2QK2R b KQkq -" : [47,[11, 27, null], "book"],
  "rn1qk2r/pbppbppp/1p2pn2/8/2PP4/5NP1/PP2PPBP/RNBQ1RK1 b kq -" : [65,[11, 27, null], "book"],
  "rn1q1rk1/pbppbppp/1p2pn2/8/2PP4/5NP1/PP2PPBP/RNBQ1RK1 w - -" : [54,[35, 27, null], "book"],
  "rn1q1rk1/pbppbppp/1p2pn2/8/2PP4/1P3NP1/P3PPBP/RNBQ1RK1 b - -" : [16,[11, 27, null], "book"],
  "rn1q1rk1/pbppbppp/1p2pn2/3P4/2P5/5NP1/PP2PPBP/RNBQ1RK1 b - -" : [48,[20, 27, null], "book"],
  "rn1q1rk1/pbppbppp/1p3n2/3p4/2P5/5NP1/PP2PPBP/RNBQ1RK1 w - -" : [41,[45, 39, null], "book"],
  "rn1q1rk1/pbppbppp/1p3n2/3p4/2PN4/6P1/PP2PPBP/RNBQ1RK1 b - -" : [20,[1, 18, null], "book"],
  "rn1q1rk1/pbppbppp/1p3n2/3p4/2P4N/6P1/PP2PPBP/RNBQ1RK1 b - -" : [57,[21, 36, null], "book"],
  "rn1q1rk1/pbppbppp/1p2pn2/8/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 b - -" : [42,[21, 36, null], "book"],
  "r2q1rk1/pbppbppp/np2pn2/8/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [50,[58, 37, null], "book"],
  "rn1q1rk1/pbppbppp/1p2p3/8/2PPn3/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [44,[58, 51, null], "book"],
  "rn1q1rk1/pbppbppp/1p2p3/8/2PPn3/2N2NP1/PPQ1PPBP/R1B2RK1 b - -" : [42,[36, 42, null], "book"],
  "rn1q1rk1/pbppbppp/1p2pn2/8/2PP4/5NP1/PP2PPBP/RNBQR1K1 b - -" : [47,[11, 27, null], "book"],
  "rn1qkb1r/pb1p1ppp/1p2pn2/2p5/2PP4/5NP1/PP2PPBP/RNBQK2R w KQkq -" : [46,[35, 27, null], "book"],
  "rn1qkb1r/pb1p1ppp/1p2pn2/2pP4/2P5/5NP1/PP2PPBP/RNBQK2R b KQkq -" : [53,[20, 27, null], "book"],
  "rn1qkb1r/pb1p1ppp/1p3n2/2pp4/2P5/5NP1/PP2PPBP/RNBQK2R w KQkq -" : [74,[34, 27, null], "book"],
  "rn1qkb1r/pb1p1ppp/1p3n2/2pp2N1/2P5/6P1/PP2PPBP/RNBQK2R b KQkq -" : [34,[15, 23, null], "book"],
  "rn1qkb1r/pb1p1ppp/1p3n2/2pp4/2P4N/6P1/PP2PPBP/RNBQK2R b KQkq -" : [53,[14, 22, null], "book"],
  "rnq1kb1r/pbpp1ppp/1p2pn2/8/2PP4/5NP1/PP2PPBP/RNBQK2R w KQkq -" : [78,[60, 62, null], "book"],
  "rnq1kb1r/pbpp1ppp/1p2pn2/8/2PP4/5NP1/PP2PPBP/RNBQ1RK1 b kq -" : [74,[5, 12, null], "book"],
  "rnq1kb1r/pb1p1ppp/1p2pn2/2p5/2PP4/5NP1/PP2PPBP/RNBQ1RK1 w kq -" : [91,[35, 27, null], "book"],
  "rnq1kb1r/pb1p1ppp/1p2pn2/2pP4/2P5/5NP1/PP2PPBP/RNBQ1RK1 b kq -" : [85,[20, 27, null], "book"],
  "rnbqkb1r/p1pp1ppp/1p2pn2/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [18,[5, 33, null], "book"],
  "rn1qkb1r/pbpp1ppp/1p2pn2/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [27,[48, 40, null], "book"],
  "rn1qkb1r/pbp2ppp/1p2p3/3n4/3PP3/P1N2N2/1P3PPP/R1BQKB1R b KQkq -" : [-44,[27, 42, null], "book"],
  "rn1qkb1r/pbpp1p1p/1p2pnp1/8/2PP4/P1N2N2/1P2PPPP/R1BQKB1R w KQkq -" : [60,[59, 50, null], "book"],
  "rn1qkb1r/pbpp1ppp/1p2pn2/6B1/2PP4/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [11,[5, 33, null], "book"],
  "rn1qkb1r/pbpp1pp1/1p2pn1p/6B1/2PP4/2N2N2/PP2PPPP/R2QKB1R w KQkq -" : [3,[30, 39, null], "book"],
  "rn1qkb1r/pbpp1pp1/1p2pn1p/8/2PP3B/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [15,[5, 12, null], "book"],
  "rn1qk2r/pbpp1pp1/1p2pn1p/8/1bPP3B/2N2N2/PP2PPPP/R2QKB1R w KQkq -" : [0,[45, 51, null], "book"],
  "rn1qkb1r/pbpp1p2/1p2pn1p/6p1/2PP3B/2N2N2/PP2PPPP/R2QKB1R w KQkq -" : [8,[39, 46, null], "book"],
  "rn1qkb1r/pbpp1p2/1p2pn1p/6p1/2PP4/2N2NB1/PP2PPPP/R2QKB1R b KQkq -" : [1,[5, 33, null], "book"],
  "rn1qkb1r/pbpp1p2/1p2p2p/6pn/2PP4/2N2NB1/PP2PPPP/R2QKB1R w KQkq -" : [26,[46, 28, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [39,[58, 51, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/5N2/PP1BPPPP/RN1QKB1R b KQkq -" : [43,[8, 24, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/8/2PP4/5N2/PP1bPPPP/RN1QKB1R w KQkq -" : [47,[59, 51, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/8/2PP4/5N2/PP1QPPPP/RN2KB1R b KQkq -" : [37,[11, 27, null], "book"],
  "rnbqk2r/p1pp1ppp/1p2pn2/8/2PP4/5N2/PP1QPPPP/RN2KB1R w KQkq -" : [52,[54, 46, null], "book"],
  "rnbqk2r/p1pp1ppp/1p2pn2/8/2PP4/5NP1/PP1QPP1P/RN2KB1R b KQkq -" : [46,[2, 9, null], "book"],
  "rn1qk2r/pbpp1ppp/1p2pn2/8/2PP4/5NP1/PP1QPP1P/RN2KB1R w KQkq -" : [42,[61, 54, null], "book"],
  "rn1qk2r/pbpp1ppp/1p2pn2/8/2PP4/5NP1/PP1QPPBP/RN2K2R b KQkq -" : [49,[4, 6, null], "book"],
  "rn1q1rk1/pbpp1ppp/1p2pn2/8/2PP4/5NP1/PP1QPPBP/RN2K2R w KQ -" : [42,[60, 62, null], "book"],
  "rn1q1rk1/pbpp1ppp/1p2pn2/8/2PP4/2N2NP1/PP1QPPBP/R3K2R b KQ -" : [45,[11, 27, null], "book"],
  "rn1q1rk1/pbpp1ppp/1p2p3/8/2PPn3/2N2NP1/PP1QPPBP/R3K2R w KQ -" : [45,[51, 50, null], "book"],
  "rn1q1rk1/pbpp1ppp/1p2p3/8/2PPn3/2N2NP1/PPQ1PPBP/R3K2R b KQ -" : [30,[36, 42, null], "book"],
  "rn1q1rk1/pbpp1ppp/1p2p3/8/2PP4/2n2NP1/PPQ1PPBP/R3K2R w KQ -" : [49,[45, 30, null], "book"],
  "rnb1k2r/ppppqppp/4pn2/8/1bPP4/5N2/PP1BPPPP/RN1QKB1R w KQkq -" : [47,[54, 46, null], "book"],
  "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/5N2/PP1NPPPP/R1BQKB1R b KQkq -" : [40,[9, 17, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [65,[35, 27, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/2pP4/2P5/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [73,[9, 25, null], "book"],
  "rnbqkb1r/p2p1ppp/4pn2/1ppP4/2P5/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [67,[27, 20, null], "book"],
  "rnbqkb1r/p2p1ppp/4pn2/1ppP2B1/2P5/5N2/PP2PPPP/RN1QKB1R b KQkq -" : [39,[20, 27, null], "book"],
  "rnbqkb1r/p2p1ppp/5n2/1ppp2B1/2P5/5N2/PP2PPPP/RN1QKB1R w KQkq -" : [36,[34, 27, null], "book"],
  "rnbqkb1r/p2p1ppp/5n2/1ppP2B1/8/5N2/PP2PPPP/RN1QKB1R b KQkq -" : [39,[15, 23, null], "book"],
  "rnbqkb1r/p2p1pp1/5n1p/1ppP2B1/8/5N2/PP2PPPP/RN1QKB1R w KQkq -" : [60,[30, 21, null], "book"],
  "rnbqkb1r/p2p1ppp/4Pn2/1pp5/2P5/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [73,[13, 20, null], "book"],
  "rnbqkb1r/p2p2pp/4pn2/1pp5/2P5/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [73,[34, 25, null], "book"],
  "rnbqkb1r/p2p2pp/4pn2/1Pp5/8/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [54,[11, 27, null], "book"],
  "rnbqkb1r/p5pp/4pn2/1Ppp4/8/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [64,[57, 42, null], "book"],
  "rnbqkb1r/p2p1ppp/4pn2/1ppP4/2P1P3/5N2/PP3PPP/RNBQKB1R b KQkq -" : [52,[21, 36, null], "book"],
  "rnbqkb1r/pppp1ppp/4p3/8/2PPn3/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [45,[52, 44, null], "book"],
  "rnbqkb1r/pppppp1p/5n2/6p1/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [178,[58, 30, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [40,[57, 42, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/3P4/2P5/8/PP2PPPP/RNBQKBNR b KQkq -" : [18,[11, 19, null], "book"],
  "rnbqkb1r/p1pppp1p/5np1/1p1P4/2P5/8/PP2PPPP/RNBQKBNR w KQkq -" : [19,[34, 25, null], "book"],
  "rnbqkb1r/p1pppp1p/5np1/1P1P4/8/8/PP2PPPP/RNBQKBNR b KQkq -" : [13,[8, 16, null], "book"],
  "rnbqkb1r/2pppp1p/p4np1/1P1P4/8/8/PP2PPPP/RNBQKBNR w KQkq -" : [18,[52, 44, null], "book"],
  "rnbqkb1r/2pppp1p/P4np1/3P4/8/8/PP2PPPP/RNBQKBNR b KQkq -" : [18,[10, 18, null], "book"],
  "rnbqkb1r/3ppp1p/P1p2np1/3P4/8/8/PP2PPPP/RNBQKBNR w KQkq -" : [25,[27, 18, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/2PP4/5P2/PP2P1PP/RNBQKBNR b KQkq -" : [29,[10, 26, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/5P2/PP2P1PP/RNBQKBNR w KQkq -" : [44,[34, 27, null], "book"],
  "rnbqkb1r/pppp1p1p/5np1/4p3/2PP4/5P2/PP2P1PP/RNBQKBNR w KQkq -" : [72,[35, 28, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/2PP4/6P1/PP2PP1P/RNBQKBNR b KQkq -" : [18,[10, 18, null], "book"],
  "rnbqk2r/ppppppbp/5np1/8/2PP4/6P1/PP2PP1P/RNBQKBNR w KQkq -" : [37,[61, 54, null], "book"],
  "rnbqk2r/ppppppbp/5np1/8/2PP4/6P1/PP2PPBP/RNBQK1NR b KQkq -" : [52,[10, 18, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/3p4/2PP4/6P1/PP2PPBP/RNBQK1NR w KQkq -" : [52,[34, 27, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/3P4/3P4/6P1/PP2PPBP/RNBQK1NR b KQkq -" : [45,[21, 27, null], "book"],
  "rnbqk2r/ppp1ppbp/6p1/3n4/3P4/6P1/PP2PPBP/RNBQK1NR w KQkq -" : [41,[52, 36, null], "book"],
  "rnbqk2r/ppp1ppbp/6p1/3n4/3P4/5NP1/PP2PPBP/RNBQK2R b KQkq -" : [32,[4, 6, null], "book"],
  "rnbq1rk1/ppp1ppbp/6p1/3n4/3P4/5NP1/PP2PPBP/RNBQK2R w KQ -" : [44,[60, 62, null], "book"],
  "rnbq1rk1/ppp1ppbp/6p1/3n4/3P4/5NP1/PP2PPBP/RNBQ1RK1 b - -" : [39,[27, 17, null], "book"],
  "rnbq1rk1/pp2ppbp/6p1/2pn4/3P4/5NP1/PP2PPBP/RNBQ1RK1 w - -" : [60,[52, 36, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/2PP4/6P1/PP2PPBP/RNBQK1NR w KQkq -" : [39,[62, 45, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/2PP4/5NP1/PP2PPBP/RNBQK2R b KQkq -" : [44,[10, 18, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PP4/5NP1/PP2PPBP/RNBQK2R w KQ -" : [57,[57, 42, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PP4/2N2NP1/PP2PPBP/R1BQK2R b KQ -" : [37,[10, 18, null], "book"],
  "rnbq1rk1/pp2ppbp/3p1np1/2p5/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ -" : [47,[35, 26, null], "book"],
  "rnbq1rk1/pp2ppbp/2pp1np1/8/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ -" : [55,[52, 36, null], "book"],
  "rnbq1rk1/pp2ppbp/2pp1np1/8/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 b - -" : [44,[1, 11, null], "book"],
  "rnb2rk1/pp2ppbp/2pp1np1/q7/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [74,[52, 36, null], "book"],
  "r1bq1rk1/ppp1ppbp/2np1np1/8/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ -" : [49,[55, 47, null], "book"],
  "r1bq1rk1/ppp1ppbp/2np1np1/8/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 b - -" : [38,[12, 28, null], "book"],
  "r1bq1rk1/1pp1ppbp/p1np1np1/8/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [57,[55, 47, null], "book"],
  "r1bq1rk1/1pp1ppbp/p1np1np1/8/2PP4/2N2NPP/PP2PPB1/R1BQ1RK1 b - -" : [50,[12, 28, null], "book"],
  "1rbq1rk1/1pp1ppbp/p1np1np1/8/2PP4/2N2NPP/PP2PPB1/R1BQ1RK1 w - -" : [60,[52, 36, null], "book"],
  "r2q1rk1/ppp1ppbp/2np1np1/5b2/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [47,[45, 60, null], "book"],
  "r2q1rk1/ppp1ppbp/2np1np1/8/2PP2b1/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [66,[35, 27, null], "book"],
  "r1bq1rk1/ppp2pbp/2np1np1/4p3/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [52,[35, 28, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PP4/5NP1/PP2PPBP/RNBQ1RK1 b - -" : [50,[10, 26, null], "book"],
  "r1bq1rk1/ppp1ppbp/2np1np1/8/2PP4/5NP1/PP2PPBP/RNBQ1RK1 w - -" : [52,[57, 42, null], "book"],
  "r1bq1rk1/ppp1ppbp/2np1np1/3P4/2P5/5NP1/PP2PPBP/RNBQ1RK1 b - -" : [48,[18, 24, null], "book"],
  "r1bq1rk1/ppp1ppbp/3p1np1/n2P4/2P5/5NP1/PP2PPBP/RNBQ1RK1 w - -" : [43,[57, 40, null], "book"],
  "rnbq1rk1/ppppppbp/5np1/8/2PP4/6P1/PP2PPBP/RNBQK1NR w KQ -" : [46,[57, 42, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/6P1/PP2PP1P/RNBQKBNR w KQkq -" : [44,[34, 27, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/6P1/PP2PPBP/RNBQK1NR b KQkq -" : [21,[10, 18, null], "book"],
  "rnbqk2r/ppp1ppbp/6p1/3n4/3PP3/6P1/PP3PBP/RNBQK1NR b KQkq -" : [45,[27, 17, null], "book"],
  "rnbqk2r/ppp1ppbp/1n4p1/8/3PP3/6P1/PP3PBP/RNBQK1NR w KQkq -" : [52,[62, 52, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/3p4/2PP4/5NP1/PP2PPBP/RNBQK2R b KQkq -" : [25,[10, 18, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/5NP1/PP2PPBP/RNBQK2R w KQ -" : [37,[34, 27, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/3P4/3P4/5NP1/PP2PPBP/RNBQK2R b KQ -" : [32,[21, 27, null], "book"],
  "rnbq1rk1/ppp1ppbp/1n4p1/8/3P4/5NP1/PP2PPBP/RNBQ1RK1 w - -" : [45,[57, 42, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/5NP1/PP2PPBP/RNBQ1RK1 b - -" : [28,[10, 18, null], "book"],
  "rnbq1rk1/pp2ppbp/2p2np1/3p4/2PP4/5NP1/PP2PPBP/RNBQ1RK1 w - -" : [20,[48, 32, null], "book"],
  "rnbq1rk1/pp2ppbp/2p2np1/3P4/3P4/5NP1/PP2PPBP/RNBQ1RK1 b - -" : [21,[18, 27, null], "book"],
  "rnbq1rk1/pp2ppbp/5np1/3p4/3P4/5NP1/PP2PPBP/RNBQ1RK1 w - -" : [23,[57, 42, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/8/2pP4/5NP1/PP2PPBP/RNBQ1RK1 w - -" : [24,[57, 40, null], "book"],
  "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/5NP1/PP2PPBP/RNBQ1RK1 w - -" : [47,[34, 27, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [25,[11, 27, null], "book"],
  "rnbqk2r/ppppppbp/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [51,[52, 36, null], "book"],
  "rnbqk2r/ppppppbp/5np1/6B1/2PP4/2N5/PP2PPPP/R2QKBNR b KQkq -" : [18,[15, 23, null], "book"],
  "rnbqk2r/ppppppbp/5np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [52,[11, 19, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq -" : [59,[62, 45, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP2BPPP/R1BQK1NR b KQkq -" : [50,[4, 6, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP2BPPP/R1BQK1NR w KQ -" : [66,[62, 45, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N1B3/PP2BPPP/R2QK1NR b KQ -" : [31,[10, 26, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/6B1/2PPP3/2N5/PP2BPPP/R2QK1NR b KQ -" : [53,[15, 23, null], "book"],
  "rnbq1rk1/1pp1ppbp/p2p1np1/6B1/2PPP3/2N5/PP2BPPP/R2QK1NR w KQ -" : [56,[62, 45, null], "book"],
  "rnbq1rk1/pp2ppbp/3p1np1/2p3B1/2PPP3/2N5/PP2BPPP/R2QK1NR w KQ -" : [63,[35, 27, null], "book"],
  "rnbq1rk1/pp2ppbp/3p1np1/2pP2B1/2P1P3/2N5/PP2BPPP/R2QK1NR b KQ -" : [38,[12, 20, null], "book"],
  "rnbq1rk1/ppp1ppb1/3p1npp/6B1/2PPP3/2N5/PP2BPPP/R2QK1NR w KQ -" : [42,[30, 44, null], "book"],
  "r1bq1rk1/ppp1ppbp/n2p1np1/6B1/2PPP3/2N5/PP2BPPP/R2QK1NR w KQ -" : [60,[53, 37, null], "book"],
  "r1bq1rk1/ppp1ppbp/n2p1np1/6B1/2PPP3/2N5/PP1QBPPP/R3K1NR b KQ -" : [26,[12, 28, null], "book"],
  "r1bq1rk1/pp2ppbp/n1pp1np1/6B1/2PPP3/2N5/PP1QBPPP/R3K1NR w KQ -" : [56,[62, 45, null], "book"],
  "r1bq1rk1/pppnppbp/3p1np1/6B1/2PPP3/2N5/PP2BPPP/R2QK1NR w KQ -" : [77,[59, 51, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/6B1/2PPP3/2N5/PP3PPP/R2QKBNR b KQkq -" : [29,[15, 23, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N2P2/PP4PP/R1BQKBNR b KQkq -" : [35,[4, 6, null], "book"],
  "rnbqk2r/ppp2pbp/3p1np1/4p3/2PPP3/2N2P2/PP4PP/R1BQKBNR w KQkq -" : [62,[62, 52, null], "book"],
  "rnbqk2r/ppp2pbp/3p1np1/3Pp3/2P1P3/2N2P2/PP4PP/R1BQKBNR b KQkq -" : [51,[21, 11, null], "book"],
  "rnbqk2r/ppp2pbp/3p2p1/3Pp2n/2P1P3/2N2P2/PP4PP/R1BQKBNR w KQkq -" : [62,[58, 44, null], "book"],
  "rnbqk2r/ppp2pbp/3p2p1/3Pp2n/2P1P3/2N1BP2/PP4PP/R2QKBNR b KQkq -" : [58,[13, 29, null], "book"],
  "r1bqk2r/ppp2pbp/n2p2p1/3Pp2n/2P1P3/2N1BP2/PP4PP/R2QKBNR w KQkq -" : [77,[54, 46, null], "book"],
  "r1bqk2r/ppp2pbp/n2p2p1/3Pp2n/2P1P3/2N1BP2/PP1Q2PP/R3KBNR b KQkq -" : [66,[3, 39, null], "book"],
  "r1b1k2r/ppp2pbp/n2p2p1/3Pp2n/2P1P2q/2N1BP2/PP1Q2PP/R3KBNR w KQkq -" : [60,[44, 53, null], "book"],
  "r1b1k2r/ppp2pbp/n2p2p1/3Pp2n/2P1P2q/2N1BPP1/PP1Q3P/R3KBNR b KQkq -" : [55,[31, 46, null], "book"],
  "r1b1k2r/ppp2pbp/n2p2p1/3Pp3/2P1P2q/2N1BPn1/PP1Q3P/R3KBNR w KQkq -" : [80,[51, 53, null], "book"],
  "r1b1k2r/ppp2pbp/n2p2p1/3Pp3/2P1P2q/2N1BPn1/PP3Q1P/R3KBNR b KQkq -" : [54,[46, 61, null], "book"],
  "r1b1k2r/ppp2pbp/n2p2p1/3Pp3/2P1P2q/2N1BP2/PP3Q1P/R3KnNR w KQkq -" : [67,[53, 39, null], "book"],
  "r1b1k2r/ppp2pbp/n2p2p1/3Pp3/2P1P2Q/2N1BP2/PP5P/R3KnNR b KQkq -" : [70,[61, 44, null], "book"],
  "r1b1k2r/ppp2pbp/n2p2p1/3Pp3/2P1P2Q/2N1nP2/PP5P/R3K1NR w KQkq -" : [68,[60, 53, null], "book"],
  "r1b1k2r/ppp2pbp/n2p2p1/3Pp3/2P1P2Q/2N1nP2/PP3K1P/R5NR b kq -" : [67,[44, 34, null], "book"],
  "r1b1k2r/ppp2pbp/n2p2p1/3Pp3/2n1P2Q/2N2P2/PP3K1P/R5NR w kq -" : [77,[49, 41, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2P2/PP4PP/R1BQKBNR w KQ -" : [32,[58, 44, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N1BP2/PP4PP/R2QKBNR b KQ -" : [38,[10, 26, null], "book"],
  "rnbq1rk1/p1p1ppbp/1p1p1np1/8/2PPP3/2N1BP2/PP4PP/R2QKBNR w KQ -" : [49,[59, 51, null], "book"],
  "rnbq1rk1/pp2ppbp/2pp1np1/8/2PPP3/2N1BP2/PP4PP/R2QKBNR w KQ -" : [57,[59, 51, null], "book"],
  "rnbq1rk1/pp2ppbp/2pp1np1/8/2PPP3/2NBBP2/PP4PP/R2QK1NR b KQ -" : [62,[18, 26, null], "book"],
  "rnbq1rk1/1p2ppbp/p1pp1np1/8/2PPP3/2NBBP2/PP4PP/R2QK1NR w KQ -" : [50,[62, 52, null], "book"],
  "rnbq1rk1/ppp2pbp/3p1np1/4p3/2PPP3/2N1BP2/PP4PP/R2QKBNR w KQ -" : [77,[62, 52, null], "book"],
  "rnbq1rk1/ppp2pbp/3p1np1/3Pp3/2P1P3/2N1BP2/PP4PP/R2QKBNR b KQ -" : [81,[21, 11, null], "book"],
  "rnbq1rk1/pp3pbp/2pp1np1/3Pp3/2P1P3/2N1BP2/PP4PP/R2QKBNR w KQ -" : [73,[54, 38, null], "book"],
  "rnbq1rk1/pp3pbp/2pp1np1/3Pp3/2P1P3/2N1BP2/PP2N1PP/R2QKB1R b KQ -" : [75,[8, 16, null], "book"],
  "rnbq1rk1/ppp2pbp/3p2p1/3Pp2n/2P1P3/2N1BP2/PP4PP/R2QKBNR w KQ -" : [93,[59, 51, null], "book"],
  "rnbq1rk1/ppp2pbp/3p2p1/3Pp2n/2P1P3/2N1BP2/PP1Q2PP/R3KBNR b KQ -" : [88,[13, 29, null], "book"],
  "rnb2rk1/ppp2pbp/3p2p1/3Pp2n/2P1P2q/2N1BP2/PP1Q2PP/R3KBNR w KQ -" : [109,[54, 46, null], "book"],
  "rnb2rk1/ppp2pbp/3p2p1/3Pp2n/2P1P2q/2N1BPP1/PP1Q3P/R3KBNR b KQ -" : [67,[31, 46, null], "book"],
  "rnb2rk1/ppp2pbp/3p2p1/3Pp3/2P1P2q/2N1BPn1/PP1Q3P/R3KBNR w KQ -" : [91,[51, 53, null], "book"],
  "rnb2rk1/ppp2pbp/3p2p1/3Pp3/2P1P2q/2N1BPn1/PP3Q1P/R3KBNR b KQ -" : [59,[46, 61, null], "book"],
  "rnb2rk1/ppp2pbp/3p2p1/3Pp3/2P1P2q/2N1BP2/PP3Q1P/R3KnNR w KQ -" : [84,[53, 39, null], "book"],
  "rnbq1rk1/ppp2pbp/3p1np1/4p3/2PPP3/2N1BP2/PP2N1PP/R2QKB1R b KQ -" : [77,[28, 35, null], "book"],
  "rnbq1rk1/pp3pbp/2pp1np1/4p3/2PPP3/2N1BP2/PP2N1PP/R2QKB1R w KQ -" : [81,[35, 27, null], "book"],
  "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N1BP2/PP4PP/R2QKBNR w KQ -" : [61,[59, 51, null], "book"],
  "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N1BP2/PP2N1PP/R2QKB1R b KQ -" : [55,[8, 16, null], "book"],
  "r1bq1rk1/1pp1ppbp/p1np1np1/8/2PPP3/2N1BP2/PP2N1PP/R2QKB1R w KQ -" : [58,[59, 51, null], "book"],
  "r1bq1rk1/1pp1ppbp/p1np1np1/8/2PPP3/2N1BP2/PP1QN1PP/R3KB1R b KQ -" : [56,[18, 24, null], "book"],
  "1rbq1rk1/1pp1ppbp/p1np1np1/8/2PPP3/2N1BP2/PP1QN1PP/R3KB1R w KQ -" : [67,[52, 58, null], "book"],
  "1rbq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N1BP2/PP2N1PP/R2QKB1R w KQ -" : [62,[59, 51, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/6B1/2PPP3/2N2P2/PP4PP/R2QKBNR b KQ -" : [16,[8, 16, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2P2/PP2N1PP/R1BQKB1R b KQ -" : [35,[8, 16, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/2PPPP2/2N5/PP4PP/R1BQKBNR b KQkq -" : [49,[10, 26, null], "book"],
  "rnbqk2r/pp2ppbp/3p1np1/2p5/2PPPP2/2N5/PP4PP/R1BQKBNR w KQkq -" : [12,[35, 27, null], "book"],
  "rnbqk2r/pp2ppbp/3p1np1/2pP4/2P1PP2/2N5/PP4PP/R1BQKBNR b KQkq -" : [14,[4, 6, null], "book"],
  "rnbq1rk1/pp2ppbp/3p1np1/2pP4/2P1PP2/2N5/PP4PP/R1BQKBNR w KQ -" : [32,[62, 45, null], "book"],
  "rnbq1rk1/pp2ppbp/3p1np1/2pP4/2P1PP2/2N5/PP2B1PP/R1BQK1NR b KQ -" : [13,[12, 20, null], "book"],
  "rnbq1rk1/pp3pbp/3ppnp1/2pP4/2P1PP2/2N5/PP2B1PP/R1BQK1NR w KQ -" : [44,[62, 45, null], "book"],
  "rnbq1rk1/pp3pbp/3pPnp1/2p5/2P1PP2/2N5/PP2B1PP/R1BQK1NR b KQ -" : [4,[2, 20, null], "book"],
  "rnbq1rk1/pp4bp/3ppnp1/2p5/2P1PP2/2N5/PP2B1PP/R1BQK1NR w KQ -" : [17,[55, 39, null], "book"],
  "rnbq1rk1/pp4bp/3ppnp1/2p5/2P1PPP1/2N5/PP2B2P/R1BQK1NR b KQ -" : [-83,[1, 18, null], "book"],
  "r1bq1rk1/pp4bp/2nppnp1/2p5/2P1PPP1/2N5/PP2B2P/R1BQK1NR w KQ -" : [-105,[55, 39, null], "book"],
  "r1bq1rk1/pp4bp/2nppnp1/2p5/2P1PPPP/2N5/PP2B3/R1BQK1NR b KQ -" : [-85,[9, 25, null], "book"],
  "r1bqk2r/ppp1ppbp/n2p1np1/8/2PPPP2/2N5/PP4PP/R1BQKBNR w KQkq -" : [50,[62, 45, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPPP2/2N5/PP4PP/R1BQKBNR w KQ -" : [23,[61, 52, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPPP2/2N5/PP2B1PP/R1BQK1NR b KQ -" : [14,[12, 28, null], "book"],
  "rnbq1rk1/pp2ppbp/3p1np1/2p5/2PPPP2/2N5/PP2B1PP/R1BQK1NR w KQ -" : [22,[35, 27, null], "book"],
  "rnbq1rk1/pp3pbp/3ppnp1/2pP4/2P1PP2/2N2N2/PP2B1PP/R1BQK2R b KQ -" : [9,[20, 27, null], "book"],
  "rnbq1rk1/pp3pbp/3p1np1/2pp4/2P1PP2/2N2N2/PP2B1PP/R1BQK2R w KQ -" : [47,[34, 27, null], "book"],
  "rnbq1rk1/pp3pbp/3p1np1/2ppP3/2P2P2/2N2N2/PP2B1PP/R1BQK2R b KQ -" : [-70,[19, 28, null], "book"],
  "rnbq1rk1/pp2ppbp/3p1np1/2p5/2PPPP2/2N2N2/PP2B1PP/R1BQK2R b KQ -" : [14,[26, 35, null], "book"],
  "rnbq1rk1/pp2ppbp/3p1np1/8/2PpPP2/2N2N2/PP2B1PP/R1BQK2R w KQ -" : [36,[45, 35, null], "book"],
  "rnbq1rk1/pp2ppbp/3p1np1/8/2PNPP2/2N5/PP2B1PP/R1BQK2R b KQ -" : [18,[3, 17, null], "book"],
  "r1bq1rk1/pp2ppbp/2np1np1/8/2PNPP2/2N5/PP2B1PP/R1BQK2R w KQ -" : [26,[58, 44, null], "book"],
  "r1bq1rk1/pp2ppbp/2np1np1/8/2PNPP2/2N1B3/PP2B1PP/R2QK2R b KQ -" : [36,[2, 38, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPPP2/2N2N2/PP4PP/R1BQKB1R b KQ -" : [28,[10, 26, null], "book"],
  "rnbq1rk1/pp2ppbp/3p1np1/2p5/2PPPP2/2N2N2/PP4PP/R1BQKB1R w KQ -" : [33,[35, 27, null], "book"],
  "rnbq1rk1/pp2ppbp/3p1np1/2pP4/2P1PP2/2N2N2/PP4PP/R1BQKB1R b KQ -" : [9,[12, 20, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N3P1/PP3P1P/R1BQKBNR b KQkq -" : [4,[10, 26, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N3P1/PP3P1P/R1BQKBNR w KQ -" : [18,[61, 54, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N3P1/PP3PBP/R1BQK1NR b KQ -" : [23,[12, 28, null], "book"],
  "rnbq1rk1/ppp2pbp/3p1np1/4p3/2PPP3/2N3P1/PP3PBP/R1BQK1NR w KQ -" : [21,[35, 27, null], "book"],
  "rnbq1rk1/ppp2pbp/3p1np1/4p3/2PPP3/2N3P1/PP2NPBP/R1BQK2R b KQ -" : [9,[28, 35, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N4P/PP3PP1/R1BQKBNR b KQkq -" : [55,[4, 6, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R b KQkq -" : [48,[4, 6, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ -" : [66,[61, 52, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R b KQ -" : [44,[12, 28, null], "book"],
  "rnbq1rk1/ppp2pbp/3p1np1/4p3/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ -" : [67,[60, 62, null], "book"],
  "rnbq1rk1/ppp2pbp/3p1np1/4p3/2PPP3/2N1BN2/PP2BPPP/R2QK2R b KQ -" : [46,[21, 38, null], "book"],
  "rnbq1rk1/ppp2pbp/3p1np1/3Pp3/2P1P3/2N2N2/PP2BPPP/R1BQK2R b KQ -" : [41,[8, 24, null], "book"],
  "rnbq1rk1/1pp2pbp/3p1np1/p2Pp3/2P1P3/2N2N2/PP2BPPP/R1BQK2R w KQ -" : [50,[55, 47, null], "book"],
  "r1bq1rk1/pppn1pbp/3p1np1/3Pp3/2P1P3/2N2N2/PP2BPPP/R1BQK2R w KQ -" : [56,[58, 44, null], "book"],
  "r1bq1rk1/pppn1pbp/3p1np1/3Pp1B1/2P1P3/2N2N2/PP2BPPP/R2QK2R b KQ -" : [14,[15, 23, null], "book"],
  "r1bq1rk1/pppn1pb1/3p1npp/3Pp1B1/2P1P3/2N2N2/PP2BPPP/R2QK2R w KQ -" : [29,[30, 58, null], "book"],
  "r1bq1rk1/pppn1pb1/3p1npp/3Pp3/2P1P2B/2N2N2/PP2BPPP/R2QK2R b KQ -" : [4,[22, 30, null], "book"],
  "r1bq1rk1/pppn1pb1/3p1n1p/3Pp1p1/2P1P2B/2N2N2/PP2BPPP/R2QK2R w KQ -" : [4,[39, 46, null], "book"],
  "r1bq1rk1/pppn1pb1/3p1n1p/3Pp1p1/2P1P3/2N2NB1/PP2BPPP/R2QK2R b KQ -" : [-3,[21, 31, null], "book"],
  "r1bq1rk1/pppn1pb1/3p3p/3Pp1pn/2P1P3/2N2NB1/PP2BPPP/R2QK2R w KQ -" : [0,[45, 51, null], "book"],
  "r1bq1rk1/pppn1pb1/3p3p/3Pp1pn/2P1P2P/2N2NB1/PP2BPP1/R2QK2R b KQ -" : [-26,[30, 38, null], "book"],
  "rnbq1rk1/ppp2pbp/3p1np1/4p3/2PPP3/2N2N2/PP2BPPP/R1BQ1RK1 b - -" : [62,[28, 35, null], "book"],
  "rnbq1rk1/1pp2pbp/3p1np1/p3p3/2PPP3/2N2N2/PP2BPPP/R1BQ1RK1 w - -" : [64,[58, 44, null], "book"],
  "rnbq1rk1/pp3pbp/2pp1np1/4p3/2PPP3/2N2N2/PP2BPPP/R1BQ1RK1 w - -" : [80,[35, 27, null], "book"],
  "r1bq1rk1/ppp2pbp/n2p1np1/4p3/2PPP3/2N2N2/PP2BPPP/R1BQ1RK1 w - -" : [71,[58, 44, null], "book"],
  "r1bq1rk1/pppn1pbp/3p1np1/4p3/2PPP3/2N2N2/PP2BPPP/R1BQ1RK1 w - -" : [79,[58, 44, null], "book"],
  "r1bq1rk1/pppn1pbp/3p1np1/4p3/2PPP3/2N2N2/PP2BPPP/R1BQR1K1 b - -" : [46,[5, 4, null], "book"],
  "r1bq1rk1/pp1n1pbp/2pp1np1/4p3/2PPP3/2N2N2/PP2BPPP/R1BQR1K1 w - -" : [66,[58, 44, null], "book"],
  "r1bq1rk1/pp1n1pbp/2pp1np1/4p3/2PPP3/2N2N2/PP3PPP/R1BQRBK1 b - -" : [60,[28, 35, null], "book"],
  "r1bq1rk1/1p1n1pbp/2pp1np1/p3p3/2PPP3/2N2N2/PP3PPP/R1BQRBK1 w - -" : [59,[35, 28, null], "book"],
  "r1bq1rk1/ppp2pbp/2np1np1/4p3/2PPP3/2N2N2/PP2BPPP/R1BQ1RK1 w - -" : [72,[35, 27, null], "book"],
  "r1bq1rk1/ppp2pbp/2np1np1/3Pp3/2P1P3/2N2N2/PP2BPPP/R1BQ1RK1 b - -" : [59,[18, 12, null], "book"],
  "r1bq1rk1/ppp1npbp/3p1np1/3Pp3/2P1P3/2N2N2/PP2BPPP/R1BQ1RK1 w - -" : [56,[49, 33, null], "book"],
  "r1bq1rk1/ppp1npbp/3p1np1/3Pp3/1PP1P3/2N2N2/P3BPPP/R1BQ1RK1 b - -" : [76,[21, 31, null], "book"],
  "r1bq1rk1/ppp1npbp/3p2p1/3Pp2n/1PP1P3/2N2N2/P3BPPP/R1BQ1RK1 w - -" : [73,[61, 60, null], "book"],
  "r1bq1rk1/ppp1npbp/3p2p1/3Pp2n/1PP1P3/2N2N2/P1Q1BPPP/R1B2RK1 b - -" : [34,[31, 37, null], "book"],
  "r1bq1rk1/ppp1npbp/3p2p1/3Pp2n/1PP1P3/2N2N2/P3BPPP/R1BQR1K1 b - -" : [68,[13, 29, null], "book"],
  "r1bq1rk1/ppp1npbp/3p1np1/3Pp3/2P1P3/2N2N2/PP1BBPPP/R2Q1RK1 b - -" : [59,[21, 11, null], "book"],
  "r1bq1rk1/ppp1npbp/3p1np1/3Pp3/2P1P3/2N5/PP2BPPP/R1BQNRK1 b - -" : [67,[21, 4, null], "book"],
  "r1bq1rk1/pppnnpbp/3p2p1/3Pp3/2P1P3/2N5/PP2BPPP/R1BQNRK1 w - -" : [73,[58, 44, null], "book"],
  "r1bq1rk1/pppnnpbp/3p2p1/3Pp3/2P1P3/2N1B3/PP2BPPP/R2QNRK1 b - -" : [76,[13, 29, null], "book"],
  "r1bq1rk1/pppnn1bp/3p2p1/3Ppp2/2P1P3/2N1B3/PP2BPPP/R2QNRK1 w - -" : [70,[53, 45, null], "book"],
  "r1bq1rk1/pppnnpbp/3p2p1/3Pp3/2P1P3/2N2P2/PP2B1PP/R1BQNRK1 b - -" : [73,[13, 29, null], "book"],
  "r1bq1rk1/pppnn1bp/3p2p1/3Ppp2/2P1P3/2N2P2/PP2B1PP/R1BQNRK1 w - -" : [69,[58, 44, null], "book"],
  "r1bq1rk1/pppnn1bp/3p2p1/3Ppp2/2P1P1P1/2N2P2/PP2B2P/R1BQNRK1 b - -" : [20,[29, 37, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N1BN2/PP3PPP/R2QKB1R b KQ -" : [53,[21, 38, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/6B1/2PPP3/2N2N2/PP3PPP/R2QKB1R b KQ -" : [28,[15, 23, null], "book"],
  "rnbqk2r/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [43,[11, 27, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [60,[55, 47, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/6B1/2PP4/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [21,[15, 23, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/2PP4/2N2NP1/PP2PP1P/R1BQKB1R b KQkq -" : [45,[4, 6, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ -" : [37,[61, 54, null], "book"],
  "rnbq1rk1/pp2ppbp/3p1np1/2p5/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 b - -" : [28,[1, 18, null], "book"],
  "r1bq1rk1/pp2ppbp/2np1np1/2p5/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [33,[35, 26, null], "book"],
  "r1bq1rk1/pp2ppbp/2np1np1/2pP4/2P5/2N2NP1/PP2PPBP/R1BQ1RK1 b - -" : [19,[18, 24, null], "book"],
  "rn1q1rk1/pp2ppbp/2pp1np1/5b2/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [56,[61, 60, null], "book"],
  "rnb2rk1/pp2ppbp/1qpp1np1/8/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [62,[55, 47, null], "book"],
  "r1bq1rk1/pppnppbp/3p1np1/8/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ -" : [45,[60, 62, null], "book"],
  "r1bq1rk1/pppnppbp/3p1np1/8/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 b - -" : [52,[12, 28, null], "book"],
  "r1bq1rk1/pppn1pbp/3p1np1/4p3/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - -" : [52,[35, 28, null], "book"],
  "r1bq1rk1/pppn1pbp/3p1np1/4p3/2PPP3/2N2NP1/PP3PBP/R1BQ1RK1 b - -" : [50,[5, 4, null], "book"],
  "r1bq1rk1/pp1n1pbp/2pp1np1/4p3/2PPP3/2N2NP1/PP3PBP/R1BQ1RK1 w - -" : [62,[55, 47, null], "book"],
  "r1bq1rk1/pp1n1pbp/2pp1np1/4p3/2PPP3/2N2NPP/PP3PB1/R1BQ1RK1 b - -" : [57,[5, 4, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [32,[34, 27, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP1B2/2N5/PP2PPPP/R2QKBNR b KQkq -" : [21,[5, 14, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/3p4/2PP1B2/2N5/PP2PPPP/R2QKBNR w KQkq -" : [23,[62, 45, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/3p4/2PP1B2/2N1P3/PP3PPP/R2QKBNR b KQkq -" : [20,[4, 6, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP1B2/2N1P3/PP3PPP/R2QKBNR w KQ -" : [27,[56, 58, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/3P4/3P1B2/2N1P3/PP3PPP/R2QKBNR b KQ -" : [26,[21, 27, null], "book"],
  "rnbq1rk1/ppp1ppbp/6p1/3n4/3P1B2/2N1P3/PP3PPP/R2QKBNR w KQ -" : [12,[42, 27, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP1B2/2N1P3/PP3PPP/2RQKBNR b K -" : [22,[10, 26, null], "book"],
  "rnbq1rk1/pp2ppbp/5np1/2pp4/2PP1B2/2N1P3/PP3PPP/2RQKBNR w K -" : [30,[35, 26, null], "book"],
  "rnbq1rk1/pp2ppbp/5np1/2Pp4/2P2B2/2N1P3/PP3PPP/2RQKBNR b K -" : [24,[21, 36, null], "book"],
  "rn1q1rk1/pp2ppbp/4bnp1/2Pp4/2P2B2/2N1P3/PP3PPP/2RQKBNR w K -" : [16,[62, 45, null], "book"],
  "rnb2rk1/pp2ppbp/5np1/q1Pp4/2P2B2/2N1P3/PP3PPP/2RQKBNR w K -" : [39,[34, 27, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR b KQkq -" : [20,[21, 36, null], "book"],
  "rnbqkb1r/ppp1pp1p/6p1/3p2B1/2PPn3/2N5/PP2PPPP/R2QKBNR w KQkq -" : [30,[30, 37, null], "book"],
  "rnbqkb1r/ppp1pp1p/6p1/3p2B1/2PPN3/8/PP2PPPP/R2QKBNR b KQkq -" : [-4,[27, 36, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3P4/3P4/2N5/PP2PPPP/R1BQKBNR b KQkq -" : [36,[21, 27, null], "book"],
  "rnbqkb1r/ppp1pp1p/6p1/3n4/3P4/2N5/PP2PPPP/R1BQKBNR w KQkq -" : [45,[52, 36, null], "book"],
  "rnbqkb1r/ppp1pp1p/6p1/3n4/3PP3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [28,[27, 42, null], "book"],
  "rnbqkb1r/ppp1pp1p/6p1/8/3PP3/2n5/PP3PPP/R1BQKBNR w KQkq -" : [30,[49, 42, null], "book"],
  "rnbqkb1r/ppp1pp1p/6p1/8/3PP3/2P5/P4PPP/R1BQKBNR b KQkq -" : [42,[5, 14, null], "book"],
  "rnbqk2r/ppp1ppbp/6p1/8/3PP3/2P5/P4PPP/R1BQKBNR w KQkq -" : [38,[62, 45, null], "book"],
  "rnbqk2r/ppp1ppbp/6p1/8/2BPP3/2P5/P4PPP/R1BQK1NR b KQkq -" : [34,[10, 26, null], "book"],
  "rnbq1rk1/ppp1ppbp/6p1/8/2BPP3/2P5/P4PPP/R1BQK1NR w KQ -" : [42,[62, 52, null], "book"],
  "rnbq1rk1/ppp1ppbp/6p1/8/2BPP3/2P5/P3NPPP/R1BQK2R b KQ -" : [45,[1, 18, null], "book"],
  "rnbq1rk1/p1p1ppbp/1p4p1/8/2BPP3/2P5/P3NPPP/R1BQK2R w KQ -" : [57,[55, 39, null], "book"],
  "rnbq1rk1/p1p1ppbp/1p4p1/8/2BPP2P/2P5/P3NPP1/R1BQK2R b KQ -" : [55,[1, 18, null], "book"],
  "rn1q1rk1/p1p1ppbp/bp4p1/8/2BPP2P/2P5/P3NPP1/R1BQK2R w KQ -" : [89,[34, 16, null], "book"],
  "rnbq1rk1/pp2ppbp/6p1/2p5/2BPP3/2P5/P3NPPP/R1BQK2R w KQ -" : [37,[60, 62, null], "book"],
  "rnbq1rk1/pp2ppbp/6p1/2p5/2BPP3/2P5/P3NPPP/R1BQ1RK1 b - -" : [31,[1, 18, null], "book"],
  "r1bq1rk1/pp2ppbp/2n3p1/2p5/2BPP3/2P5/P3NPPP/R1BQ1RK1 w - -" : [38,[58, 44, null], "book"],
  "r1bq1rk1/pp2ppbp/2n3p1/2p5/2BPP3/2P1B3/P3NPPP/R2Q1RK1 b - -" : [36,[18, 24, null], "book"],
  "r1bq1rk1/pp2ppbp/2n3p1/8/2BpP3/2P1B3/P3NPPP/R2Q1RK1 w - -" : [58,[42, 35, null], "book"],
  "r1bq1rk1/pp2ppbp/2n3p1/8/2BPP3/4B3/P3NPPP/R2Q1RK1 b - -" : [53,[2, 38, null], "book"],
  "r2q1rk1/pp2ppbp/2n3p1/8/2BPP1b1/4B3/P3NPPP/R2Q1RK1 w - -" : [63,[53, 45, null], "book"],
  "r2q1rk1/pp2ppbp/2n3p1/8/2BPP1b1/4BP2/P3N1PP/R2Q1RK1 b - -" : [48,[38, 11, null], "book"],
  "r2q1rk1/pp2ppbp/6p1/n7/2BPP1b1/4BP2/P3N1PP/R2Q1RK1 w - -" : [70,[34, 13, null], "book"],
  "r2q1rk1/pp2ppbp/6p1/n7/3PP1b1/3BBP2/P3N1PP/R2Q1RK1 b - -" : [31,[38, 20, null], "book"],
  "r2q1rk1/pp2ppbp/4b1p1/n7/3PP3/3BBP2/P3N1PP/R2Q1RK1 w - -" : [20,[35, 27, null], "book"],
  "r2q1rk1/pp2ppbp/4b1p1/n2P4/4P3/3BBP2/P3N1PP/R2Q1RK1 b - -" : [18,[14, 56, null], "book"],
  "r1bq1rk1/ppp1ppbp/2n3p1/8/2BPP3/2P5/P3NPPP/R1BQK2R w KQ -" : [41,[60, 62, null], "book"],
  "rnb2rk1/pppqppbp/6p1/8/2BPP3/2P5/P3NPPP/R1BQK2R w KQ -" : [50,[60, 62, null], "book"],
  "rnb2rk1/pppqppbp/6p1/8/2BPP3/2P5/P3NPPP/R1BQ1RK1 b - -" : [51,[10, 26, null], "book"],
  "rnb2rk1/p1pqppbp/1p4p1/8/2BPP3/2P5/P3NPPP/R1BQ1RK1 w - -" : [42,[58, 44, null], "book"],
  "rnbqk2r/ppp1ppbp/6p1/8/3PP3/2P2N2/P4PPP/R1BQKB1R b KQkq -" : [34,[10, 26, null], "book"],
  "rnbqk2r/pp2ppbp/6p1/2p5/3PP3/2P2N2/P4PPP/R1BQKB1R w KQkq -" : [27,[61, 25, null], "book"],
  "rnbqk2r/pp2ppbp/6p1/2p5/3PP3/2P2N1P/P4PP1/R1BQKB1R b KQkq -" : [24,[4, 6, null], "book"],
  "rnbqkb1r/ppp1pp1p/6p1/3n4/3P4/2N3P1/PP2PP1P/R1BQKBNR b KQkq -" : [17,[5, 14, null], "book"],
  "rnbqkb1r/ppp1pp1p/6p1/3n4/N2P4/8/PP2PPPP/R1BQKBNR b KQkq -" : [19,[5, 14, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N1P3/PP3PPP/R1BQKBNR b KQkq -" : [0,[5, 14, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/3p4/2PP4/2N1P3/PP3PPP/R1BQKBNR w KQkq -" : [15,[62, 45, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R b KQkq -" : [11,[4, 6, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQ -" : [5,[58, 51, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/3p4/1PPP4/2N1PN2/P4PPP/R1BQKB1R b KQ -" : [-8,[10, 18, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N1PN2/PP1B1PPP/R2QKB1R b KQ -" : [8,[10, 26, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R b KQ -" : [-13,[10, 26, null], "book"],
  "rnbq1rk1/pp2ppbp/2p2np1/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQ -" : [40,[55, 47, null], "book"],
  "rnbq1rk1/pp2ppbp/2p2np1/3p4/2PP4/2NBPN2/PP3PPP/R1BQ1RK1 b - -" : [28,[2, 38, null], "book"],
  "rn1q1rk1/pp2ppbp/2p2np1/3p1b2/2PP4/2NBPN2/PP3PPP/R1BQ1RK1 w - -" : [66,[43, 29, null], "book"],
  "rn1q1rk1/pp2ppbp/2p2np1/3p4/2PP2b1/2NBPN2/PP3PPP/R1BQ1RK1 w - -" : [35,[55, 47, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/1QN1PN2/PP3PPP/R1B1KB1R b KQ -" : [-8,[12, 20, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/8/2pP4/1QN1PN2/PP3PPP/R1B1KB1R w KQ -" : [23,[61, 34, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/8/2BP4/1QN1PN2/PP3PPP/R1B1K2R b KQ -" : [20,[10, 26, null], "book"],
  "r1bq1rk1/pppnppbp/5np1/8/2BP4/1QN1PN2/PP3PPP/R1B1K2R w KQ -" : [67,[45, 30, null], "book"],
  "r1bq1rk1/pppnppbp/5np1/6N1/2BP4/1QN1P3/PP3PPP/R1B1K2R b KQ -" : [66,[12, 20, null], "book"],
  "rnbq1rk1/ppp2pbp/4pnp1/3p4/2PP4/1QN1PN2/PP3PPP/R1B1KB1R w KQ -" : [-13,[61, 52, null], "book"],
  "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N1P3/PP3PPP/R1BQKBNR w KQkq -" : [40,[61, 52, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N2P2/PP2P1PP/R1BQKBNR b KQkq -" : [-14,[10, 26, null], "book"],
  "rnbqkb1r/pp2pp1p/5np1/2pp4/2PP4/2N2P2/PP2P1PP/R1BQKBNR w KQkq -" : [-37,[34, 27, null], "book"],
  "rnbqkb1r/pp2pp1p/5np1/2pP4/3P4/2N2P2/PP2P1PP/R1BQKBNR b KQkq -" : [-23,[21, 27, null], "book"],
  "rnbqkb1r/pp2pp1p/6p1/2pn4/3P4/2N2P2/PP2P1PP/R1BQKBNR w KQkq -" : [-20,[35, 26, null], "book"],
  "rnbqkb1r/pp2pp1p/6p1/2pn4/N2P4/5P2/PP2P1PP/R1BQKBNR b KQkq -" : [-48,[27, 10, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N3P1/PP2PP1P/R1BQKBNR b KQkq -" : [10,[27, 34, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP2P1/2N5/PP2PP1P/R1BQKBNR b KQkq -" : [-52,[2, 38, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP3P/2N5/PP2PPP1/R1BQKBNR b KQkq -" : [-41,[10, 26, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -" : [38,[5, 14, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -" : [37,[34, 27, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/3p4/2PP1B2/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [2,[4, 6, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP1B2/2N2N2/PP2PPPP/R2QKB1R w KQ -" : [11,[56, 58, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP1B2/2N1PN2/PP3PPP/R2QKB1R b KQ -" : [1,[10, 26, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/3p2B1/2PP4/2N2N2/PP2PPPP/R2QKB1R b KQkq -" : [0,[21, 36, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/3p4/Q1PP4/2N2N2/PP2PPPP/R1B1KB1R b KQkq -" : [-11,[2, 11, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/3p4/2PP4/1QN2N2/PP2PPPP/R1B1KB1R b KQkq -" : [40,[27, 34, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/8/2pP4/1QN2N2/PP2PPPP/R1B1KB1R w KQkq -" : [40,[41, 34, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/8/2QP4/2N2N2/PP2PPPP/R1B1KB1R b KQkq -" : [22,[4, 6, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/8/2QP4/2N2N2/PP2PPPP/R1B1KB1R w KQ -" : [34,[52, 36, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/8/2QPP3/2N2N2/PP3PPP/R1B1KB1R b KQ -" : [28,[8, 16, null], "book"],
  "rnbq1rk1/1pp1ppbp/p4np1/8/2QPP3/2N2N2/PP3PPP/R1B1KB1R w KQ -" : [16,[61, 52, null], "book"],
  "rnbq1rk1/p1p1ppbp/1p3np1/8/2QPP3/2N2N2/PP3PPP/R1B1KB1R w KQ -" : [140,[36, 28, null], "book"],
  "rn1q1rk1/ppp1ppbp/5np1/8/2QPP1b1/2N2N2/PP3PPP/R1B1KB1R w KQ -" : [59,[58, 44, null], "book"],
  "rn1q1rk1/ppp1ppbp/5np1/8/2QPP1b1/2N2N2/PP2BPPP/R1B1K2R b KQ -" : [44,[21, 11, null], "book"],
  "rn1q1rk1/pppnppbp/6p1/8/2QPP1b1/2N2N2/PP2BPPP/R1B1K2R w KQ -" : [56,[58, 44, null], "book"],
  "rn1q1rk1/ppp1ppbp/5np1/8/2QPP1b1/2N1BN2/PP3PPP/R3KB1R b KQ -" : [61,[21, 11, null], "book"],
  "rn1q1rk1/pppnppbp/6p1/8/2QPP1b1/2N1BN2/PP3PPP/R3KB1R w KQ -" : [70,[34, 41, null], "book"],
  "rn1q1rk1/pppnppbp/6p1/8/3PP1b1/1QN1BN2/PP3PPP/R3KB1R b KQ -" : [60,[11, 17, null], "book"],
  "rn1q1rk1/pp1nppbp/6p1/2p5/3PP1b1/1QN1BN2/PP3PPP/R3KB1R w KQ -" : [67,[35, 27, null], "book"],
  "rnbq1rk1/pp2ppbp/2p2np1/8/2QPP3/2N2N2/PP3PPP/R1B1KB1R w KQ -" : [50,[61, 52, null], "book"],
  "r1bq1rk1/ppp1ppbp/n4np1/8/2QPP3/2N2N2/PP3PPP/R1B1KB1R w KQ -" : [54,[36, 28, null], "book"],
  "r1bq1rk1/ppp1ppbp/2n2np1/8/2QPP3/2N2N2/PP3PPP/R1B1KB1R w KQ -" : [42,[55, 47, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/1QN5/PP2PPPP/R1B1KBNR b KQkq -" : [0,[27, 34, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq -" : [37,[5, 14, null], "book"],
  "rnbqk2r/ppppppbp/5np1/8/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [32,[57, 42, null], "book"],
  "rnbqk2r/ppppppbp/5np1/8/1PPP4/5N2/P3PPPP/RNBQKB1R b KQkq -" : [-25,[11, 19, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq -" : [74,[34, 27, null], "book"],
  "r1bqkb1r/pppppppp/2n2n2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -" : [65,[62, 45, null], "book"],
  "r1bqkb1r/pppppppp/2n2n2/3P4/2P5/8/PP2PPPP/RNBQKBNR b KQkq -" : [61,[18, 28, null], "book"],
  "r1bqkb1r/pppppppp/5n2/3Pn3/2P5/8/PP2PPPP/RNBQKBNR w KQkq -" : [47,[52, 36, null], "book"],
  "r1bqkb1r/pppppppp/5n2/3Pn3/2P2P2/8/PP2P1PP/RNBQKBNR b KQkq -" : [-60,[28, 34, null], "book"],
  "r1bqkb1r/pppppppp/2n2n2/8/2PP4/6P1/PP2PP1P/RNBQKBNR b KQkq -" : [14,[11, 27, null], "book"],
  "r1bqkb1r/ppp1pppp/2n2n2/3p4/2PP4/6P1/PP2PP1P/RNBQKBNR w KQkq -" : [10,[57, 42, null], "book"],
  "rnbqkb1r/pppppppp/5n2/3P4/8/8/PPP1PPPP/RNBQKBNR b KQkq -" : [-36,[10, 18, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -" : [-74,[21, 36, null], "book"],
  "rnbqkb1r/pppppppp/8/8/3Pn3/8/PPP2PPP/RNBQKBNR w KQkq -" : [-55,[62, 45, null], "book"],
  "rnbqkb1r/pppppppp/8/8/3Pn3/3B4/PPP2PPP/RNBQK1NR b KQkq -" : [-83,[11, 27, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/3P4/3B4/PPP2PPP/RNBQK1NR w KQkq -" : [-58,[50, 34, null], "book"],
  "rnbqkb1r/pppppppp/5n2/6B1/3P4/3B4/PPP2PPP/RN1QK1NR b KQkq -" : [-92,[11, 27, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/3P4/5P2/PPP1P1PP/RNBQKBNR b KQkq -" : [-57,[11, 27, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2p5/3P4/5P2/PPP1P1PP/RNBQKBNR w KQkq -" : [26,[35, 27, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2pP4/8/5P2/PPP1P1PP/RNBQKBNR b KQkq -" : [31,[12, 20, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/2pP4/8/5P2/PPP1P1PP/RNBQKBNR w KQkq -" : [37,[52, 36, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/2pP4/4P3/5P2/PPP3PP/RNBQKBNR b KQkq -" : [27,[20, 27, null], "book"],
  "rnbqkb1r/pp1p1ppp/5n2/2pp4/4P3/5P2/PPP3PP/RNBQKBNR w KQkq -" : [27,[36, 27, null], "book"],
  "rnbqkb1r/pp1p1ppp/5n2/2ppP3/8/5P2/PPP3PP/RNBQKBNR b KQkq -" : [-11,[3, 12, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/3P4/5P2/PPP1P1PP/RNBQKBNR w KQkq -" : [-62,[52, 36, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/3PP3/5P2/PPP3PP/RNBQKBNR b KQkq -" : [-55,[27, 36, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3pp3/3PP3/5P2/PPP3PP/RNBQKBNR w KQkq -" : [0,[35, 28, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3pP3/4P3/5P2/PPP3PP/RNBQKBNR b KQkq -" : [0,[21, 36, null], "book"],
  "rnbqkb1r/ppp2ppp/8/3pP3/4n3/5P2/PPP3PP/RNBQKBNR w KQkq -" : [0,[45, 36, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/3P2P1/5P2/PPP1P2P/RNBQKBNR b KQkq -" : [-105,[10, 26, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/8/3P4/5P2/PPP1P1PP/RNBQKBNR w KQkq -" : [38,[52, 36, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/8/3PP3/5P2/PPP3PP/RNBQKBNR b KQkq -" : [26,[11, 27, null], "book"],
  "rnbqkb1r/pppp1ppp/4p3/8/3Pn3/5P2/PPP3PP/RNBQKBNR w KQkq -" : [252,[45, 36, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/3P1P2/8/PPP1P1PP/RNBQKBNR b KQkq -" : [-49,[11, 27, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/3P4/6P1/PPP1PP1P/RNBQKBNR b KQkq -" : [3,[11, 27, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/3P4/6P1/PPP1PP1P/RNBQKBNR w KQkq -" : [77,[35, 28, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/3P2P1/8/PPP1PP1P/RNBQKBNR b KQkq -" : [-62,[21, 38, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/3P2P1/8/PPP1PP1P/RNBQKBNR w KQkq -" : [0,[61, 54, null], "book"],
  "rnbqkb1r/pppppppp/8/8/3P2n1/8/PPP1PP1P/RNBQKBNR w KQkq -" : [-62,[52, 36, null], "book"],
  "rnbqkb1r/pppppppp/8/8/3PP1n1/8/PPP2P1P/RNBQKBNR b KQkq -" : [-67,[11, 19, null], "book"],
  "rnbqkb1r/ppp1pppp/3p4/8/3PP1n1/8/PPP2P1P/RNBQKBNR w KQkq -" : [-63,[53, 45, null], "book"],
  "rnbqkb1r/ppp1pppp/3p4/8/3PP1n1/8/PPP1BP1P/RNBQK1NR b KQkq -" : [-65,[38, 21, null], "book"],
  "rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/8/PPP1BP1P/RNBQK1NR w KQkq -" : [-63,[57, 42, null], "book"],
  "rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/2N5/PPP1BP1P/R1BQK1NR b KQkq -" : [-60,[10, 18, null], "book"],
  "rnbqkb1r/pppppppp/8/8/3P2n1/5P2/PPP1P2P/RNBQKBNR b KQkq -" : [-87,[38, 21, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/3P4/5P2/PPP1P2P/RNBQKBNR w KQkq -" : [-106,[52, 36, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/3PP3/5P2/PPP4P/RNBQKBNR b KQkq -" : [-98,[11, 27, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/3P4/2N5/PPP1PPPP/R1BQKBNR b KQkq -" : [1,[11, 27, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2p5/3P4/2N5/PPP1PPPP/R1BQKBNR w KQkq -" : [72,[35, 27, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2P5/8/2N5/PPP1PPPP/R1BQKBNR b KQkq -" : [18,[12, 20, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pp2B1/3P4/2N5/PPP1PPPP/R2QKBNR w KQkq -" : [3,[30, 21, null], "book"],
  "rnbqkb1r/pp2pppp/5B2/2pp4/3P4/2N5/PPP1PPPP/R2QKBNR b KQkq -" : [-12,[14, 21, null], "book"],
  "rnbqkb1r/pp2pp1p/5p2/2pp4/3P4/2N5/PPP1PPPP/R2QKBNR w KQkq -" : [-1,[52, 44, null], "book"],
  "rnbqkb1r/pp2pp1p/5p2/2pp4/3PP3/2N5/PPP2PPP/R2QKBNR b KQkq -" : [-28,[27, 36, null], "book"],
  "rnbqkb1r/pp2pp1p/5p2/2p5/3Pp3/2N5/PPP2PPP/R2QKBNR w KQkq -" : [-22,[35, 26, null], "book"],
  "rnbqkb1r/pp2pp1p/5p2/2pP4/4p3/2N5/PPP2PPP/R2QKBNR b KQkq -" : [-108,[21, 29, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/3P4/2N5/PPP1PPPP/R1BQKBNR w KQkq -" : [169,[35, 28, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPPNPPPP/R1BQKBNR b KQkq -" : [4,[11, 27, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/3P4/8/PPPNPPPP/R1BQKBNR w KQkq -" : [59,[35, 28, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq -" : [27,[11, 27, null], "book"],
  "rnbqkb1r/p1pppppp/5n2/1p6/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [81,[52, 36, null], "book"],
  "rnbqkb1r/p1pppppp/1p3n2/8/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [54,[54, 46, null], "book"],
  "rnbqkb1r/p1pppppp/1p3n2/6B1/3P4/5N2/PPP1PPPP/RN1QKB1R b KQkq -" : [29,[2, 9, null], "book"],
  "rnbqkb1r/p1pppppp/1p3n2/8/3P4/2P2N2/PP2PPPP/RNBQKB1R b KQkq -" : [11,[2, 9, null], "book"],
  "rnbqkb1r/p1pp1ppp/1p3n2/4p3/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq -" : [208,[35, 28, null], "book"],
  "rnbqkb1r/p1pppppp/1p3n2/8/3P4/5NP1/PPP1PP1P/RNBQKB1R b KQkq -" : [60,[12, 20, null], "book"],
  "rn1qkb1r/pbpppppp/1p3n2/8/3P4/5NP1/PPP1PP1P/RNBQKB1R w KQkq -" : [44,[50, 34, null], "book"],
  "rn1qkb1r/pbpppppp/1p3n2/8/3P4/5NP1/PPP1PPBP/RNBQK2R b KQkq -" : [20,[10, 26, null], "book"],
  "rn1qkb1r/pb1ppppp/1p3n2/2p5/3P4/5NP1/PPP1PPBP/RNBQK2R w KQkq -" : [24,[35, 26, null], "book"],
  "rn1qkb1r/pb1ppppp/1p3n2/2p5/2PP4/5NP1/PP2PPBP/RNBQK2R b KQkq -" : [16,[26, 35, null], "book"],
  "rn1qkb1r/pb1ppppp/1p3n2/8/2Pp4/5NP1/PP2PPBP/RNBQK2R w KQkq -" : [21,[59, 35, null], "book"],
  "rn1qkb1r/pb1ppppp/1p3n2/8/2PQ4/5NP1/PP2PPBP/RNB1K2R b KQkq -" : [22,[1, 18, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2p5/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [65,[35, 27, null], "book"],
  "rnbqkb1r/p2ppppp/5n2/1ppP4/8/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [58,[50, 34, null], "book"],
  "rnbqkb1r/pp1ppppp/2p2n2/8/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [33,[50, 34, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/8/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [32,[50, 34, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/8/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq -" : [21,[11, 27, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/6B1/3P4/5N2/PPP1PPPP/RN1QKB1R b KQkq -" : [23,[15, 23, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/2p3B1/3P4/5N2/PPP1PPPP/RN1QKB1R w KQkq -" : [35,[35, 27, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/2p3B1/3P4/4PN2/PPP2PPP/RN1QKB1R b KQkq -" : [32,[11, 27, null], "book"],
  "rnbqkb1r/p2p1ppp/1p2pn2/2p3B1/3P4/4PN2/PPP2PPP/RN1QKB1R w KQkq -" : [72,[35, 27, null], "book"],
  "rnbqkb1r/p2p1ppp/1p2pn2/2pP2B1/8/4PN2/PPP2PPP/RN1QKB1R b KQkq -" : [81,[15, 23, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/2p3B1/3PP3/5N2/PPP2PPP/RN1QKB1R b KQkq -" : [-8,[26, 35, null], "book"],
  "rnbqkb1r/pppp1pp1/4pn1p/6B1/3P4/5N2/PPP1PPPP/RN1QKB1R w KQkq -" : [9,[30, 21, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/8/3P4/4PN2/PPP2PPP/RNBQKB1R b KQkq -" : [9,[11, 27, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [36,[50, 34, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq -" : [17,[5, 14, null], "book"],
  "rnbqk2r/ppppppbp/5np1/8/3P1B2/5N2/PPP1PPPP/RN1QKB1R w KQkq -" : [17,[52, 44, null], "book"],
  "rnbqk2r/ppppppbp/5np1/8/3P1B2/5N2/PPPNPPPP/R2QKB1R b KQkq -" : [-6,[21, 31, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/6B1/3P4/5N2/PPP1PPPP/RN1QKB1R b KQkq -" : [11,[5, 14, null], "book"],
  "rnbqk2r/ppppppbp/5np1/6B1/3P4/5N2/PPP1PPPP/RN1QKB1R w KQkq -" : [11,[52, 44, null], "book"],
  "rnbqk2r/ppppppbp/5np1/6B1/3P4/5N2/PPPNPPPP/R2QKB1R b KQkq -" : [11,[10, 26, null], "book"],
  "rnbqk2r/pp1pppbp/5np1/2p3B1/3P4/5N2/PPPNPPPP/R2QKB1R w KQkq -" : [16,[52, 44, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/3P4/4PN2/PPP2PPP/RNBQKB1R b KQkq -" : [24,[5, 14, null], "book"],
  "rnbqk2r/ppppppbp/5np1/8/3P4/4PN2/PPP2PPP/RNBQKB1R w KQkq -" : [37,[50, 34, null], "book"],
  "rnbqk2r/ppppppbp/5np1/8/3P4/3BPN2/PPP2PPP/RNBQK2R b KQkq -" : [0,[10, 26, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/3P4/3BPN2/PPP2PPP/RNBQK2R w KQkq -" : [24,[60, 62, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/3P4/5NP1/PPP1PP1P/RNBQKB1R b KQkq -" : [25,[11, 27, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/3P4/2N2N2/PPP1PPPP/R1BQKB1R b KQkq -" : [3,[11, 27, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3p4/3P4/2N2N2/PPP1PPPP/R1BQKB1R w KQkq -" : [21,[58, 37, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3p4/3P1B2/2N2N2/PPP1PPPP/R2QKB1R b KQkq -" : [0,[5, 14, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/3p4/3P1B2/2N2N2/PPP1PPPP/R2QKB1R w KQkq -" : [9,[52, 44, null], "book"],
  "rnbqk2r/ppp1ppbp/5np1/3p4/3P1B2/2N1PN2/PPP2PPP/R2QKB1R b KQkq -" : [11,[4, 6, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/3p4/3P1B2/2N1PN2/PPP2PPP/R2QKB1R w KQ -" : [0,[42, 25, null], "book"],
  "rnbq1rk1/ppp1ppbp/5np1/3p4/3P1B2/2N1PN2/PPP1BPPP/R2QK2R b KQ -" : [0,[10, 26, null], "book"],
  "rnbqkb1r/pppppppp/8/8/3Pn3/5N2/PPP1PPPP/RNBQKB1R w KQkq -" : [57,[50, 34, null], "book"],
  "rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq -" : [12,[12, 28, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/8/4P3/PPPP1PPP/RNBQKBNR w KQkq -" : [13,[51, 35, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/8/2N1P3/PPPP1PPP/R1BQKBNR b KQkq -" : [-28,[6, 21, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/8/2N1P3/PPPP1PPP/R1BQKBNR w KQkq -" : [-28,[62, 45, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/8/P1N1P3/1PPP1PPP/R1BQKBNR b KQkq -" : [-62,[12, 28, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3pp3/8/P1N1P3/1PPP1PPP/R1BQKBNR w KQkq -" : [-63,[51, 35, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3pp3/5P2/P1N1P3/1PPP2PP/R1BQKBNR b KQkq -" : [-147,[28, 37, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3p4/5p2/P1N1P3/1PPP2PP/R1BQKBNR w KQkq -" : [-140,[51, 35, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3p4/5p2/P1N1PN2/1PPP2PP/R1BQKB1R b KQkq -" : [-160,[37, 44, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/4P3/PPPP1PPP/RNBQKBNR w KQkq -" : [18,[51, 35, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/2B5/4P3/PPPP1PPP/RNBQK1NR b KQkq -" : [-65,[11, 27, null], "book"],
  "rnbqkbnr/p1pp1ppp/8/1p2p3/2B5/4P3/PPPP1PPP/RNBQK1NR w KQkq -" : [105,[34, 25, null], "book"],
  "rnbqkbnr/p1pp1ppp/8/1p2p3/8/1B2P3/PPPP1PPP/RNBQK1NR b KQkq -" : [-55,[2, 9, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/4p3/2P5/4P3/PP1P1PPP/RNBQKBNR w KQkq -" : [34,[57, 42, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/4p3/2P5/2N1P3/PP1P1PPP/R1BQKBNR b KQkq -" : [29,[14, 22, null], "book"],
  "r1bqkbnr/ppp2ppp/2np4/4p3/2P5/2N1P3/PP1P1PPP/R1BQKBNR w KQkq -" : [52,[51, 35, null], "book"],
  "r1bqkbnr/ppp2ppp/2np4/4p3/2P5/1PN1P3/P2P1PPP/R1BQKBNR b KQkq -" : [14,[6, 21, null], "book"],
  "r1bqkb1r/ppp2ppp/2np1n2/4p3/2P5/1PN1P3/P2P1PPP/R1BQKBNR w KQkq -" : [23,[58, 49, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/2N1P3/PPPP1PPP/R1BQKBNR b KQkq -" : [-15,[1, 18, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/8/2N1P3/PPPP1PPP/R1BQKBNR w KQkq -" : [-13,[59, 31, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/5P2/2N1P3/PPPP2PP/R1BQKBNR b KQkq -" : [-97,[28, 37, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3p4/5p2/2N1P3/PPPP2PP/R1BQKBNR w KQkq -" : [-100,[44, 37, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3p4/5p2/2N1PN2/PPPP2PP/R1BQKB1R b KQkq -" : [-119,[6, 21, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/8/2N1P3/PPPP1PPP/R1BQKBNR w KQkq -" : [25,[51, 35, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/5P2/2N1P3/PPPP2PP/R1BQKBNR b KQkq -" : [-55,[28, 37, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/5p2/2N1P3/PPPP2PP/R1BQKBNR w KQkq -" : [-56,[44, 37, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/5p2/2N1PN2/PPPP2PP/R1BQKB1R b KQkq -" : [-87,[37, 44, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/8/2N1P3/PPPP1PPP/R1BQKBNR w KQkq -" : [18,[51, 35, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/5P2/2N1P3/PPPP2PP/R1BQKBNR b KQkq -" : [-123,[28, 37, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/8/5p2/2N1P3/PPPP2PP/R1BQKBNR w KQkq -" : [-99,[51, 35, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/8/5p2/2N1PN2/PPPP2PP/R1BQKB1R b KQkq -" : [-107,[11, 27, null], "book"],
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -" : [38,[10, 26, null], "book"],
  "rnbqkbnr/1ppppppp/8/p7/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [93,[51, 35, null], "book"],
  "rnbqkbnr/1ppppppp/8/p7/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -" : [79,[10, 18, null], "book"],
  "r1bqkbnr/1ppppppp/2n5/p7/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [113,[62, 45, null], "book"],
  "rnbqkbnr/1ppppppp/p7/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [68,[51, 35, null], "book"],
  "rnbqkbnr/1ppppppp/p7/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -" : [63,[11, 19, null], "book"],
  "rnbqkbnr/2pppppp/p7/1p6/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [97,[57, 51, null], "book"],
  "rnbqkbnr/2pppppp/p7/1p6/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [96,[12, 20, null], "book"],
  "rn1qkbnr/1bpppppp/p7/1p6/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [101,[57, 51, null], "book"],
  "rn1qkbnr/1bpppppp/p7/1p6/3PP3/3B1N2/PPP2PPP/RNBQK2R b KQkq -" : [83,[12, 20, null], "book"],
  "rn1qkbnr/1bp1pppp/p2p4/1p6/3PP3/3B1N2/PPP2PPP/RNBQK2R w KQkq -" : [124,[60, 62, null], "book"],
  "rn1qkbnr/1bp1pppp/p2p4/1p6/3PP3/3B1N2/PPP2PPP/RNBQ1RK1 b kq -" : [124,[1, 11, null], "book"],
  "rn1qkbnr/1bp1pp1p/p2p2p1/1p6/3PP3/3B1N2/PPP2PPP/RNBQ1RK1 w kq -" : [157,[48, 32, null], "book"],
  "rn1qkbnr/1bp1pp1p/p2p2p1/1p6/3PP3/2PB1N2/PP3PPP/RNBQ1RK1 b kq -" : [119,[5, 14, null], "book"],
  "rn1qk1nr/1bp1ppbp/p2p2p1/1p6/3PP3/2PB1N2/PP3PPP/RNBQ1RK1 w kq -" : [104,[48, 32, null], "book"],
  "rn1qkbnr/1bpp1ppp/p3p3/1p6/3PP3/3B1N2/PPP2PPP/RNBQK2R w KQkq -" : [104,[60, 62, null], "book"],
  "rnbqkbnr/1ppp1ppp/p7/4p3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [118,[35, 28, null], "book"],
  "rnbqkbnr/1ppp1ppp/p3p3/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [67,[61, 43, null], "book"],
  "rnbqkbnr/1ppp1ppp/p3p3/8/2PPP3/8/PP3PPP/RNBQKBNR b KQkq -" : [40,[11, 27, null], "book"],
  "r1bqkbnr/1ppppppp/p1n5/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [87,[35, 27, null], "book"],
  "rnbqkbnr/p1pppppp/1p6/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [88,[51, 35, null], "book"],
  "rnbqkbnr/p1pppppp/1p6/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -" : [85,[12, 20, null], "book"],
  "rn1qkbnr/p1pppppp/bp6/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [145,[61, 16, null], "book"],
  "rn1qkbnr/pbpppppp/1p6/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [90,[61, 43, null], "book"],
  "rn1qkbnr/pbpppppp/1p6/8/3PP3/3B4/PPP2PPP/RNBQK1NR b KQkq -" : [96,[6, 21, null], "book"],
  "rn1qkbnr/pbppp1pp/1p6/5p2/3PP3/3B4/PPP2PPP/RNBQK1NR w KQkq -" : [143,[36, 29, null], "book"],
  "rn1qkbnr/pbppp1pp/1p6/5P2/3P4/3B4/PPP2PPP/RNBQK1NR b KQkq -" : [168,[9, 54, null], "book"],
  "rn1qkbnr/p1ppp1pp/1p6/5P2/3P4/3B4/PPP2PbP/RNBQK1NR w KQkq -" : [220,[59, 31, null], "book"],
  "rn1qkbnr/p1ppp1pp/1p6/5P1Q/3P4/3B4/PPP2PbP/RNB1K1NR b KQkq -" : [257,[14, 22, null], "book"],
  "rn1qkbnr/p1ppp2p/1p4p1/5P1Q/3P4/3B4/PPP2PbP/RNB1K1NR w KQkq -" : [268,[29, 22, null], "book"],
  "rn1qkbnr/pbpppppp/1p6/6B1/3PP3/8/PPP2PPP/RN1QKBNR b KQkq -" : [-41,[9, 36, null], "book"],
  "rn1qkbnr/pbpppppp/1p6/8/3PP3/5P2/PPP3PP/RNBQKBNR b KQkq -" : [38,[11, 27, null], "book"],
  "rn1qkbnr/pbpp1ppp/1p6/4p3/3PP3/5P2/PPP3PP/RNBQKBNR w KQkq -" : [86,[35, 28, null], "book"],
  "rn1qkbnr/pbpppppp/1p6/8/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [-60,[9, 36, null], "book"],
  "rnbqkbnr/p2ppppp/1p6/2p5/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [123,[35, 27, null], "book"],
  "rnbqkbnr/p2ppppp/1p6/2P5/4P3/8/PPP2PPP/RNBQKBNR b KQkq -" : [88,[17, 26, null], "book"],
  "r1bqkbnr/p2ppppp/1pn5/2P5/4P3/8/PPP2PPP/RNBQKBNR w KQkq -" : [132,[26, 17, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [35,[62, 45, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/P7/1PPP1PPP/RNBQKBNR b KQkq -" : [-11,[14, 22, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/P7/1PPP1PPP/RNBQKBNR w KQkq -" : [11,[62, 45, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/2p5/1P2P3/P7/2PP1PPP/RNBQKBNR b KQkq -" : [-29,[12, 20, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/1P6/P1PP1PPP/RNBQKBNR b KQkq -" : [-16,[1, 18, null], "book"],
  "rnbqkbnr/p2ppppp/1p6/2p5/4P3/1P6/P1PP1PPP/RNBQKBNR w KQkq -" : [56,[58, 49, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/1P2P3/8/P1PP1PPP/RNBQKBNR b KQkq -" : [-47,[26, 33, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/1p2P3/8/P1PP1PPP/RNBQKBNR w KQkq -" : [-53,[48, 40, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/1p2P3/P7/2PP1PPP/RNBQKBNR b KQkq -" : [-49,[11, 27, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/4P3/p7/2PP1PPP/RNBQKBNR w KQkq -" : [-36,[51, 35, null], "book"],
  "rnbqkbnr/pp2pppp/8/3p4/1p2P3/P7/2PP1PPP/RNBQKBNR w KQkq -" : [-50,[36, 27, null], "book"],
  "rnbqkbnr/pp2pppp/8/3P4/1p6/P7/2PP1PPP/RNBQKBNR b KQkq -" : [-34,[3, 27, null], "book"],
  "rnb1kbnr/pp2pppp/8/3q4/1p6/P7/2PP1PPP/RNBQKBNR w KQkq -" : [-42,[62, 45, null], "book"],
  "rnb1kbnr/pp2pppp/8/3q4/1p6/P7/1BPP1PPP/RN1QKBNR b KQkq -" : [-66,[1, 18, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/1p2P3/8/PBPP1PPP/RN1QKBNR b KQkq -" : [-58,[6, 21, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/1pP1P3/8/P2P1PPP/RNBQKBNR b KQkq c3" : [-101,[12, 28, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq -" : [0,[12, 20, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPPBPPP/RNBQK1NR b KQkq -" : [0,[1, 18, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR b KQkq -" : [31,[6, 21, null], "book"],
  "rnbqkbnr/pp2pppp/8/2pp4/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq -" : [34,[36, 27, null], "book"],
  "rnbqkbnr/pp2pppp/8/2pP4/8/2P5/PP1P1PPP/RNBQKBNR b KQkq -" : [31,[3, 27, null], "book"],
  "rnb1kbnr/pp2pppp/8/2pq4/8/2P5/PP1P1PPP/RNBQKBNR w KQkq -" : [23,[51, 35, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq -" : [17,[36, 28, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2p1P3/8/2P5/PP1P1PPP/RNBQKBNR b KQkq -" : [16,[21, 27, null], "book"],
  "rnbqkb1r/pp1ppppp/8/2pnP3/8/2P5/PP1P1PPP/RNBQKBNR w KQkq -" : [19,[62, 45, null], "book"],
  "rnbqkb1r/pp1ppppp/8/2pnP3/3P4/2P5/PP3PPP/RNBQKBNR b KQkq -" : [21,[26, 35, null], "book"],
  "rnbqkb1r/pp1p1ppp/4p3/2pnP3/3P4/2P5/PP3PPP/RNBQKBNR w KQkq -" : [62,[42, 34, null], "book"],
  "rnbqkb1r/pp1p1ppp/4p3/2pnP3/3P4/2P2N2/PP3PPP/RNBQKB1R b KQkq -" : [37,[26, 35, null], "book"],
  "r1bqkb1r/pp1p1ppp/2n1p3/2pnP3/3P4/2P2N2/PP3PPP/RNBQKB1R w KQkq -" : [122,[42, 34, null], "book"],
  "rnbqkb1r/pp1ppppp/8/2pnP3/8/2P2N2/PP1P1PPP/RNBQKB1R b KQkq -" : [23,[11, 19, null], "book"],
  "r1bqkb1r/pp1ppppp/2n5/2pnP3/8/2P2N2/PP1P1PPP/RNBQKB1R w KQkq -" : [31,[61, 34, null], "book"],
  "r1bqkb1r/pp1ppppp/2n5/2pnP3/2B5/2P2N2/PP1P1PPP/RNBQK2R b KQkq -" : [21,[27, 17, null], "book"],
  "r1bqkb1r/pp1ppppp/1nn5/2p1P3/2B5/2P2N2/PP1P1PPP/RNBQK2R w KQkq -" : [29,[34, 41, null], "book"],
  "r1bqkb1r/pp1ppppp/1nn5/2p1P3/8/1BP2N2/PP1P1PPP/RNBQK2R b KQkq -" : [31,[11, 19, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/2P1P3/8/PP1P1PPP/RNBQKBNR b KQkq -" : [9,[1, 18, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/2p5/2P1P3/8/PP1P1PPP/RNBQKBNR w KQkq -" : [23,[62, 52, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/2p5/2P1P3/2N5/PP1P1PPP/R1BQKBNR b KQkq -" : [0,[1, 18, null], "book"],
  "r1bqkbnr/pp2pppp/2np4/2p5/2P1P3/2N5/PP1P1PPP/R1BQKBNR w KQkq -" : [1,[62, 52, null], "book"],
  "r1bqkbnr/pp2pppp/2np4/2p5/2P1P3/2N3P1/PP1P1P1P/R1BQKBNR b KQkq -" : [-24,[8, 16, null], "book"],
  "r1bqkbnr/pp2ppp1/2np4/2p4p/2P1P3/2N3P1/PP1P1P1P/R1BQKBNR w KQkq -" : [12,[55, 47, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/3P4/PPP2PPP/RNBQKBNR b KQkq -" : [-3,[1, 18, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/3P4/PPP2PPP/RNBQKBNR w KQkq -" : [0,[54, 46, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/2PP4/PP3PPP/RNBQKBNR b KQkq -" : [-17,[12, 28, null], "book"],
  "r1bqkbnr/pp2pppp/2np4/2p5/4P3/2PP4/PP3PPP/RNBQKBNR w KQkq -" : [24,[43, 35, null], "book"],
  "r1bqkbnr/pp2pppp/2np4/2p5/4PP2/2PP4/PP4PP/RNBQKBNR b KQkq -" : [3,[6, 21, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -" : [22,[26, 35, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/3pP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [13,[62, 45, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/3pP3/2P5/PP3PPP/RNBQKBNR b KQkq -" : [-34,[35, 42, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/4P3/2Pp4/PP3PPP/RNBQKBNR w KQkq -" : [38,[61, 43, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/2P1P3/3p4/PP3PPP/RNBQKBNR b KQkq -" : [41,[12, 28, null], "book"],
  "rnbqkbnr/pp2pppp/8/3p4/3pP3/2P5/PP3PPP/RNBQKBNR w KQkq -" : [35,[36, 27, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/4P3/2p5/PP3PPP/RNBQKBNR w KQkq -" : [-22,[57, 42, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/4P3/2N5/PP3PPP/R1BQKBNR b KQkq -" : [-35,[12, 20, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/8/4P3/2N5/PP3PPP/R1BQKBNR w KQkq -" : [-25,[62, 45, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/8/2B1P3/2N5/PP3PPP/R1BQK1NR b KQkq -" : [-40,[12, 20, null], "book"],
  "rnbqkbnr/pp3ppp/3pp3/8/2B1P3/2N5/PP3PPP/R1BQK1NR w KQkq -" : [-30,[62, 45, null], "book"],
  "rnbqkbnr/pp3ppp/3pp3/8/2B1P3/2N2N2/PP3PPP/R1BQK2R b KQkq -" : [-28,[1, 18, null], "book"],
  "rnbqkb1r/pp3ppp/3ppn2/8/2B1P3/2N2N2/PP3PPP/R1BQK2R w KQkq -" : [-32,[36, 28, null], "book"],
  "rnbqkb1r/pp3ppp/3ppn2/8/2B1P3/2N2N2/PP3PPP/R1BQ1RK1 b kq -" : [-14,[1, 18, null], "book"],
  "rnbqkb1r/1p3ppp/p2ppn2/8/2B1P3/2N2N2/PP3PPP/R1BQ1RK1 w kq -" : [0,[36, 28, null], "book"],
  "rnbqkbnr/pp1p1ppp/4p3/8/4P3/2N5/PP3PPP/R1BQKBNR w KQkq -" : [-30,[62, 45, null], "book"],
  "rnbqkbnr/pp1p1ppp/4p3/8/2B1P3/2N5/PP3PPP/R1BQK1NR b KQkq -" : [-41,[8, 16, null], "book"],
  "rnbqkbnr/1p1p1ppp/p3p3/8/2B1P3/2N5/PP3PPP/R1BQK1NR w KQkq -" : [-41,[62, 45, null], "book"],
  "rnbqkbnr/1p1p1ppp/p3p3/8/2B1P3/2N2N2/PP3PPP/R1BQK2R b KQkq -" : [-42,[9, 25, null], "book"],
  "rnbqkb1r/1p1pnppp/p3p3/8/2B1P3/2N2N2/PP3PPP/R1BQK2R w KQkq -" : [-34,[34, 41, null], "book"],
  "rnbqkbnr/pp1p1ppp/4p3/8/4P3/2N2N2/PP3PPP/R1BQKB1R b KQkq -" : [-34,[1, 18, null], "book"],
  "rnbqkbnr/1p1p1ppp/p3p3/8/4P3/2N2N2/PP3PPP/R1BQKB1R w KQkq -" : [-12,[61, 52, null], "book"],
  "rnbqkbnr/pp1p1p1p/4p1p1/8/4P3/2N2N2/PP3PPP/R1BQKB1R w KQkq -" : [82,[58, 30, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/8/4P3/2N5/PP3PPP/R1BQKBNR w KQkq -" : [-22,[61, 34, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/8/4P3/2N2N2/PP3PPP/R1BQKB1R b KQkq -" : [-27,[11, 19, null], "book"],
  "r1bqkbnr/pp2pppp/2np4/8/4P3/2N2N2/PP3PPP/R1BQKB1R w KQkq -" : [-21,[61, 34, null], "book"],
  "r1bqkbnr/pp2pppp/2np4/8/2B1P3/2N2N2/PP3PPP/R1BQK2R b KQkq -" : [-26,[12, 20, null], "book"],
  "r1bqkbnr/1p2pppp/p1np4/8/2B1P3/2N2N2/PP3PPP/R1BQK2R w KQkq -" : [-28,[60, 62, null], "book"],
  "r1bqkbnr/1p2pppp/p1np4/8/2B1P3/2N2N2/PP3PPP/R1BQ1RK1 b kq -" : [-14,[12, 20, null], "book"],
  "r1bqkb1r/1p2pppp/p1np1n2/8/2B1P3/2N2N2/PP3PPP/R1BQ1RK1 w kq -" : [-22,[58, 37, null], "book"],
  "r1bqkbnr/pp3ppp/2npp3/8/2B1P3/2N2N2/PP3PPP/R1BQK2R w KQkq -" : [-26,[60, 62, null], "book"],
  "r1bqkbnr/pp1p1ppp/2n1p3/8/4P3/2N2N2/PP3PPP/R1BQKB1R w KQkq -" : [-37,[58, 37, null], "book"],
  "r1bqkbnr/pp1p1ppp/2n1p3/8/2B1P3/2N2N2/PP3PPP/R1BQK2R b KQkq -" : [-37,[8, 16, null], "book"],
  "r1bqkbnr/1p1p1ppp/p1n1p3/8/2B1P3/2N2N2/PP3PPP/R1BQK2R w KQkq -" : [-42,[59, 52, null], "book"],
  "r1bqkbnr/1p1p1ppp/p1n1p3/8/2B1P3/2N2N2/PP3PPP/R1BQ1RK1 b kq -" : [-26,[9, 25, null], "book"],
  "r1bqkbnr/3p1ppp/p1n1p3/1p6/2B1P3/2N2N2/PP3PPP/R1BQ1RK1 w kq -" : [-34,[34, 43, null], "book"],
  "r1bqkbnr/3p1ppp/p1n1p3/1p6/4P3/1BN2N2/PP3PPP/R1BQ1RK1 b kq -" : [-75,[2, 9, null], "book"],
  "r1bqk1nr/3p1ppp/p1n1p3/1pb5/4P3/1BN2N2/PP3PPP/R1BQ1RK1 w kq -" : [14,[36, 28, null], "book"],
  "r1b1kbnr/1pqp1ppp/p1n1p3/8/2B1P3/2N2N2/PP3PPP/R1BQ1RK1 w kq -" : [44,[61, 60, null], "book"],
  "r1b1kbnr/1pqp1ppp/p1n1p3/8/2B1P3/2N2N2/PP2QPPP/R1B2RK1 b kq -" : [-31,[5, 26, null], "book"],
  "r1b1k1nr/1pqp1ppp/p1nbp3/8/2B1P3/2N2N2/PP2QPPP/R1B2RK1 w kq -" : [-1,[61, 59, null], "book"],
  "r1bqk1nr/pp1p1ppp/2n1p3/8/1bB1P3/2N2N2/PP3PPP/R1BQK2R w KQkq -" : [-28,[60, 62, null], "book"],
  "r1bqk1nr/pp1p1ppp/2n1p3/2b5/2B1P3/2N2N2/PP3PPP/R1BQK2R w KQkq -" : [-4,[60, 62, null], "book"],
  "r1bqkbnr/pp3ppp/2npp3/8/2B1P3/2N2N2/PP3PPP/R1BQ1RK1 b kq -" : [-27,[6, 21, null], "book"],
  "r1bqkbnr/1p3ppp/p1npp3/8/2B1P3/2N2N2/PP3PPP/R1BQ1RK1 w kq -" : [-19,[59, 52, null], "book"],
  "r1bqkbnr/1p3ppp/p1npp3/8/2B1P3/2N2N2/PP2QPPP/R1B2RK1 b kq -" : [-16,[5, 12, null], "book"],
  "r1bqkbnr/5ppp/p1npp3/1p6/2B1P3/2N2N2/PP2QPPP/R1B2RK1 w kq -" : [38,[34, 41, null], "book"],
  "rnbqkbnr/pp1p1ppp/8/4p3/3pP3/2P5/PP3PPP/RNBQKBNR w KQkq -" : [24,[62, 45, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/8/3pP3/2P5/PP3PPP/RNBQKBNR w KQkq -" : [17,[36, 28, null], "book"],
  "rnb1kbnr/pp1ppppp/8/q7/3pP3/2P5/PP3PPP/RNBQKBNR w KQkq -" : [31,[58, 51, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/3pPP2/8/PPP3PP/RNBQKBNR b KQkq -" : [-65,[1, 18, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/3pP3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [22,[12, 28, null], "book"],
  "rnbqkbnr/pp1p1ppp/8/4p3/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [38,[50, 42, null], "book"],
  "rnbqkbnr/pp1p1ppp/8/4p3/3pP3/2P2N2/PP3PPP/RNBQKB1R b KQkq -" : [23,[1, 18, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/4PP2/8/PPPP2PP/RNBQKBNR b KQkq -" : [-12,[12, 20, null], "book"],
  "rnbqkbnr/pp2pppp/8/2pp4/4PP2/8/PPPP2PP/RNBQKBNR w KQkq -" : [6,[36, 27, null], "book"],
  "rnbqkbnr/pp2pppp/8/2pP4/5P2/8/PPPP2PP/RNBQKBNR b KQkq -" : [0,[6, 21, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2pP4/5P2/8/PPPP2PP/RNBQKBNR w KQkq -" : [-16,[61, 25, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/6P1/PPPP1P1P/RNBQKBNR b KQkq -" : [-4,[14, 22, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/4P2P/8/PPPP1PP1/RNBQKBNR b KQkq -" : [-27,[1, 18, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPPKPPP/RNBQ1BNR b kq -" : [-77,[14, 22, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq -" : [34,[14, 22, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/2p5/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq -" : [39,[62, 45, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/2p5/4PP2/2N5/PPPP2PP/R1BQKBNR b KQkq -" : [12,[1, 18, null], "book"],
  "rnbqkbnr/pp1p1ppp/4p3/2p5/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq -" : [32,[62, 45, null], "book"],
  "rnbqkbnr/pp1p1ppp/4p3/2p5/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [28,[26, 35, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/2pp4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [109,[36, 27, null], "book"],
  "rnbqkbnr/pp1p1ppp/4p3/2p5/4P3/2N3P1/PPPP1P1P/R1BQKBNR b KQkq -" : [-7,[11, 27, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/2pp4/4P3/2N3P1/PPPP1P1P/R1BQKBNR w KQkq -" : [-6,[36, 27, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq -" : [27,[62, 45, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/2NP4/PPP2PPP/R1BQKBNR b KQkq -" : [-1,[12, 20, null], "book"],
  "r1bqkbnr/pp1ppp1p/2n3p1/2p5/4P3/2NP4/PPP2PPP/R1BQKBNR w KQkq -" : [-9,[54, 46, null], "book"],
  "r1bqkbnr/pp1ppp1p/2n3p1/2p5/4P1P1/2NP4/PPP2P1P/R1BQKBNR b KQkq -" : [-54,[5, 14, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/2p5/4PP2/2N5/PPPP2PP/R1BQKBNR b KQkq -" : [-19,[14, 22, null], "book"],
  "r1bqkbnr/pp1ppp1p/2n3p1/2p5/4PP2/2N5/PPPP2PP/R1BQKBNR w KQkq -" : [-15,[62, 45, null], "book"],
  "r1bqkbnr/pp1ppp1p/2n3p1/2p5/4PP2/2N2N2/PPPP2PP/R1BQKB1R b KQkq -" : [-22,[5, 14, null], "book"],
  "r1bqk1nr/pp1pppbp/2n3p1/2p5/4PP2/2N2N2/PPPP2PP/R1BQKB1R w KQkq -" : [-22,[61, 25, null], "book"],
  "r1bqk1nr/pp1pppbp/2n3p1/2p5/2B1PP2/2N2N2/PPPP2PP/R1BQK2R b KQkq -" : [-39,[12, 20, null], "book"],
  "r1bqk1nr/pp1p1pbp/2n1p1p1/2p5/2B1PP2/2N2N2/PPPP2PP/R1BQK2R w KQkq -" : [-25,[36, 28, null], "book"],
  "r1bqk1nr/pp1p1pbp/2n1p1p1/2p2P2/2B1P3/2N2N2/PPPP2PP/R1BQK2R b KQkq -" : [-54,[22, 29, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/2N3P1/PPPP1P1P/R1BQKBNR b KQkq -" : [-9,[14, 22, null], "book"],
  "r1bqkbnr/pp1ppp1p/2n3p1/2p5/4P3/2N3P1/PPPP1P1P/R1BQKBNR w KQkq -" : [-8,[61, 54, null], "book"],
  "r1bqkbnr/pp1ppp1p/2n3p1/2p5/4P3/2N3P1/PPPP1PBP/R1BQK1NR b KQkq -" : [-2,[5, 14, null], "book"],
  "r1bqk1nr/pp1pppbp/2n3p1/2p5/4P3/2N3P1/PPPP1PBP/R1BQK1NR w KQkq -" : [-4,[62, 45, null], "book"],
  "r1bqk1nr/pp1pppbp/2n3p1/2p5/4P3/2NP2P1/PPP2PBP/R1BQK1NR b KQkq -" : [0,[0, 1, null], "book"],
  "r1bqk1nr/pp2ppbp/2np2p1/2p5/4P3/2NP2P1/PPP2PBP/R1BQK1NR w KQkq -" : [-4,[62, 52, null], "book"],
  "r1bqk1nr/pp2ppbp/2np2p1/2p5/4P3/2NPB1P1/PPP2PBP/R2QK1NR b KQkq -" : [-26,[0, 1, null], "book"],
  "r1bqk1nr/pp2ppbp/2np2p1/2p5/4PP2/2NP2P1/PPP3BP/R1BQK1NR b KQkq -" : [-23,[0, 1, null], "book"],
  "r1bqk1nr/pp3pbp/2np2p1/2p1p3/4PP2/2NP2P1/PPP3BP/R1BQK1NR w KQkq -" : [21,[62, 45, null], "book"],
  "r1bqk1nr/pp3pbp/2np2p1/2p1p3/4PP2/2NP2PN/PPP3BP/R1BQK2R b KQkq -" : [-16,[15, 31, null], "book"],
  "r1bqk2r/pp2npbp/2np2p1/2p1p3/4PP2/2NP2PN/PPP3BP/R1BQK2R w KQkq -" : [9,[37, 29, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/2N5/PPPPNPPP/R1BQKB1R b KQkq -" : [29,[14, 22, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPPNPPP/RNBQKB1R b KQkq -" : [18,[11, 27, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -" : [45,[12, 20, null], "book"],
  "rnbqkbnr/1p1ppppp/p7/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [58,[50, 42, null], "book"],
  "rnbqkbnr/1p1ppppp/p7/2p5/4P3/1P3N2/P1PP1PPP/RNBQKB1R b KQkq -" : [0,[11, 19, null], "book"],
  "rnbqkbnr/1p1ppppp/p7/2p5/1P2P3/5N2/P1PP1PPP/RNBQKB1R b KQkq -" : [-33,[26, 33, null], "book"],
  "rnbqkbnr/1p1ppppp/p7/2p5/4P3/5N2/PPPPBPPP/RNBQK2R b KQkq -" : [42,[11, 19, null], "book"],
  "rnbqkbnr/1p1ppppp/p7/2p5/4P3/2P2N2/PP1P1PPP/RNBQKB1R b KQkq -" : [49,[12, 20, null], "book"],
  "rnbqkbnr/3ppppp/p7/1pp5/4P3/2P2N2/PP1P1PPP/RNBQKB1R w KQkq -" : [94,[51, 35, null], "book"],
  "rnbqkbnr/1p2pppp/p7/2pp4/4P3/2P2N2/PP1P1PPP/RNBQKB1R w KQkq -" : [44,[36, 27, null], "book"],
  "rnbqkbnr/1p2pppp/p7/2pP4/8/2P2N2/PP1P1PPP/RNBQKB1R b KQkq -" : [58,[3, 27, null], "book"],
  "rnbqkb1r/1p2pppp/p4n2/2pP4/8/2P2N2/PP1P1PPP/RNBQKB1R w KQkq -" : [76,[59, 32, null], "book"],
  "rnbqkbnr/1p2pppp/p2p4/2p5/4P3/2P2N2/PP1P1PPP/RNBQKB1R w KQkq -" : [69,[51, 35, null], "book"],
  "rnbqkb1r/1p1ppppp/p4n2/2p5/4P3/2P2N2/PP1P1PPP/RNBQKB1R w KQkq -" : [65,[36, 28, null], "book"],
  "rnbqkbnr/1p1ppppp/p7/2p5/2P1P3/5N2/PP1P1PPP/RNBQKB1R b KQkq -" : [56,[1, 18, null], "book"],
  "rnbqkbnr/1p2pppp/p2p4/2p5/2P1P3/5N2/PP1P1PPP/RNBQKB1R w KQkq -" : [63,[51, 35, null], "book"],
  "rnbqkbnr/1p1p1ppp/p3p3/2p5/2P1P3/5N2/PP1P1PPP/RNBQKB1R w KQkq -" : [49,[57, 42, null], "book"],
  "r1bqkbnr/1p1ppppp/p1n5/2p5/2P1P3/5N2/PP1P1PPP/RNBQKB1R w KQkq -" : [59,[51, 35, null], "book"],
  "r1bqkbnr/1p1ppppp/p1n5/2p5/2PPP3/5N2/PP3PPP/RNBQKB1R b KQkq -" : [41,[26, 35, null], "book"],
  "r1bqkbnr/1p1ppppp/p1n5/8/2PpP3/5N2/PP3PPP/RNBQKB1R w KQkq -" : [66,[45, 35, null], "book"],
  "r1bqkbnr/1p1ppppp/p1n5/8/2PNP3/8/PP3PPP/RNBQKB1R b KQkq -" : [54,[12, 28, null], "book"],
  "r1bqkbnr/1p1p1ppp/p1n5/4p3/2PNP3/8/PP3PPP/RNBQKB1R w KQkq -" : [61,[35, 29, null], "book"],
  "rnbqkbnr/1p1ppppp/p7/2p5/4P3/3P1N2/PPP2PPP/RNBQKB1R b KQkq -" : [13,[11, 19, null], "book"],
  "rnbqkbnr/1p1ppppp/p7/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [36,[26, 35, null], "book"],
  "rnbqkbnr/1p1ppppp/p7/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [23,[59, 35, null], "book"],
  "rnbqkbnr/1p1ppppp/p7/8/2BpP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [-4,[3, 10, null], "book"],
  "rnbqkbnr/1p1ppppp/p7/8/3pP3/2P2N2/PP3PPP/RNBQKB1R b KQkq -" : [-14,[35, 42, null], "book"],
  "rnbqkbnr/1p1ppppp/p7/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq -" : [29,[6, 21, null], "book"],
  "rnbqkbnr/1p1p1ppp/p7/4p3/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [40,[35, 41, null], "book"],
  "rnbqkbnr/1p1p1ppp/p3p3/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [54,[61, 43, null], "book"],
  "rnbqkbnr/1p1ppppp/p7/8/3QP3/5N2/PPP2PPP/RNB1KB1R b KQkq -" : [20,[1, 18, null], "book"],
  "rnbqkbnr/1p1ppppp/p7/2p5/4P3/5NP1/PPPP1P1P/RNBQKB1R b KQkq -" : [53,[11, 19, null], "book"],
  "rnbqkbnr/1p1ppppp/p7/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq -" : [42,[12, 20, null], "book"],
  "rnbqkbnr/p2ppppp/8/1pp5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [159,[61, 25, null], "book"],
  "rnbqkbnr/p2ppppp/1p6/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [67,[51, 35, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [34,[51, 35, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/2p5/1P2P3/5N2/P1PP1PPP/RNBQKB1R b KQkq -" : [-13,[26, 33, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/1Bp5/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [26,[2, 11, null], "book"],
  "rn1qkbnr/pp1bpppp/3p4/1Bp5/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [32,[25, 11, null], "book"],
  "rn1qkbnr/pp1Bpppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [19,[3, 11, null], "book"],
  "rn2kbnr/pp1qpppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [25,[60, 62, null], "book"],
  "rn2kbnr/pp1qpppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq -" : [18,[6, 21, null], "book"],
  "r3kbnr/pp1qpppp/2np4/2p5/4P3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [36,[50, 42, null], "book"],
  "r3kbnr/pp1qpppp/2np4/2p5/4P3/2P2N2/PP1P1PPP/RNBQ1RK1 b kq -" : [31,[6, 21, null], "book"],
  "r3kb1r/pp1qpppp/2np1n2/2p5/4P3/2P2N2/PP1P1PPP/RNBQ1RK1 w kq -" : [36,[51, 35, null], "book"],
  "r3kb1r/pp1qpppp/2np1n2/2p5/3PP3/2P2N2/PP3PPP/RNBQ1RK1 b kq -" : [18,[21, 36, null], "book"],
  "r1bqkbnr/pp2pppp/2np4/1Bp5/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [56,[60, 62, null], "book"],
  "r1bqkbnr/pp2pppp/2np4/1Bp5/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq -" : [52,[2, 11, null], "book"],
  "r2qkbnr/pp1bpppp/2np4/1Bp5/4P3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [43,[61, 60, null], "book"],
  "r2qkbnr/pp1bpppp/2np4/1Bp5/4P3/2P2N2/PP1P1PPP/RNBQ1RK1 b kq -" : [38,[8, 16, null], "book"],
  "r2qkbnr/1p1bpppp/p1np4/1Bp5/4P3/2P2N2/PP1P1PPP/RNBQ1RK1 w kq -" : [50,[25, 32, null], "book"],
  "r2qkbnr/1p1bpppp/p1Bp4/2p5/4P3/2P2N2/PP1P1PPP/RNBQ1RK1 b kq -" : [-7,[11, 18, null], "book"],
  "r2qkbnr/1p2pppp/p1bp4/2p5/4P3/2P2N2/PP1P1PPP/RNBQ1RK1 w kq -" : [-4,[61, 60, null], "book"],
  "r2qkbnr/1p2pppp/p1bp4/2p5/4P3/2P2N2/PP1P1PPP/RNBQR1K1 b kq -" : [-6,[6, 21, null], "book"],
  "r2qkb1r/1p2pppp/p1bp1n2/2p5/4P3/2P2N2/PP1P1PPP/RNBQR1K1 w kq -" : [-8,[51, 43, null], "book"],
  "r2qkb1r/1p2pppp/p1bp1n2/2p5/3PP3/2P2N2/PP3PPP/RNBQR1K1 b kq -" : [1,[18, 36, null], "book"],
  "r2qkb1r/1p2pppp/p2p1n2/2p5/3Pb3/2P2N2/PP3PPP/RNBQR1K1 w kq -" : [1,[58, 30, null], "book"],
  "r2qkb1r/1p2pppp/p2p1n2/2p3B1/3Pb3/2P2N2/PP3PPP/RN1QR1K1 b kq -" : [-6,[36, 29, null], "book"],
  "r2qkbnr/pp1bpppp/2np4/1Bp5/4P3/5N2/PPPPQPPP/RNB2RK1 b kq -" : [12,[6, 21, null], "book"],
  "r2qkbnr/pp1bpp1p/2np2p1/1Bp5/4P3/5N2/PPPPQPPP/RNB2RK1 w kq -" : [32,[61, 60, null], "book"],
  "r2qkbnr/pp1bpp1p/2np2p1/1Bp1P3/8/5N2/PPPPQPPP/RNB2RK1 b kq -" : [0,[19, 28, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/2p5/4P3/3B1N2/PPPP1PPP/RNBQK2R b KQkq -" : [14,[14, 22, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/2p5/4P3/2P2N2/PP1P1PPP/RNBQKB1R b KQkq -" : [5,[6, 21, null], "book"],
  "rnbqkb1r/pp2pppp/3p1n2/2p5/4P3/2P2N2/PP1P1PPP/RNBQKB1R w KQkq -" : [9,[61, 52, null], "book"],
  "rnbqkb1r/pp2pppp/3p1n2/2p5/4P3/2P2N2/PP1PBPPP/RNBQK2R b KQkq -" : [15,[14, 22, null], "book"],
  "r1bqkb1r/pp2pppp/2np1n2/2p5/4P3/2P2N2/PP1PBPPP/RNBQK2R w KQkq -" : [44,[51, 35, null], "book"],
  "r1bqkb1r/pp2pppp/2np1n2/2p5/3PP3/2P2N2/PP2BPPP/RNBQK2R b KQkq -" : [50,[12, 20, null], "book"],
  "r1bqkb1r/pp2pppp/2np1n2/8/3pP3/2P2N2/PP2BPPP/RNBQK2R w KQkq -" : [55,[42, 35, null], "book"],
  "r1bqkb1r/pp2pppp/2np1n2/8/3PP3/5N2/PP2BPPP/RNBQK2R b KQkq -" : [48,[21, 36, null], "book"],
  "r1bqkb1r/pp2pppp/2np4/8/3Pn3/5N2/PP2BPPP/RNBQK2R w KQkq -" : [58,[35, 27, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [49,[26, 35, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [52,[45, 35, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/8/3pP3/2P2N2/PP3PPP/RNBQKB1R b KQkq -" : [-26,[35, 42, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq -" : [44,[1, 18, null], "book"],
  "rnbqkb1r/pp2pppp/3p1n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [44,[57, 42, null], "book"],
  "rnbqkb1r/pp2pppp/3p1n2/8/2BNP3/8/PPP2PPP/RNBQK2R b KQkq -" : [0,[21, 36, null], "book"],
  "rnbqkb1r/pp2pppp/3p1n2/8/3NP3/5P2/PPP3PP/RNBQKB1R b KQkq -" : [22,[12, 28, null], "book"],
  "rnbqkb1r/pp3ppp/3p1n2/4p3/3NP3/5P2/PPP3PP/RNBQKB1R w KQkq -" : [25,[35, 41, null], "book"],
  "rnbqkb1r/pp3ppp/3p1n2/1B2p3/3NP3/5P2/PPP3PP/RNBQK2R b KQkq -" : [-11,[2, 11, null], "book"],
  "rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq -" : [48,[8, 16, null], "book"],
  "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [36,[58, 44, null], "book"],
  "rnbqkb1r/1p2pppp/p2p1n2/8/2BNP3/2N5/PPP2PPP/R1BQK2R b KQkq -" : [29,[9, 25, null], "book"],
  "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP1BPPP/R1BQK2R b KQkq -" : [38,[12, 28, null], "book"],
  "rnbqkb1r/1p3ppp/p2p1n2/4p3/3NP3/2N5/PPP1BPPP/R1BQK2R w KQkq -" : [30,[35, 45, null], "book"],
  "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq -" : [34,[12, 28, null], "book"],
  "rnbqkb1r/1p2pppp/p2p4/8/3NP1n1/2N1B3/PPP2PPP/R2QKB1R w KQkq -" : [47,[44, 30, null], "book"],
  "rnbqkb1r/1p2pppp/p2p1n2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R b KQkq -" : [16,[12, 20, null], "book"],
  "rnbqkb1r/1p3ppp/p2ppn2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R w KQkq -" : [36,[53, 37, null], "book"],
  "rnbqkb1r/1p3ppp/p2ppn2/6B1/3NPP2/2N5/PPP3PP/R2QKB1R b KQkq -" : [27,[3, 17, null], "book"],
  "rnbqkb1r/5ppp/p2ppn2/1p4B1/3NPP2/2N5/PPP3PP/R2QKB1R w KQkq -" : [40,[36, 28, null], "book"],
  "rnbqkb1r/5ppp/p2ppn2/1p2P1B1/3N1P2/2N5/PPP3PP/R2QKB1R b KQkq -" : [61,[19, 28, null], "book"],
  "rnbqkb1r/5ppp/p3pn2/1p2p1B1/3N1P2/2N5/PPP3PP/R2QKB1R w KQkq -" : [29,[37, 28, null], "book"],
  "rnbqkb1r/5ppp/p3pn2/1p2P1B1/3N4/2N5/PPP3PP/R2QKB1R b KQkq -" : [53,[3, 10, null], "book"],
  "rnb1kb1r/2q2ppp/p3pn2/1p2P1B1/3N4/2N5/PPP3PP/R2QKB1R w KQkq -" : [52,[59, 52, null], "book"],
  "rnb1kb1r/2q2ppp/p3pn2/1p2P1B1/3N4/2N5/PPP1Q1PP/R3KB1R b KQkq -" : [44,[21, 11, null], "book"],
  "rnbqk2r/1p2bppp/p2ppn2/6B1/3NPP2/2N5/PPP3PP/R2QKB1R w KQkq -" : [26,[59, 45, null], "book"],
  "rnbqk2r/1p2bppp/p2ppn2/6B1/3NPP2/2N2Q2/PPP3PP/R3KB1R b KQkq -" : [22,[1, 11, null], "book"],
  "rnbqk2r/1p2bpp1/p2ppn1p/6B1/3NPP2/2N2Q2/PPP3PP/R3KB1R w KQkq -" : [70,[30, 39, null], "book"],
  "rnbqk2r/1p2bpp1/p2ppn1p/8/3NPP1B/2N2Q2/PPP3PP/R3KB1R b KQkq -" : [66,[1, 18, null], "book"],
  "rnbqk2r/1p2bp2/p2ppn1p/6p1/3NPP1B/2N2Q2/PPP3PP/R3KB1R w KQkq -" : [77,[37, 30, null], "book"],
  "rnb1k2r/1pq1bpp1/p2ppn1p/8/3NPP1B/2N2Q2/PPP3PP/R3KB1R w KQkq -" : [58,[60, 58, null], "book"],
  "rnb1k2r/1pq1bppp/p2ppn2/6B1/3NPP2/2N2Q2/PPP3PP/R3KB1R w KQkq -" : [29,[60, 58, null], "book"],
  "rnb1k2r/1pq1bppp/p2ppn2/6B1/3NPP2/2N2Q2/PPP3PP/2KR1B1R b kq -" : [18,[1, 11, null], "book"],
  "r1b1k2r/1pqnbppp/p2ppn2/6B1/3NPP2/2N2Q2/PPP3PP/2KR1B1R w kq -" : [19,[54, 38, null], "book"],
  "rnb1kb1r/1p3ppp/pq1ppn2/6B1/3NPP2/2N5/PPP3PP/R2QKB1R w KQkq -" : [38,[59, 51, null], "book"],
  "rnb1kb1r/1p3ppp/pq1ppn2/6B1/3NPP2/2N5/PPPQ2PP/R3KB1R b KQkq -" : [-19,[17, 49, null], "book"],
  "rnb1kb1r/1p3ppp/p2ppn2/6B1/3NPP2/2N5/PqPQ2PP/R3KB1R w KQkq -" : [27,[56, 57, null], "book"],
  "rnbqkb1r/1p2pppp/p2p1n2/8/3NPP2/2N5/PPP3PP/R1BQKB1R b KQkq -" : [26,[12, 28, null], "book"],
  "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N3P1/PPP2P1P/R1BQKB1R b KQkq -" : [7,[14, 22, null], "book"],
  "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N4P/PPP2PP1/R1BQKB1R b KQkq -" : [29,[12, 20, null], "book"],
  "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKBR1 b Qkq -" : [21,[9, 25, null], "book"],
  "rn1qkb1r/pp1bpppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [60,[53, 45, null], "book"],
  "rnbqkb1r/pp3ppp/3p1n2/4p3/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [74,[61, 25, null], "book"],
  "rnbqkb1r/pp3ppp/3p1n2/1B2p3/3NP3/2N5/PPP2PPP/R1BQK2R b KQkq -" : [71,[1, 11, null], "book"],
  "rnbqkb1r/pp3ppp/3ppn2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [71,[54, 38, null], "book"],
  "rnbqkb1r/pp3ppp/3ppn2/1B6/3NP3/2N5/PPP2PPP/R1BQK2R b KQkq -" : [11,[1, 11, null], "book"],
  "rnbqkb1r/pp3ppp/3ppn2/8/2BNP3/2N5/PPP2PPP/R1BQK2R b KQkq -" : [19,[8, 16, null], "book"],
  "rnbqkb1r/1p3ppp/p2ppn2/8/2BNP3/2N5/PPP2PPP/R1BQK2R w KQkq -" : [24,[34, 41, null], "book"],
  "rnbqkb1r/1p3ppp/p2ppn2/8/3NP3/1BN5/PPP2PPP/R1BQK2R b KQkq -" : [22,[9, 25, null], "book"],
  "rnbqkb1r/5ppp/p2ppn2/1p6/3NP3/1BN5/PPP2PPP/R1BQK2R w KQkq -" : [32,[53, 45, null], "book"],
  "r1bqkb1r/pp3ppp/2nppn2/8/2BNP3/2N5/PPP2PPP/R1BQK2R w KQkq -" : [48,[58, 44, null], "book"],
  "r1bqkb1r/pp3ppp/2nppn2/8/2BNP3/2N1B3/PPP2PPP/R2QK2R b KQkq -" : [45,[19, 27, null], "book"],
  "r1bqk2r/pp2bppp/2nppn2/8/2BNP3/2N1B3/PPP2PPP/R2QK2R w KQkq -" : [49,[59, 52, null], "book"],
  "r1bqk2r/pp2bppp/2nppn2/8/3NP3/1BN1B3/PPP2PPP/R2QK2R b KQkq -" : [48,[4, 6, null], "book"],
  "r1bq1rk1/pp2bppp/2nppn2/8/3NP3/1BN1B3/PPP2PPP/R2QK2R w KQ -" : [33,[59, 52, null], "book"],
  "r1bq1rk1/pp2bppp/2nppn2/8/3NP3/1BN1B3/PPP2PPP/R2Q1RK1 b - -" : [20,[8, 16, null], "book"],
  "r1bq1rk1/pp2bppp/3ppn2/n7/3NP3/1BN1B3/PPP2PPP/R2Q1RK1 w - -" : [10,[53, 37, null], "book"],
  "r1bq1rk1/pp2bppp/3ppn2/n7/3NPP2/1BN1B3/PPP3PP/R2Q1RK1 b - -" : [20,[20, 28, null], "book"],
  "r1bq1rk1/p3bppp/1p1ppn2/n7/3NPP2/1BN1B3/PPP3PP/R2Q1RK1 w - -" : [34,[36, 28, null], "book"],
  "r1bqk2r/pp2bppp/2nppn2/8/2BNP3/2N1B3/PPP1QPPP/R3K2R b KQkq -" : [30,[8, 16, null], "book"],
  "rnbqkb1r/pp3ppp/3ppn2/8/3NP3/2N5/PPP1BPPP/R1BQK2R b KQkq -" : [46,[8, 16, null], "book"],
  "rnbqkb1r/1p3ppp/p2ppn2/8/3NP3/2N5/PPP1BPPP/R1BQK2R w KQkq -" : [41,[48, 40, null], "book"],
  "rnbqkb1r/1p3ppp/p2ppn2/8/3NP3/2N5/PPP1BPPP/R1BQ1RK1 b kq -" : [35,[5, 12, null], "book"],
  "rnbqk2r/1p2bppp/p2ppn2/8/3NP3/2N5/PPP1BPPP/R1BQ1RK1 w kq -" : [39,[53, 37, null], "book"],
  "rnb1kb1r/1pq2ppp/p2ppn2/8/3NP3/2N5/PPP1BPPP/R1BQ1RK1 w kq -" : [45,[53, 37, null], "book"],
  "rnb1kb1r/1pq2ppp/p2ppn2/8/3NPP2/2N5/PPP1B1PP/R1BQ1RK1 b kq -" : [36,[5, 12, null], "book"],
  "r1b1kb1r/1pq2ppp/p1nppn2/8/3NPP2/2N5/PPP1B1PP/R1BQ1RK1 w kq -" : [42,[58, 44, null], "book"],
  "rnbqkb1r/pp3ppp/3ppn2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq -" : [64,[8, 16, null], "book"],
  "rnbqkb1r/1p3ppp/p2ppn2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R w KQkq -" : [45,[53, 45, null], "book"],
  "rnbqkb1r/1p3ppp/p2ppn2/8/3NP3/2N1BP2/PPP3PP/R2QKB1R b KQkq -" : [37,[9, 25, null], "book"],
  "rnbqkb1r/1p3ppp/p2ppn2/8/3NP1P1/2N1B3/PPP2P1P/R2QKB1R b KQkq -" : [-34,[20, 28, null], "book"],
  "rnbqkb1r/1p3ppp/p2p1n2/4p3/3NP1P1/2N1B3/PPP2P1P/R2QKB1R w KQkq -" : [9,[35, 29, null], "book"],
  "rnbqkb1r/1p3ppp/p2p1n2/4pN2/4P1P1/2N1B3/PPP2P1P/R2QKB1R b KQkq -" : [1,[14, 22, null], "book"],
  "rnbqkb1r/1p3p1p/p2p1np1/4pN2/4P1P1/2N1B3/PPP2P1P/R2QKB1R w KQkq -" : [36,[38, 30, null], "book"],
  "rnbqkb1r/1p3p1p/p2p1np1/4pNP1/4P3/2N1B3/PPP2P1P/R2QKB1R b KQkq -" : [-30,[22, 29, null], "book"],
  "rnbqkb1r/pp3ppp/3ppn2/8/3NPP2/2N5/PPP3PP/R1BQKB1R b KQkq -" : [50,[8, 16, null], "book"],
  "r1bqkb1r/pp3ppp/2nppn2/8/3NPP2/2N5/PPP3PP/R1BQKB1R w KQkq -" : [78,[58, 44, null], "book"],
  "r1bqkb1r/pp3ppp/2nppn2/8/3NPP2/2N1B3/PPP3PP/R2QKB1R b KQkq -" : [62,[5, 12, null], "book"],
  "r1bqk2r/pp2bppp/2nppn2/8/3NPP2/2N1B3/PPP3PP/R2QKB1R w KQkq -" : [72,[59, 45, null], "book"],
  "r1bqk2r/pp2bppp/2nppn2/8/3NPP2/2N1BQ2/PPP3PP/R3KB1R b KQkq -" : [53,[20, 28, null], "book"],
  "rnbqkb1r/pp3ppp/3ppn2/8/3NP3/2N3P1/PPP2P1P/R1BQKB1R b KQkq -" : [16,[1, 18, null], "book"],
  "rnbqkb1r/pp3ppp/3ppn2/8/3NP1P1/2N5/PPP2P1P/R1BQKB1R b KQkq -" : [74,[20, 28, null], "book"],
  "rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [59,[58, 44, null], "book"],
  "rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP1BPPP/R1BQK2R b KQkq -" : [31,[5, 14, null], "book"],
  "rnbqk2r/pp2ppbp/3p1np1/8/3NP3/2N5/PPP1BPPP/R1BQK2R w KQkq -" : [52,[58, 44, null], "book"],
  "rnbqk2r/pp2ppbp/3p1np1/8/3NP3/2N5/PPP1BPPP/R1BQ1RK1 b kq -" : [17,[4, 6, null], "book"],
  "rnbq1rk1/pp2ppbp/3p1np1/8/3NP3/2N5/PPP1BPPP/R1BQ1RK1 w - -" : [17,[58, 44, null], "book"],
  "rnbq1rk1/pp2ppbp/3p1np1/8/4P3/1NN5/PPP1BPPP/R1BQ1RK1 b - -" : [-3,[1, 18, null], "book"],
  "rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq -" : [61,[8, 16, null], "book"],
  "rnbqk2r/pp2ppbp/3p1np1/8/3NP3/2N1B3/PPP2PPP/R2QKB1R w KQkq -" : [59,[53, 45, null], "book"],
  "rnbqk2r/pp2ppbp/3p1np1/8/3NP3/2N1B3/PPP1BPPP/R2QK2R b KQkq -" : [27,[1, 18, null], "book"],
  "r1bqk2r/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2QK2R w KQkq -" : [21,[60, 62, null], "book"],
  "r1bqk2r/pp2ppbp/2np1np1/8/4P3/1NN1B3/PPP1BPPP/R2QK2R b KQkq -" : [13,[4, 6, null], "book"],
  "r1bqk2r/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 b kq -" : [23,[2, 11, null], "book"],
  "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - -" : [27,[48, 32, null], "book"],
  "r1bq1rk1/pp2ppbp/2np1np1/8/3NPP2/2N1B3/PPP1B1PP/R2Q1RK1 b - -" : [-12,[3, 17, null], "book"],
  "r1b2rk1/pp2ppbp/1qnp1np1/8/3NPP2/2N1B3/PPP1B1PP/R2Q1RK1 w - -" : [0,[42, 32, null], "book"],
  "r1bq1rk1/pp2ppbp/2np1np1/8/4P3/1NN1B3/PPP1BPPP/R2Q1RK1 b - -" : [-8,[8, 16, null], "book"],
  "r1bq1rk1/1p2ppbp/2np1np1/p7/4P3/1NN1B3/PPP1BPPP/R2Q1RK1 w - -" : [26,[48, 32, null], "book"],
  "r2q1rk1/pp2ppbp/2npbnp1/8/4P3/1NN1B3/PPP1BPPP/R2Q1RK1 w - -" : [1,[53, 37, null], "book"],
  "r2q1rk1/pp2ppbp/2npbnp1/8/4PP2/1NN1B3/PPP1B1PP/R2Q1RK1 b - -" : [3,[0, 2, null], "book"],
  "r2q1rk1/pp2ppbp/3pbnp1/n7/4PP2/1NN1B3/PPP1B1PP/R2Q1RK1 w - -" : [19,[37, 29, null], "book"],
  "r1q2rk1/pp2ppbp/2npbnp1/8/4PP2/1NN1B3/PPP1B1PP/R2Q1RK1 w - -" : [17,[59, 51, null], "book"],
  "r1bqk2r/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPPQBPPP/R3K2R b KQkq -" : [18,[21, 38, null], "book"],
  "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPPQBPPP/R3K2R w KQ -" : [49,[60, 58, null], "book"],
  "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPPQBPPP/2KR3R b - -" : [31,[21, 38, null], "book"],
  "rnbqk2r/pp2ppbp/3p1np1/8/3NP3/2N1BP2/PPP3PP/R2QKB1R b KQkq -" : [69,[8, 16, null], "book"],
  "rnbq1rk1/pp2ppbp/3p1np1/8/3NP3/2N1BP2/PPP3PP/R2QKB1R w KQ -" : [64,[59, 51, null], "book"],
  "rnbq1rk1/pp2ppbp/3p1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R b KQ -" : [84,[19, 27, null], "book"],
  "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ -" : [118,[60, 58, null], "book"],
  "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1BP2/PPPQ2PP/R3K2R b KQ -" : [61,[3, 24, null], "book"],
  "r2q1rk1/pp1bppbp/2np1np1/8/2BNP3/2N1BP2/PPPQ2PP/R3K2R w KQ -" : [92,[60, 58, null], "book"],
  "r2q1rk1/pp1bppbp/2np1np1/8/2BNP3/2N1BP2/PPPQ2PP/2KR3R b - -" : [78,[0, 2, null], "book"],
  "r4rk1/pp1bppbp/2np1np1/q7/2BNP3/2N1BP2/PPPQ2PP/2KR3R w - -" : [95,[58, 57, null], "book"],
  "r1bq1rk1/pp1nppbp/2np2p1/8/2BNP3/2N1BP2/PPPQ2PP/R3K2R w KQ -" : [119,[60, 58, null], "book"],
  "r1bq1rk1/pp2ppbp/3p1np1/8/2BnP3/2N1BP2/PPPQ2PP/R3K2R w KQ -" : [52,[44, 35, null], "book"],
  "r1bq1rk1/pp2ppbp/2np1np1/8/3NP1P1/2N1BP2/PPPQ3P/R3KB1R b KQ -" : [67,[15, 31, null], "book"],
  "rnbqkb1r/pp2pp1p/3p1np1/8/3NPP2/2N5/PPP3PP/R1BQKB1R b KQkq -" : [19,[1, 18, null], "book"],
  "rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N3P1/PPP2P1P/R1BQKB1R b KQkq -" : [1,[5, 14, null], "book"],
  "r1bqkb1r/pp2pppp/2np1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [52,[53, 45, null], "book"],
  "r1bqkb1r/pp2pppp/2np1n2/8/2BNP3/2N5/PPP2PPP/R1BQK2R b KQkq -" : [41,[12, 20, null], "book"],
  "r1b1kb1r/pp2pppp/1qnp1n2/8/2BNP3/2N5/PPP2PPP/R1BQK2R w KQkq -" : [44,[35, 41, null], "book"],
  "r1bqkb1r/pp2pppp/2np1n2/8/3NP3/2NB4/PPP2PPP/R1BQK2R b KQkq -" : [-399,[18, 35, null], "book"],
  "r1bqkb1r/pp2pppp/2np1n2/8/3NP3/2N5/PPP1BPPP/R1BQK2R b KQkq -" : [21,[12, 28, null], "book"],
  "r1bqkb1r/pp3ppp/2np1n2/4p3/3NP3/2N5/PPP1BPPP/R1BQK2R w KQkq -" : [19,[35, 18, null], "book"],
  "r1bqkb1r/pp3ppp/2np1n2/4p3/4P3/1NN5/PPP1BPPP/R1BQK2R b KQkq -" : [3,[5, 12, null], "book"],
  "r1bqkb1r/pp3ppp/2Np1n2/4p3/4P3/2N5/PPP1BPPP/R1BQK2R b KQkq -" : [33,[9, 18, null], "book"],
  "r1bqkb1r/pp2pppp/2np1n2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R b KQkq -" : [52,[2, 11, null], "book"],
  "r1bqkb1r/pp3ppp/2nppn2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R w KQkq -" : [43,[59, 51, null], "book"],
  "r1bqkb1r/pp3ppp/2nppn2/1B4B1/3NP3/2N5/PPP2PPP/R2QK2R b KQkq -" : [31,[2, 11, null], "book"],
  "r1bqkb1r/pp3ppp/2nppn2/6B1/4P3/1NN5/PPP2PPP/R2QKB1R b KQkq -" : [18,[8, 16, null], "book"],
  "r1bqkb1r/pp3ppp/2Nppn2/6B1/4P3/2N5/PPP2PPP/R2QKB1R b KQkq -" : [0,[9, 18, null], "book"],
  "r1bqkb1r/pp3ppp/2nppn2/6B1/3NP3/2N5/PPPQ1PPP/R3KB1R b KQkq -" : [52,[8, 16, null], "book"],
  "r1bqkb1r/1p3ppp/p1nppn2/6B1/3NP3/2N5/PPPQ1PPP/R3KB1R w KQkq -" : [33,[35, 18, null], "book"],
  "r1bqkb1r/1p3ppp/p1nppn2/6B1/3NP3/2N5/PPPQ1PPP/2KR1B1R b kq -" : [42,[2, 11, null], "book"],
  "r2qkb1r/1p1b1ppp/p1nppn2/6B1/3NP3/2N5/PPPQ1PPP/2KR1B1R w kq -" : [33,[53, 45, null], "book"],
  "r2qkb1r/1p1b1ppp/p1nppn2/6B1/3NPP2/2N5/PPPQ2PP/2KR1B1R b kq -" : [48,[15, 23, null], "book"],
  "r2qk2r/1p1bbppp/p1nppn2/6B1/3NPP2/2N5/PPPQ2PP/2KR1B1R w kq -" : [49,[35, 45, null], "book"],
  "r2qk2r/1p1bbppp/p1nppn2/6B1/4PP2/2N2N2/PPPQ2PP/2KR1B1R b kq -" : [64,[15, 23, null], "book"],
  "r2qk2r/3bbppp/p1nppn2/1p4B1/4PP2/2N2N2/PPPQ2PP/2KR1B1R w kq -" : [55,[30, 21, null], "book"],
  "r2qk2r/3bbppp/p1nppB2/1p6/4PP2/2N2N2/PPPQ2PP/2KR1B1R b kq -" : [45,[14, 21, null], "book"],
  "r1bqk2r/pp2bppp/2nppn2/6B1/3NP3/2N5/PPPQ1PPP/R3KB1R w KQkq -" : [55,[60, 58, null], "book"],
  "r1bqk2r/pp2bppp/2nppn2/6B1/3NP3/2N5/PPPQ1PPP/2KR1B1R b kq -" : [53,[8, 16, null], "book"],
  "r1bq1rk1/pp2bppp/2nppn2/6B1/3NP3/2N5/PPPQ1PPP/2KR1B1R w - -" : [59,[35, 25, null], "book"],
  "r1bq1rk1/pp2bppp/2nppn2/6B1/3NPP2/2N5/PPPQ2PP/2KR1B1R b - -" : [48,[18, 35, null], "book"],
  "r1bq1rk1/pp2bppp/3ppn2/6B1/3nPP2/2N5/PPPQ2PP/2KR1B1R w - -" : [44,[51, 35, null], "book"],
  "r1bq1rk1/pp2bppp/3ppn2/6B1/3QPP2/2N5/PPP3PP/2KR1B1R b - -" : [59,[3, 24, null], "book"],
  "r1b1kb1r/pp3ppp/1qnppn2/6B1/3NP3/2N5/PPPQ1PPP/R3KB1R w KQkq -" : [77,[35, 41, null], "book"],
  "r1bqkb1r/pp2pp1p/2np1np1/6B1/3NP3/2N5/PPP2PPP/R2QKB1R w KQkq -" : [81,[61, 25, null], "book"],
  "r1bqkb1r/pp2pppp/2np1n2/8/3NP3/2N3P1/PPP2P1P/R1BQKB1R b KQkq -" : [27,[14, 22, null], "book"],
  "r1bqkb1r/pp2pppp/2np1n2/8/4P3/2N5/PPP1NPPP/R1BQKB1R b KQkq -" : [-24,[12, 20, null], "book"],
  "r1bqkb1r/pp2pppp/2np1n2/8/3NP3/2N5/PPPQ1PPP/R1B1KB1R b KQkq -" : [10,[12, 28, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/8/3QP3/5N2/PPP2PPP/RNB1KB1R b KQkq -" : [13,[1, 18, null], "book"],
  "r1bqkbnr/pp2pppp/2np4/8/3QP3/5N2/PPP2PPP/RNB1KB1R w KQkq -" : [18,[35, 44, null], "book"],
  "r1bqkbnr/pp2pppp/2np4/1B6/3QP3/5N2/PPP2PPP/RNB1K2R b KQkq -" : [6,[2, 11, null], "book"],
  "r1b1kbnr/pp1qpppp/2np4/1B6/3QP3/5N2/PPP2PPP/RNB1K2R w KQkq -" : [57,[35, 44, null], "book"],
  "r1bqkbnr/pp1npppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [96,[50, 42, null], "book"],
  "rnbqkb1r/pp2pppp/3p1n2/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [39,[35, 26, null], "book"],
  "rnbqkb1r/pp2pppp/3p1n2/2P5/4P3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [36,[21, 36, null], "book"],
  "rnbqkb1r/pp2pppp/3p4/2P5/4n3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [42,[26, 19, null], "book"],
  "rnbqkb1r/pp2pppp/3P4/8/4n3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [32,[1, 18, null], "book"],
  "rnbqkbnr/pp2pppp/3p4/2p5/4P3/5NP1/PPPP1P1P/RNBQKB1R b KQkq -" : [-2,[6, 21, null], "book"],
  "rnbqkbnr/p3pppp/3p4/1pp5/4P3/5NP1/PPPP1P1P/RNBQKB1R w KQkq -" : [137,[61, 25, null], "book"],
  "rnbqkbnr/pp1p1ppp/8/2p1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [148,[45, 28, null], "book"],
  "rnbqkbnr/pp1p1ppp/4p3/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [36,[51, 35, null], "book"],
  "rnbqkbnr/pp1p1ppp/4p3/2p5/1P2P3/5N2/P1PP1PPP/RNBQKB1R b KQkq -" : [-42,[26, 33, null], "book"],
  "rnbqkbnr/pp1p1ppp/4p3/2p5/2P1P3/5N2/PP1P1PPP/RNBQKB1R b KQkq -" : [25,[1, 18, null], "book"],
  "rnbqkbnr/pp1p1ppp/4p3/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [32,[26, 35, null], "book"],
  "rnbqkbnr/pp1p1ppp/4p3/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [36,[45, 35, null], "book"],
  "rnbqkbnr/pp1p1ppp/4p3/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq -" : [40,[1, 18, null], "book"],
  "rnbqkbnr/1p1p1ppp/p3p3/8/3NP3/3B4/PPP2PPP/RNBQK2R b KQkq -" : [52,[1, 18, null], "book"],
  "rnbqk1nr/1p1p1ppp/p3p3/2b5/3NP3/3B4/PPP2PPP/RNBQK2R w KQkq -" : [55,[35, 41, null], "book"],
  "rnbqkbnr/1p1p1p1p/p3p1p1/8/3NP3/3B4/PPP2PPP/RNBQK2R w KQkq -" : [60,[57, 42, null], "book"],
  "rnbqkbnr/1p1p1ppp/p3p3/8/2PNP3/8/PP3PPP/RNBQKB1R b KQkq -" : [49,[6, 21, null], "book"],
  "rnbqkbnr/1p1p1p1p/p3p1p1/8/2PNP3/8/PP3PPP/RNBQKB1R w KQkq -" : [105,[61, 52, null], "book"],
  "rnbqkb1r/1p1p1ppp/p3pn2/8/2PNP3/8/PP3PPP/RNBQKB1R w KQkq -" : [53,[57, 42, null], "book"],
  "rnbqkb1r/1p1p1ppp/p3pn2/8/2PNP3/2N5/PP3PPP/R1BQKB1R b KQkq -" : [45,[5, 33, null], "book"],
  "rnbqk2r/1p1p1ppp/p3pn2/8/1bPNP3/2N5/PP3PPP/R1BQKB1R w KQkq -" : [53,[59, 43, null], "book"],
  "rnbqk2r/1p1p1ppp/p3pn2/8/1bPNP3/2NB4/PP3PPP/R1BQK2R b KQkq -" : [31,[1, 18, null], "book"],
  "r1bqk2r/1p1p1ppp/p1n1pn2/8/1bPNP3/2NB4/PP3PPP/R1BQK2R w KQkq -" : [31,[60, 62, null], "book"],
  "rnbqkbnr/1p1p1ppp/p3p3/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq -" : [32,[9, 25, null], "book"],
  "r1bqkbnr/pp1p1ppp/2n1p3/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [45,[57, 42, null], "book"],
  "r1bqkbnr/pp1p1ppp/2n1p3/1N6/4P3/8/PPP2PPP/RNBQKB1R b KQkq -" : [24,[11, 19, null], "book"],
  "r1bqkbnr/pp3ppp/2npp3/1N6/4P3/8/PPP2PPP/RNBQKB1R w KQkq -" : [28,[50, 34, null], "book"],
  "r1bqkbnr/pp3ppp/2npp3/1N6/2P1P3/8/PP3PPP/RNBQKB1R b KQkq -" : [35,[6, 21, null], "book"],
  "r1bqkb1r/pp3ppp/2nppn2/1N6/2P1P3/8/PP3PPP/RNBQKB1R w KQkq -" : [23,[57, 42, null], "book"],
  "r1bqkb1r/pp3ppp/2nppn2/1N6/2P1P3/2N5/PP3PPP/R1BQKB1R b KQkq -" : [29,[8, 16, null], "book"],
  "r1bqkb1r/1p3ppp/p1nppn2/1N6/2P1P3/2N5/PP3PPP/R1BQKB1R w KQkq -" : [31,[25, 35, null], "book"],
  "r1bqkb1r/1p3ppp/p1nppn2/8/2P1P3/N1N5/PP3PPP/R1BQKB1R b KQkq -" : [30,[9, 17, null], "book"],
  "r1bqkb1r/1p3ppp/p1n1pn2/3p4/2P1P3/N1N5/PP3PPP/R1BQKB1R w KQkq -" : [50,[34, 27, null], "book"],
  "r1bqkbnr/pp1p1ppp/2n1p3/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq -" : [50,[3, 10, null], "book"],
  "r1bqkbnr/1p1p1ppp/p1n1p3/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [52,[35, 18, null], "book"],
  "r1bqkbnr/1p1p1ppp/p1n1p3/8/3NP3/2N5/PPP1BPPP/R1BQK2R b KQkq -" : [35,[3, 10, null], "book"],
  "r1bqkb1r/1p1pnppp/p1n1p3/8/3NP3/2N5/PPP1BPPP/R1BQK2R w KQkq -" : [72,[35, 41, null], "book"],
  "r1bqkb1r/pp1p1ppp/2n1pn2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [56,[35, 18, null], "book"],
  "r1bqkb1r/pp1p1ppp/2n1pn2/1N6/4P3/2N5/PPP2PPP/R1BQKB1R b KQkq -" : [53,[11, 19, null], "book"],
  "r1bqk2r/pp1p1ppp/2n1pn2/1N6/1b2P3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [53,[58, 37, null], "book"],
  "r1bqk2r/pp1p1ppp/2nNpn2/8/1b2P3/2N5/PPP2PPP/R1BQKB1R b KQkq -" : [-8,[4, 12, null], "book"],
  "r1b1kbnr/ppqp1ppp/2n1p3/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [54,[58, 44, null], "book"],
  "r1b1kbnr/ppqp1ppp/2n1p3/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq -" : [54,[8, 16, null], "book"],
  "r1b1kbnr/1pqp1ppp/p1n1p3/8/3NP3/2N1B3/PPP2PPP/R2QKB1R w KQkq -" : [41,[59, 51, null], "book"],
  "r1b1kbnr/1pqp1ppp/p1n1p3/8/3NP3/2N1B3/PPP1BPPP/R2QK2R b KQkq -" : [33,[9, 25, null], "book"],
  "r1b1kbnr/ppqp1ppp/2n1p3/1N6/4P3/2N5/PPP2PPP/R1BQKB1R b KQkq -" : [40,[10, 1, null], "book"],
  "rqb1kbnr/pp1p1ppp/2n1p3/1N6/4P3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [46,[58, 44, null], "book"],
  "rqb1kbnr/pp1p1ppp/2n1p3/1N6/4P3/2N1B3/PPP2PPP/R2QKB1R b KQkq -" : [41,[8, 16, null], "book"],
  "rqb1kbnr/1p1p1ppp/p1n1p3/1N6/4P3/2N1B3/PPP2PPP/R2QKB1R w KQkq -" : [41,[25, 35, null], "book"],
  "rqb1kbnr/1p1p1ppp/pBn1p3/1N6/4P3/2N5/PPP2PPP/R2QKB1R b KQkq -" : [-65,[16, 25, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [52,[57, 42, null], "book"],
  "rnbqkb1r/pp1p1ppp/4pn2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq -" : [57,[1, 18, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/8/1b1NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [79,[36, 28, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/8/1b1NP3/2NB4/PPP2PPP/R1BQK2R b KQkq -" : [36,[11, 19, null], "book"],
  "rnbqk2r/pp1p1ppp/5n2/4p3/1b1NP3/2NB4/PPP2PPP/R1BQK2R w KQkq -" : [77,[35, 52, null], "book"],
  "rnbqk2r/pp1p1ppp/4pn2/4P3/1b1N4/2N5/PPP2PPP/R1BQKB1R b KQkq -" : [86,[21, 27, null], "book"],
  "r1bqk2r/pp1p1ppp/2n1pn2/1Nb5/4P3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [63,[25, 19, null], "book"],
  "rnb1kb1r/pp1p1ppp/1q2pn2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [123,[36, 28, null], "book"],
  "rnb1kbnr/pp1p1ppp/1q2p3/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [55,[35, 41, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/2pp4/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [81,[36, 27, null], "book"],
  "rnbqkbnr/pp1pp1pp/8/2p2p2/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [161,[36, 29, null], "book"],
  "rnbqkbnr/pp1pp1pp/8/2p2P2/8/5N2/PPPP1PPP/RNBQKB1R b KQkq -" : [149,[1, 18, null], "book"],
  "rnbqkb1r/pp1pp1pp/7n/2p2P2/8/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [190,[51, 35, null], "book"],
  "rnbqkbnr/pp1ppp1p/6p1/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [48,[50, 42, null], "book"],
  "rnbqkbnr/pp1ppp1p/6p1/2p5/2P1P3/5N2/PP1P1PPP/RNBQKB1R b KQkq -" : [52,[5, 14, null], "book"],
  "rnbqk1nr/pp1ppp1p/6pb/2p5/2P1P3/5N2/PP1P1PPP/RNBQKB1R w KQkq -" : [91,[51, 35, null], "book"],
  "rnbqkbnr/pp1ppp1p/6p1/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [20,[26, 35, null], "book"],
  "rnbqk1nr/pp1pppbp/6p1/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [65,[50, 42, null], "book"],
  "rnbqkbnr/pp1pp2p/6p1/2p2p2/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [249,[36, 29, null], "book"],
  "rnbqkbnr/pp1pppp1/7p/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [68,[50, 42, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [43,[61, 25, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/1Bp5/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [39,[14, 22, null], "book"],
  "r1bqkbnr/pp1ppp1p/2n3p1/1Bp5/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [40,[60, 62, null], "book"],
  "r1bqkbnr/pp1ppp1p/2n3p1/1Bp5/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq -" : [32,[5, 14, null], "book"],
  "r1bqk1nr/pp1pppbp/2n3p1/1Bp5/4P3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [36,[25, 18, null], "book"],
  "r1bqk1nr/pp1pppbp/2n3p1/1Bp5/4P3/2P2N2/PP1P1PPP/RNBQ1RK1 b kq -" : [39,[12, 28, null], "book"],
  "r1bqk1nr/pp1p1pbp/2n3p1/1Bp1p3/4P3/2P2N2/PP1P1PPP/RNBQ1RK1 w kq -" : [43,[51, 35, null], "book"],
  "r1bqk1nr/pp1p1pbp/2n3p1/1Bp1p3/3PP3/2P2N2/PP3PPP/RNBQ1RK1 b kq -" : [27,[28, 35, null], "book"],
  "r1bqk2r/pp1pppbp/2n2np1/1Bp5/4P3/2P2N2/PP1P1PPP/RNBQ1RK1 w kq -" : [30,[61, 60, null], "book"],
  "r1bqk2r/pp1pppbp/2n2np1/1Bp5/3PP3/2P2N2/PP3PPP/RNBQ1RK1 b kq -" : [0,[21, 36, null], "book"],
  "r1bqk1nr/pp1pppbp/2n3p1/1Bp5/4P3/5N2/PPPP1PPP/RNBQR1K1 b kq -" : [12,[12, 28, null], "book"],
  "r1bqk1nr/pp1p1pbp/2n3p1/1Bp1p3/4P3/5N2/PPPP1PPP/RNBQR1K1 w kq -" : [22,[25, 18, null], "book"],
  "r1bqk1nr/pp1p1pbp/2n3p1/1Bp1p3/1P2P3/5N2/P1PP1PPP/RNBQR1K1 b kq -" : [20,[18, 33, null], "book"],
  "r1bqkbnr/pp1ppppp/8/nBp5/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [75,[60, 62, null], "book"],
  "r1bqkbnr/pp1ppppp/8/nBp5/1P2P3/5N2/P1PP1PPP/RNBQK2R b KQkq -" : [0,[26, 33, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [38,[26, 35, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [63,[45, 35, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq -" : [61,[6, 21, null], "book"],
  "r1bqkbnr/pp2pppp/2n5/3p4/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [95,[36, 27, null], "book"],
  "r1bqkbnr/pp1p1ppp/2n5/4p3/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [60,[35, 25, null], "book"],
  "r1bqkbnr/pp1p1ppp/2n5/1N2p3/4P3/8/PPP2PPP/RNBQKB1R b KQkq -" : [58,[11, 19, null], "book"],
  "r1bqkbnr/pp3ppp/2np4/1N2p3/4P3/8/PPP2PPP/RNBQKB1R w KQkq -" : [53,[50, 34, null], "book"],
  "r1bqkbnr/pp1ppp1p/2n3p1/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [59,[50, 34, null], "book"],
  "r1bqkbnr/pp1ppp1p/2n3p1/8/2PNP3/8/PP3PPP/RNBQKB1R b KQkq -" : [63,[5, 14, null], "book"],
  "r1bqk1nr/pp1pppbp/2n3p1/8/2PNP3/8/PP3PPP/RNBQKB1R w KQkq -" : [65,[58, 44, null], "book"],
  "r1bqk1nr/pp1pppbp/2n3p1/8/2PNP3/4B3/PP3PPP/RN1QKB1R b KQkq -" : [60,[11, 19, null], "book"],
  "r1bqk2r/pp1pppbp/2n2np1/8/2PNP3/4B3/PP3PPP/RN1QKB1R w KQkq -" : [64,[57, 42, null], "book"],
  "r1bqk2r/pp1pppbp/2n2np1/8/2PNP3/2N1B3/PP3PPP/R2QKB1R b KQkq -" : [67,[11, 19, null], "book"],
  "r1bqk2r/pp1pppbp/2n3p1/8/2PNP1n1/2N1B3/PP3PPP/R2QKB1R w KQkq -" : [71,[59, 38, null], "book"],
  "r1bqkb1r/pp1ppp1p/2n2np1/8/2PNP3/8/PP3PPP/RNBQKB1R w KQkq -" : [70,[57, 42, null], "book"],
  "r1bqkb1r/pp1ppp1p/2n2np1/8/2PNP3/2N5/PP3PPP/R1BQKB1R b KQkq -" : [73,[11, 19, null], "book"],
  "r1bqkb1r/pp1ppp1p/5np1/8/2PnP3/2N5/PP3PPP/R1BQKB1R w KQkq -" : [56,[59, 35, null], "book"],
  "r1bqkb1r/pp1ppp1p/5np1/8/2PQP3/2N5/PP3PPP/R1B1KB1R b KQkq -" : [70,[11, 19, null], "book"],
  "r1bqkb1r/pp2pp1p/3p1np1/8/2PQP3/2N5/PP3PPP/R1B1KB1R w KQkq -" : [55,[58, 44, null], "book"],
  "r1bqkbnr/pp1ppp1p/2n3p1/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq -" : [23,[5, 14, null], "book"],
  "r1bqk1nr/pp1pppbp/2n3p1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [35,[58, 44, null], "book"],
  "r1bqk1nr/pp1pppbp/2n3p1/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq -" : [34,[6, 21, null], "book"],
  "r1bqk2r/pp1pppbp/2n2np1/8/3NP3/2N1B3/PPP2PPP/R2QKB1R w KQkq -" : [33,[61, 34, null], "book"],
  "r1bqk2r/pp1pppbp/2n2np1/8/2BNP3/2N1B3/PPP2PPP/R2QK2R b KQkq -" : [54,[4, 6, null], "book"],
  "r1bqkb1r/pp1ppppp/2n2n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [39,[57, 42, null], "book"],
  "r1bqkb1r/pp1ppppp/2n2n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq -" : [48,[11, 19, null], "book"],
  "r1bqkb1r/pp1p1ppp/2n2n2/4p3/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [50,[35, 25, null], "book"],
  "r1bqkb1r/pp1p1ppp/2n2n2/1N2p3/4P3/2N5/PPP2PPP/R1BQKB1R b KQkq -" : [36,[11, 19, null], "book"],
  "r1bqkb1r/pp3ppp/2np1n2/1N2p3/4P3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [43,[58, 30, null], "book"],
  "r1bqkb1r/pp3ppp/2np1n2/1N2p1B1/4P3/2N5/PPP2PPP/R2QKB1R b KQkq -" : [36,[8, 16, null], "book"],
  "r1bqkb1r/1p3ppp/p1np1n2/1N2p1B1/4P3/2N5/PPP2PPP/R2QKB1R w KQkq -" : [45,[25, 40, null], "book"],
  "r1bqkb1r/1p3ppp/p1np1n2/4p1B1/4P3/N1N5/PPP2PPP/R2QKB1R b KQkq -" : [41,[9, 25, null], "book"],
  "r1bqkb1r/5ppp/p1np1n2/1p2p1B1/4P3/N1N5/PPP2PPP/R2QKB1R w KQkq -" : [40,[42, 27, null], "book"],
  "r1bqkb1r/5ppp/p1np1B2/1p2p3/4P3/N1N5/PPP2PPP/R2QKB1R b KQkq -" : [22,[14, 21, null], "book"],
  "r1bqkb1r/5p1p/p1np1p2/1p2p3/4P3/N1N5/PPP2PPP/R2QKB1R w KQkq -" : [27,[42, 27, null], "book"],
  "r1bqkb1r/5p1p/p1np1p2/1p1Np3/4P3/N7/PPP2PPP/R2QKB1R b KQkq -" : [22,[21, 29, null], "book"],
  "r1bqkb1r/5p1p/p1np4/1p1Npp2/4P3/N7/PPP2PPP/R2QKB1R w KQkq -" : [37,[61, 25, null], "book"],
  "r2qkb1r/1p3ppp/p1npbn2/4p1B1/4P3/N1N5/PPP2PPP/R2QKB1R w KQkq -" : [57,[40, 34, null], "book"],
  "r1bqkb1r/pp1p1ppp/2n2n2/4p3/4P3/2N2N2/PPP2PPP/R1BQKB1R b KQkq -" : [-19,[5, 33, null], "book"],
  "r1b1kbnr/pp1ppppp/1qn5/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [53,[35, 41, null], "book"],
  "r1b1kbnr/ppqppppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [56,[50, 34, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [65,[36, 28, null], "book"],
  "rnbqkb1r/pp1ppppp/5n2/2p1P3/8/5N2/PPPP1PPP/RNBQKB1R b KQkq -" : [61,[21, 27, null], "book"],
  "rnb1kbnr/pp1ppppp/8/q1p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [74,[50, 42, null], "book"],
  "rnb1kbnr/ppqppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [82,[50, 42, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/7N/PPPP1PPP/RNBQKB1R b KQkq -" : [-40,[1, 18, null], "book"],
  "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [25,[62, 45, null], "book"],
  "rnbqkbnr/pp1ppppp/2p5/8/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq -" : [-42,[11, 27, null], "book"],
  "rnbqkbnr/pp1ppppp/2p5/8/2P1P3/8/PP1P1PPP/RNBQKBNR b KQkq -" : [24,[11, 27, null], "book"],
  "rnbqkbnr/pp1ppppp/2p5/8/4P3/3P4/PPP2PPP/RNBQKBNR b KQkq -" : [32,[11, 27, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/4P3/3P4/PPP2PPP/RNBQKBNR w KQkq -" : [37,[62, 45, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/4P3/3P4/PPPN1PPP/R1BQKBNR b KQkq -" : [11,[12, 28, null], "book"],
  "rnbqkbnr/pp2pp1p/2p3p1/3p4/4P3/3P4/PPPN1PPP/R1BQKBNR w KQkq -" : [33,[36, 28, null], "book"],
  "rnbqkbnr/pp2pp1p/2p3p1/3p4/4P3/3P2P1/PPPN1P1P/R1BQKBNR b KQkq -" : [30,[5, 14, null], "book"],
  "rnbqk1nr/pp2ppbp/2p3p1/3p4/4P3/3P2P1/PPPN1P1P/R1BQKBNR w KQkq -" : [43,[61, 54, null], "book"],
  "rnbqk1nr/pp2ppbp/2p3p1/3p4/4P3/3P2P1/PPPN1PBP/R1BQK1NR b KQkq -" : [27,[12, 28, null], "book"],
  "rnbqk1nr/pp3pbp/2p3p1/3pp3/4P3/3P2P1/PPPN1PBP/R1BQK1NR w KQkq -" : [30,[62, 45, null], "book"],
  "rnbqk1nr/pp3pbp/2p3p1/3pp3/4P3/3P1NP1/PPPN1PBP/R1BQK2R b KQkq -" : [19,[6, 12, null], "book"],
  "rnbqk2r/pp2npbp/2p3p1/3pp3/4P3/3P1NP1/PPPN1PBP/R1BQK2R w KQkq -" : [31,[60, 62, null], "book"],
  "rnbqk2r/pp2npbp/2p3p1/3pp3/4P3/3P1NP1/PPPN1PBP/R1BQ1RK1 b kq -" : [35,[4, 6, null], "book"],
  "rnbq1rk1/pp2npbp/2p3p1/3pp3/4P3/3P1NP1/PPPN1PBP/R1BQ1RK1 w - -" : [25,[48, 32, null], "book"],
  "rnbq1rk1/pp2npbp/2p3p1/3pp3/1P2P3/3P1NP1/P1PN1PBP/R1BQ1RK1 b - -" : [0,[8, 24, null], "book"],
  "rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -" : [31,[11, 27, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [37,[36, 28, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/3B4/PPP2PPP/RNBQK1NR b KQkq -" : [0,[27, 36, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/3B4/PPP2PPP/RNBQK1NR w KQkq -" : [129,[36, 28, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/3pP3/3P4/3B4/PPP2PPP/RNBQK1NR b KQkq -" : [128,[21, 6, null], "book"],
  "rnbqkb1r/pp1npppp/2p5/3pP3/3P4/3B4/PPP2PPP/RNBQK1NR w KQkq -" : [149,[28, 20, null], "book"],
  "rnbqkb1r/pp1npppp/2p1P3/3p4/3P4/3B4/PPP2PPP/RNBQK1NR b KQkq -" : [160,[11, 21, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/4B3/PPP2PPP/RN1QKBNR b KQkq -" : [-68,[27, 36, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq -" : [31,[2, 29, null], "book"],
  "rn1qkbnr/pp2pppp/2p5/3pPb2/3P4/8/PPP2PPP/RNBQKBNR w KQkq -" : [34,[57, 51, null], "book"],
  "rn1qkbnr/pp2pppp/2p5/3pPb2/1P1P4/8/P1P2PPP/RNBQKBNR b KQkq -" : [-13,[12, 20, null], "book"],
  "rn1qkbnr/pp2pppp/2p5/3pPb2/3P2P1/8/PPP2P1P/RNBQKBNR b KQkq -" : [17,[29, 36, null], "book"],
  "rn1qkbnr/pp2pppp/2p5/3pPb2/3P3P/8/PPP2PP1/RNBQKBNR b KQkq -" : [40,[15, 31, null], "book"],
  "rn1qkbnr/pp2pppp/2p5/3pPb2/3P4/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [19,[12, 20, null], "book"],
  "rn2kbnr/pp2pppp/1qp5/3pPb2/3P4/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [64,[54, 38, null], "book"],
  "rn1qkbnr/pp2pppp/2p5/3pPb2/3P4/8/PPP1NPPP/RNBQKB1R b KQkq -" : [8,[12, 20, null], "book"],
  "rn1qkbnr/pp2pppp/2p5/3pPb2/3P4/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [34,[12, 20, null], "book"],
  "rnbqkbnr/pp2pppp/8/2ppP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq -" : [43,[62, 45, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq -" : [29,[18, 27, null], "book"],
  "rnbqkbnr/pp2pppp/8/3p4/3P4/8/PPP2PPP/RNBQKBNR w KQkq -" : [29,[61, 43, null], "book"],
  "rnbqkbnr/pp2pppp/8/3p4/2PP4/8/PP3PPP/RNBQKBNR b KQkq -" : [19,[6, 21, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/3p4/2PP4/8/PP3PPP/RNBQKBNR w KQkq -" : [27,[62, 45, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/3p4/2PP4/2N5/PP3PPP/R1BQKBNR b KQkq -" : [18,[1, 18, null], "book"],
  "r1bqkb1r/pp2pppp/2n2n2/3p4/2PP4/2N5/PP3PPP/R1BQKBNR w KQkq -" : [26,[62, 45, null], "book"],
  "r1bqkb1r/pp2pppp/2n2n2/3p2B1/2PP4/2N5/PP3PPP/R2QKBNR b KQkq -" : [0,[2, 20, null], "book"],
  "r1bqkb1r/pp3ppp/2n1pn2/3p2B1/2PP4/2N5/PP3PPP/R2QKBNR w KQkq -" : [22,[62, 45, null], "book"],
  "r1b1kb1r/pp2pppp/2n2n2/q2p2B1/2PP4/2N5/PP3PPP/R2QKBNR w KQkq -" : [29,[48, 40, null], "book"],
  "r1b1kb1r/pp2pppp/1qn2n2/3p2B1/2PP4/2N5/PP3PPP/R2QKBNR w KQkq -" : [100,[34, 27, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/5P2/PPP3PP/RNBQKBNR b KQkq -" : [34,[12, 20, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/8/3Pp3/5P2/PPP3PP/RNBQKBNR w KQkq -" : [52,[45, 36, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/8/3PP3/8/PPP3PP/RNBQKBNR b KQkq -" : [39,[12, 28, null], "book"],
  "rnbqkbnr/pp3ppp/2p5/4p3/3PP3/8/PPP3PP/RNBQKBNR w KQkq -" : [43,[62, 45, null], "book"],
  "rnbqkbnr/pp3ppp/2p5/4p3/3PP3/5N2/PPP3PP/RNBQKB1R b KQkq -" : [35,[2, 38, null], "book"],
  "rnbqkbnr/pp3ppp/2p5/8/3pP3/5N2/PPP3PP/RNBQKB1R w KQkq -" : [62,[61, 34, null], "book"],
  "rnbqkbnr/pp3ppp/2p5/8/2BpP3/5N2/PPP3PP/RNBQK2R b KQkq -" : [59,[1, 11, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [29,[27, 36, null], "book"],
  "rnbqkbnr/p3pppp/2p5/1p1p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [103,[36, 28, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [43,[42, 36, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/8/2BPp3/2N5/PPP2PPP/R1BQK1NR b KQkq -" : [-55,[6, 21, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/8/3Pp3/2N2P2/PPP3PP/R1BQKBNR b KQkq -" : [-50,[36, 45, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/8/3PN3/8/PPP2PPP/R1BQKBNR b KQkq -" : [47,[6, 21, null], "book"],
  "rn1qkbnr/pp2pppp/2p5/5b2/3PN3/8/PPP2PPP/R1BQKBNR w KQkq -" : [35,[36, 46, null], "book"],
  "rn1qkbnr/pp2pppp/2p5/5b2/3P4/6N1/PPP2PPP/R1BQKBNR b KQkq -" : [39,[29, 22, null], "book"],
  "rn1qkbnr/pp2pppp/2p3b1/8/3P4/6N1/PPP2PPP/R1BQKBNR w KQkq -" : [28,[62, 45, null], "book"],
  "rn1qkbnr/pp2pppp/2p3b1/8/3P3P/6N1/PPP2PP1/R1BQKBNR b KQkq -" : [36,[15, 23, null], "book"],
  "rn1qkbnr/pp2ppp1/2p3bp/8/3P3P/6N1/PPP2PP1/R1BQKBNR w KQkq -" : [48,[62, 45, null], "book"],
  "rn1qkbnr/pp2ppp1/2p3bp/8/3P3P/5NN1/PPP2PP1/R1BQKB1R b KQkq -" : [43,[1, 11, null], "book"],
  "r2qkbnr/pp1nppp1/2p3bp/8/3P3P/5NN1/PPP2PP1/R1BQKB1R w KQkq -" : [43,[39, 31, null], "book"],
  "rn1qkbnr/pp2pppp/2p3b1/8/3P4/6NN/PPP2PPP/R1BQKB1R b KQkq -" : [12,[6, 21, null], "book"],
  "rnbqkbnr/pp2ppp1/2p4p/8/3PN3/8/PPP2PPP/R1BQKBNR w KQkq -" : [62,[62, 45, null], "book"],
  "r1bqkbnr/pp1npppp/2p5/8/3PN3/8/PPP2PPP/R1BQKBNR w KQkq -" : [46,[36, 46, null], "book"],
  "r1bqkbnr/pp1npppp/2p5/8/2BPN3/8/PPP2PPP/R1BQK1NR b KQkq -" : [35,[6, 21, null], "book"],
  "r1bqkb1r/pp1npppp/2p2n2/8/2BPN3/8/PPP2PPP/R1BQK1NR w KQkq -" : [52,[36, 30, null], "book"],
  "r1bqkb1r/pp1npppp/2p2n2/6N1/2BP4/8/PPP2PPP/R1BQK1NR b KQkq -" : [36,[12, 20, null], "book"],
  "r1bqkb1r/pp1n1ppp/2p1pn2/6N1/2BP4/8/PPP2PPP/R1BQK1NR w KQkq -" : [34,[59, 52, null], "book"],
  "r1bqkb1r/pp1n1ppp/2p1pn2/6N1/2BP4/8/PPP1QPPP/R1B1K1NR b KQkq -" : [46,[11, 17, null], "book"],
  "r1bqkb1r/pp3ppp/1np1pn2/6N1/2BP4/8/PPP1QPPP/R1B1K1NR w KQkq -" : [26,[34, 43, null], "book"],
  "r1bqkb1r/pp1npppp/2p2N2/8/2BP4/8/PPP2PPP/R1BQK1NR b KQkq -" : [34,[12, 21, null], "book"],
  "r1bqkb1r/pp2pppp/2p2n2/8/2BP4/8/PPP2PPP/R1BQK1NR w KQkq -" : [26,[50, 42, null], "book"],
  "r1bqkbnr/pp1npppp/2p5/8/3PN3/5N2/PPP2PPP/R1BQKB1R b KQkq -" : [40,[6, 21, null], "book"],
  "r1bqkb1r/pp1npppp/2p2n2/8/3PN3/5N2/PPP2PPP/R1BQKB1R w KQkq -" : [50,[36, 21, null], "book"],
  "r1bqkb1r/pp1npppp/2p2n2/8/3P4/5NN1/PPP2PPP/R1BQKB1R b KQkq -" : [41,[12, 20, null], "book"],
  "r1bqkbnr/pp1npppp/2p5/6N1/3P4/8/PPP2PPP/R1BQKBNR b KQkq -" : [54,[6, 21, null], "book"],
  "r1bqkbnr/pp2pppp/2p2n2/6N1/3P4/8/PPP2PPP/R1BQKBNR w KQkq -" : [81,[62, 45, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/8/3PN3/8/PPP2PPP/R1BQKBNR w KQkq -" : [39,[36, 21, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/8/3PN3/3B4/PPP2PPP/R1BQK1NR b KQkq -" : [-28,[3, 35, null], "book"],
  "rnbqkb1r/pp2pppp/2p2N2/8/3P4/8/PPP2PPP/R1BQKBNR b KQkq -" : [34,[12, 21, null], "book"],
  "rnbqkb1r/pp3ppp/2p2p2/8/3P4/8/PPP2PPP/R1BQKBNR w KQkq -" : [44,[50, 42, null], "book"],
  "rnbqkb1r/pp3ppp/2p2p2/8/2BP4/8/PPP2PPP/R1BQK1NR b KQkq -" : [33,[5, 19, null], "book"],
  "rnbqkb1r/pp2pp1p/2p2p2/8/3P4/8/PPP2PPP/R1BQKBNR w KQkq -" : [90,[61, 52, null], "book"],
  "rnbqkbnr/pp2pp1p/2p3p1/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [85,[36, 28, null], "book"],
  "rnbqkbnr/pp2pp1p/2p3p1/3pP3/3P4/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [85,[5, 14, null], "book"],
  "rnbqk1nr/pp2ppbp/2p3p1/3pP3/3P4/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [103,[58, 44, null], "book"],
  "rnbqk1nr/pp2ppbp/2p3p1/3pP3/3P1P2/2N5/PPP3PP/R1BQKBNR b KQkq -" : [69,[15, 31, null], "book"],
  "rnbqk1nr/pp2ppb1/2p3p1/3pP2p/3P1P2/2N5/PPP3PP/R1BQKBNR w KQkq -" : [65,[62, 45, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [104,[36, 28, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPPN1PPP/R1BQKBNR b KQkq -" : [24,[27, 36, null], "book"],
  "rnbqkbnr/pp2pp1p/2p3p1/3p4/3PP3/8/PPPN1PPP/R1BQKBNR w KQkq -" : [83,[36, 28, null], "book"],
  "rnb1kbnr/pp2pppp/1qp5/3p4/3PP3/8/PPPN1PPP/R1BQKBNR w KQkq -" : [80,[50, 42, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [-62,[27, 36, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/8/3Pp3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [-72,[45, 30, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/6N1/3Pp3/8/PPP2PPP/RNBQKB1R b KQkq -" : [-71,[2, 29, null], "book"],
  "rnbqkbnr/pp1pp1pp/2p5/5p2/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [189,[36, 29, null], "book"],
  "r1bqkbnr/pp1ppppp/n1p5/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [107,[62, 45, null], "book"],
  "rnbqkb1r/pp1ppppp/2p2n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [102,[36, 28, null], "book"],
  "rnbqkbnr/pp1ppppp/2p5/8/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq -" : [31,[11, 27, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq -" : [37,[62, 45, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/4P3/2NP4/PPP2PPP/R1BQKBNR b KQkq -" : [-16,[27, 35, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/8/4p3/2NP4/PPP2PPP/R1BQKBNR w KQkq -" : [32,[43, 36, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/6B1/4p3/2NP4/PPP2PPP/R2QKBNR b KQkq -" : [-44,[36, 43, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq -" : [32,[27, 36, null], "book"],
  "rn1qkbnr/pp2pppp/2p5/3p4/4P1b1/2N2N2/PPPP1PPP/R1BQKB1R w KQkq -" : [29,[55, 47, null], "book"],
  "rn1qkbnr/pp2pppp/2p5/3p4/4P1b1/2N2N1P/PPPP1PP1/R1BQKB1R b KQkq -" : [20,[38, 45, null], "book"],
  "rn1qkbnr/pp2pppp/2p5/3p3b/4P3/2N2N1P/PPPP1PP1/R1BQKB1R w KQkq -" : [86,[36, 27, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/8/4p3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq -" : [32,[42, 36, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/6N1/4p3/2N5/PPPP1PPP/R1BQKB1R b KQkq -" : [-35,[12, 28, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/4P3/2N2Q2/PPPP1PPP/R1B1KBNR b KQkq -" : [9,[14, 22, null], "book"],
  "rnbqkbnr/pp1ppppp/2p5/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -" : [30,[11, 27, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [34,[57, 42, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [60,[36, 27, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/1P2P3/8/P1PP1PPP/RNBQKBNR b KQkq -" : [-147,[27, 36, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3P4/8/8/PPPP1PPP/RNBQKBNR b KQkq -" : [61,[3, 27, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3P4/8/8/PPPP1PPP/RNBQKBNR w KQkq -" : [96,[27, 18, null], "book"],
  "rnbqkbnr/pp2pppp/2P5/8/8/8/PPPP1PPP/RNBQKBNR b KQkq -" : [78,[1, 18, null], "book"],
  "rnbqkbnr/pp3ppp/2P5/4p3/8/8/PPPP1PPP/RNBQKBNR w KQkq -" : [147,[18, 9, null], "book"],
  "r1bqkbnr/pp2pppp/2n5/8/8/8/PPPP1PPP/RNBQKBNR w KQkq -" : [80,[62, 45, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3Pp3/8/8/PPPP1PPP/RNBQKBNR w KQkq e6" : [106,[27, 20, null], "book"],
  "rnbqkbnr/ppp2ppp/4P3/8/8/8/PPPP1PPP/RNBQKBNR b KQkq -" : [108,[2, 20, null], "book"],
  "rn1qkbnr/ppp2ppp/4b3/8/8/8/PPPP1PPP/RNBQKBNR w KQkq -" : [105,[62, 45, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3P4/8/8/PPPP1PPP/RNBQKBNR w KQkq -" : [73,[62, 45, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3P4/2P5/8/PP1P1PPP/RNBQKBNR b KQkq -" : [22,[10, 18, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/3P4/2P5/8/PP1P1PPP/RNBQKBNR w KQkq -" : [25,[51, 35, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3P4/2P5/8/PP1P1PPP/RNBQKBNR w KQkq -" : [45,[27, 20, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq -" : [68,[21, 27, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/3P4/3P2b1/8/PPP2PPP/RNBQKBNR w KQkq -" : [70,[61, 25, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/3P4/3P2b1/5P2/PPP3PP/RNBQKBNR b KQkq -" : [95,[38, 29, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/3P1b2/3P4/5P2/PPP3PP/RNBQKBNR w KQkq -" : [88,[54, 38, null], "book"],
  "rn1qkb1r/ppp1pppp/5n2/1B1P1b2/3P4/5P2/PPP3PP/RNBQK1NR b KQkq -" : [50,[10, 18, null], "book"],
  "r2qkb1r/pppnpppp/5n2/1B1P1b2/3P4/5P2/PPP3PP/RNBQK1NR w KQkq -" : [71,[57, 42, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/3P4/3P4/8/PPP2PPP/RNBQKBNR w KQkq -" : [93,[27, 18, null], "book"],
  "rnbqkb1r/pp2pppp/2P2n2/8/3P4/8/PPP2PPP/RNBQKBNR b KQkq -" : [101,[1, 18, null], "book"],
  "rnbqkb1r/pp3ppp/2P2n2/4p3/3P4/8/PPP2PPP/RNBQKBNR w KQkq -" : [180,[18, 9, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3P4/3P4/8/PPP2PPP/RNBQKBNR w KQkq -" : [109,[50, 34, null], "book"],
  "rnbqkb1r/ppp1pp1p/5np1/3P4/2PP4/8/PP3PPP/RNBQKBNR b KQkq -" : [114,[5, 14, null], "book"],
  "rnbqkb1r/p1p1pp1p/5np1/1p1P4/2PP4/8/PP3PPP/RNBQKBNR w KQkq -" : [120,[57, 42, null], "book"],
  "rnbqkb1r/ppp1pppp/8/3n4/3P4/8/PPP2PPP/RNBQKBNR w KQkq -" : [68,[62, 45, null], "book"],
  "rnbqkb1r/ppp1pppp/8/3n4/2PP4/8/PP3PPP/RNBQKBNR b KQkq -" : [68,[27, 21, null], "book"],
  "rnbqkb1r/ppp1pppp/8/8/1nPP4/8/PP3PPP/RNBQKBNR w KQkq -" : [188,[59, 32, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/8/2PP4/8/PP3PPP/RNBQKBNR w KQkq -" : [64,[62, 45, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/8/2PP4/2N5/PP3PPP/R1BQKBNR b KQkq -" : [22,[12, 28, null], "book"],
  "rnbqkb1r/pp2pppp/5n2/2p5/2PP4/2N5/PP3PPP/R1BQKBNR w KQkq -" : [58,[35, 27, null], "book"],
  "rnbqkb1r/ppp1pppp/8/3n4/3P4/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [72,[27, 21, null], "book"],
  "rn1qkb1r/ppp1pppp/8/3n4/3P2b1/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [80,[50, 34, null], "book"],
  "rnbqkb1r/ppp1pp1p/6p1/3n4/3P4/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [96,[50, 34, null], "book"],
  "rnb1kbnr/ppp1pppp/8/3q4/8/8/PPPP1PPP/RNBQKBNR w KQkq -" : [66,[57, 42, null], "book"],
  "rnb1kbnr/ppp1pppp/8/3q4/8/2N5/PPPP1PPP/R1BQKBNR b KQkq -" : [61,[27, 3, null], "book"],
  "rnb1kbnr/ppp1pppp/8/q7/8/2N5/PPPP1PPP/R1BQKBNR w KQkq -" : [61,[62, 45, null], "book"],
  "rnb1kbnr/ppp1pppp/8/q7/1P6/2N5/P1PP1PPP/R1BQKBNR b KQkq -" : [-6,[24, 33, null], "book"],
  "rnb1kbnr/ppp1pppp/8/q7/3P4/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [58,[6, 21, null], "book"],
  "rnb1kbnr/ppp2ppp/8/q3p3/3P4/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [104,[62, 45, null], "book"],
  "rnb1kbnr/ppp2ppp/8/q3p3/3P4/2N2N2/PPP2PPP/R1BQKB1R b KQkq -" : [94,[28, 35, null], "book"],
  "rn2kbnr/ppp2ppp/8/q3p3/3P2b1/2N2N2/PPP2PPP/R1BQKB1R w KQkq -" : [116,[61, 34, null], "book"],
  "rnb1kb1r/ppp1pppp/5n2/q7/3P4/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [66,[62, 45, null], "book"],
  "rnb1kb1r/ppp1pppp/5n2/q7/3P4/2N2N2/PPP2PPP/R1BQKB1R b KQkq -" : [73,[2, 29, null], "book"],
  "rn2kb1r/ppp1pppp/5n2/q4b2/3P4/2N2N2/PPP2PPP/R1BQKB1R w KQkq -" : [80,[45, 28, null], "book"],
  "rn2kb1r/ppp1pppp/5n2/q3Nb2/3P4/2N5/PPP2PPP/R1BQKB1R b KQkq -" : [65,[10, 18, null], "book"],
  "rn2kb1r/pp2pppp/2p2n2/q3Nb2/3P4/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [62,[61, 34, null], "book"],
  "rn2kb1r/pp2pppp/2p2n2/q3Nb2/3P2P1/2N5/PPP2P1P/R1BQKB1R b KQkq -" : [54,[29, 20, null], "book"],
  "rn2kb1r/ppp1pppp/5n2/q7/3P2b1/2N2N2/PPP2PPP/R1BQKB1R w KQkq -" : [99,[55, 47, null], "book"],
  "rn2kb1r/ppp1pppp/5n2/q7/3P2b1/2N2N1P/PPP2PP1/R1BQKB1R b KQkq -" : [98,[38, 45, null], "book"],
  "rnb1kbnr/ppp1pppp/3q4/8/8/2N5/PPPP1PPP/R1BQKBNR w KQkq -" : [63,[51, 35, null], "book"],
  "rnb1kbnr/ppp1pppp/3q4/8/3P4/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [74,[6, 21, null], "book"],
  "rnb1kbnr/pp2pppp/2pq4/8/3P4/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [65,[62, 45, null], "book"],
  "rnb1kb1r/ppp1pppp/3q1n2/8/3P4/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [71,[62, 45, null], "book"],
  "rnb1kb1r/ppp1pppp/3q1n2/8/3P4/2N2N2/PPP2PPP/R1BQKB1R b KQkq -" : [62,[14, 22, null], "book"],
  "rnb1kb1r/1pp1pppp/p2q1n2/8/3P4/2N2N2/PPP2PPP/R1BQKB1R w KQkq -" : [103,[54, 46, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq -" : [-24,[27, 35, null], "book"],
  "rnbqkbnr/ppp1pppp/3p4/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [57,[51, 35, null], "book"],
  "rnbqkbnr/ppp1pppp/3p4/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -" : [65,[6, 21, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/4p3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [52,[62, 45, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/4P3/4P3/8/PPP2PPP/RNBQKBNR b KQkq -" : [32,[19, 28, null], "book"],
  "rn1qkbnr/pppb1ppp/3p4/4P3/4P3/8/PPP2PPP/RNBQKBNR w KQkq -" : [136,[62, 45, null], "book"],
  "rnbqkbnr/ppp2ppp/3pp3/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [74,[62, 45, null], "book"],
  "rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [64,[57, 42, null], "book"],
  "rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/5P2/PPP3PP/RNBQKBNR b KQkq -" : [43,[12, 20, null], "book"],
  "rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [51,[12, 28, null], "book"],
  "rnbqkb1r/pp2pppp/2pp1n2/8/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [79,[53, 37, null], "book"],
  "rnbqkb1r/ppp1pp1p/3p1np1/8/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [76,[58, 44, null], "book"],
  "rnbqkb1r/ppp1pp1p/3p1np1/8/2BPP3/2N5/PPP2PPP/R1BQK1NR b KQkq -" : [55,[5, 14, null], "book"],
  "rnbqkb1r/ppp1pp1p/3p1np1/8/3PP3/2N5/PPP1BPPP/R1BQK1NR b KQkq -" : [68,[5, 14, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/3PP3/2N5/PPP1BPPP/R1BQK1NR w KQkq -" : [55,[62, 45, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/3PP1P1/2N5/PPP1BP1P/R1BQK1NR b KQkq -" : [10,[19, 27, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/3PP2P/2N5/PPP1BPP1/R1BQK1NR b KQkq -" : [46,[15, 31, null], "book"],
  "rnbqkb1r/ppp1pp1p/3p1np1/8/3PP3/2N1B3/PPP2PPP/R2QKBNR b KQkq -" : [68,[5, 14, null], "book"],
  "rnbqkb1r/pp2pp1p/2pp1np1/8/3PP3/2N1B3/PPP2PPP/R2QKBNR w KQkq -" : [77,[62, 45, null], "book"],
  "rnbqkb1r/pp2pp1p/2pp1np1/8/3PP3/2N1B2P/PPP2PP1/R2QKBNR b KQkq -" : [79,[5, 14, null], "book"],
  "rnbqkb1r/pp2pp1p/2pp1np1/8/3PP3/2N1B3/PPPQ1PPP/R3KBNR b KQkq -" : [61,[9, 25, null], "book"],
  "rnbqkb1r/ppp1pp1p/3p1np1/6B1/3PP3/2N5/PPP2PPP/R2QKBNR b KQkq -" : [71,[5, 14, null], "book"],
  "rnbqkb1r/ppp1pp1p/3p1np1/8/3PPP2/2N5/PPP3PP/R1BQKBNR b KQkq -" : [62,[5, 14, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/3PPP2/2N5/PPP3PP/R1BQKBNR w KQkq -" : [67,[62, 45, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/2BPPP2/2N5/PPP3PP/R1BQK1NR b KQkq -" : [25,[21, 36, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/3PPP2/2N2N2/PPP3PP/R1BQKB1R b KQkq -" : [63,[4, 6, null], "book"],
  "rnbqk2r/pp2ppbp/3p1np1/2p5/3PPP2/2N2N2/PPP3PP/R1BQKB1R w KQkq -" : [79,[61, 25, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/3PPP2/2N2N2/PPP3PP/R1BQKB1R w KQ -" : [79,[61, 43, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/3PPP2/2NB1N2/PPP3PP/R1BQK2R b KQ -" : [64,[1, 18, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/3PPP2/2N1BN2/PPP3PP/R2QKB1R b KQ -" : [52,[1, 11, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/4P3/3P1P2/2N2N2/PPP3PP/R1BQKB1R b KQ -" : [33,[19, 28, null], "book"],
  "rnbqkb1r/ppp1pp1p/3p1np1/8/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq -" : [63,[5, 14, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/3PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq -" : [52,[58, 44, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/3PP3/2N2N2/PPP1BPPP/R1BQK2R b KQkq -" : [59,[4, 6, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/3PP3/2N2N2/PPP1BPPP/R1BQK2R w KQ -" : [57,[60, 62, null], "book"],
  "rnbq1rk1/ppp1ppbp/3p1np1/8/3PP3/2N2N2/PPP1BPPP/R1BQ1RK1 b - -" : [50,[12, 28, null], "book"],
  "rn1q1rk1/ppp1ppbp/3p1np1/8/3PP1b1/2N2N2/PPP1BPPP/R1BQ1RK1 w - -" : [66,[58, 44, null], "book"],
  "rnbq1rk1/pp2ppbp/2pp1np1/8/3PP3/2N2N2/PPP1BPPP/R1BQ1RK1 w - -" : [66,[48, 32, null], "book"],
  "r1bq1rk1/ppp1ppbp/2np1np1/8/3PP3/2N2N2/PPP1BPPP/R1BQ1RK1 w - -" : [52,[35, 27, null], "book"],
  "rnbqk2r/ppp1ppbp/3p1np1/8/3PP3/2N2N1P/PPP2PP1/R1BQKB1R b KQkq -" : [55,[4, 6, null], "book"],
  "r1bqkb1r/pppnpppp/3p1n2/8/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [74,[53, 37, null], "book"],
  "r1bqkb1r/pppnpppp/3p1n2/8/3PPP2/2N5/PPP3PP/R1BQKBNR b KQkq -" : [67,[12, 28, null], "book"],
  "rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [-79,[21, 36, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [50,[62, 45, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/P7/1PPP1PPP/RNBQKBNR b KQkq -" : [1,[6, 21, null], "book"],
  "rnbqkbnr/pppp1ppp/8/1B2p3/4P3/8/PPPP1PPP/RNBQK1NR b KQkq -" : [-21,[10, 18, null], "book"],
  "rnbqk1nr/pppp1ppp/8/1Bb1p3/4P3/8/PPPP1PPP/RNBQK1NR w KQkq -" : [15,[62, 45, null], "book"],
  "rnbqk1nr/pppp1ppp/8/1Bb1p3/1P2P3/8/P1PP1PPP/RNBQK1NR b KQkq -" : [-124,[26, 33, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq -" : [13,[6, 21, null], "book"],
  "rnbqkbnr/p1pp1ppp/8/1p2p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq -" : [123,[34, 25, null], "book"],
  "rnbqkbnr/p1pp1ppp/8/1B2p3/4P3/8/PPPP1PPP/RNBQK1NR b KQkq -" : [128,[10, 18, null], "book"],
  "rnbqkbnr/p2p1ppp/2p5/1B2p3/4P3/8/PPPP1PPP/RNBQK1NR w KQkq -" : [135,[25, 32, null], "book"],
  "rnbqkbnr/p1pp2pp/8/1B2pp2/4P3/8/PPPP1PPP/RNBQK1NR w KQkq -" : [211,[36, 29, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b1p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq -" : [16,[62, 45, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b1p3/1PB1P3/8/P1PP1PPP/RNBQK1NR b KQkq -" : [-30,[26, 33, null], "book"],
  "rnbqk1nr/pppp1ppp/8/4p3/1bB1P3/8/P1PP1PPP/RNBQK1NR w KQkq -" : [-13,[50, 42, null], "book"],
  "rnbqk1nr/pppp1ppp/8/4p3/1bB1P3/2P5/P2P1PPP/RNBQK1NR b KQkq -" : [-15,[33, 24, null], "book"],
  "rnbqk1nr/pppp1ppp/8/4p3/1bB1PP2/8/P1PP2PP/RNBQK1NR b KQkq -" : [-140,[28, 37, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b1p3/2B1P3/2P5/PP1P1PPP/RNBQK1NR b KQkq -" : [13,[11, 27, null], "book"],
  "rnbqk1nr/ppp2ppp/8/2bpp3/2B1P3/2P5/PP1P1PPP/RNBQK1NR w KQkq -" : [0,[34, 27, null], "book"],
  "rnbqk1nr/ppp2ppp/8/2bBp3/4P3/2P5/PP1P1PPP/RNBQK1NR b KQkq -" : [1,[6, 21, null], "book"],
  "rnbqk2r/ppp2ppp/5n2/2bBp3/4P3/2P5/PP1P1PPP/RNBQK1NR w KQkq -" : [-4,[51, 35, null], "book"],
  "rnbqk2r/ppp2ppp/5n2/2bBp3/3PP3/2P5/PP3PPP/RNBQK1NR b KQkq -" : [4,[28, 35, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b1p3/2BPP3/8/PPP2PPP/RNBQK1NR b KQkq -" : [-11,[26, 35, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b1p3/2B1PP2/8/PPPP2PP/RNBQK1NR b KQkq -" : [-102,[11, 27, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b1p3/2B1P3/8/PPPPQPPP/RNB1K1NR b KQkq -" : [-28,[6, 21, null], "book"],
  "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/8/PPPPQPPP/RNB1K1NR w KQkq -" : [-41,[62, 45, null], "book"],
  "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1PP2/8/PPPPQ1PP/RNB1K1NR b KQkq -" : [-135,[11, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq -" : [93,[36, 27, null], "book"],
  "rnbqkbnr/pppp2pp/8/4pp2/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq -" : [105,[51, 35, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq -" : [3,[51, 43, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/3P4/PPP2PPP/RNBQK1NR b KQkq -" : [8,[10, 18, null], "book"],
  "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/3P4/PPP2PPP/RNBQK1NR w KQkq -" : [12,[62, 45, null], "book"],
  "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/2NP4/PPP2PPP/R1BQK1NR b KQkq -" : [6,[10, 18, null], "book"],
  "rnbqk2r/ppppbppp/5n2/4p3/2B1P3/3P4/PPP2PPP/RNBQK1NR w KQkq -" : [33,[62, 45, null], "book"],
  "rnbqk2r/ppppbppp/5n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq -" : [26,[11, 19, null], "book"],
  "rnbq1rk1/ppppbppp/5n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQ -" : [111,[45, 28, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P4/PPP2PPP/RNBQK1NR w KQkq -" : [17,[62, 45, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2NP4/PPP2PPP/R1BQK1NR b KQkq -" : [13,[18, 24, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2NP4/PPP2PPP/R1BQK1NR w KQkq -" : [19,[62, 45, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2NP4/PPP1NPPP/R1BQK2R b KQkq -" : [11,[11, 27, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/2BPP3/8/PPP2PPP/RNBQK1NR b KQkq -" : [-36,[28, 35, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/8/2BpP3/8/PPP2PPP/RNBQK1NR w KQkq -" : [-39,[59, 35, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/8/2BpP3/2P5/PP3PPP/RNBQK1NR b KQkq -" : [-131,[21, 36, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/8/2BpP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [-48,[21, 36, null], "book"],
  "rnbqkb1r/pppp1ppp/8/8/2Bpn3/5N2/PPP2PPP/RNBQK2R w KQkq -" : [-52,[59, 35, null], "book"],
  "rnbqkb1r/pppp1ppp/8/8/2BQn3/5N2/PPP2PPP/RNB1K2R b KQkq -" : [-58,[36, 21, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/5P2/PPPP2PP/RNBQK1NR b KQkq -" : [-116,[11, 27, null], "book"],
  "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5P2/PPPP2PP/RNBQK1NR w KQkq -" : [-99,[57, 42, null], "book"],
  "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5P2/PPPPN1PP/RNBQK2R b KQkq -" : [-114,[11, 27, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5P2/PPPPN1PP/RNBQK2R w KQkq -" : [-58,[57, 42, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b1p3/1PB1P3/5P2/P1PPN1PP/RNBQK2R b KQkq -" : [-149,[26, 33, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/2B1PP2/8/PPPP2PP/RNBQK1NR b KQkq -" : [-102,[11, 27, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/2N5/PPPP1PPP/R1BQK1NR b KQkq -" : [11,[1, 18, null], "book"],
  "rnbqkb1r/p1pp1ppp/5n2/1p2p3/2B1P3/2N5/PPPP1PPP/R1BQK1NR w KQkq -" : [128,[34, 25, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4p3/2B1n3/2N5/PPPP1PPP/R1BQK1NR w KQkq -" : [5,[59, 31, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPPNPPP/RNBQK2R b KQkq -" : [-109,[21, 36, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4p3/2B1n3/8/PPPPNPPP/RNBQK2R w KQkq -" : [-100,[51, 35, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4p3/2B1n3/2N5/PPPP1PPP/RNBQK2R b KQkq -" : [-166,[36, 21, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/3B4/PPPP1PPP/RNBQK1NR b KQkq -" : [-16,[6, 21, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/2P5/PP1P1PPP/RNBQKBNR b KQkq -" : [-30,[11, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq -" : [-33,[36, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp2Q/4P3/2P5/PP1P1PPP/RNB1KBNR b KQkq -" : [-118,[6, 21, null], "book"],
  "rnbqk1nr/ppp2ppp/3b4/3pp2Q/4P3/2P5/PP1P1PPP/RNB1KBNR w KQkq -" : [-81,[36, 27, null], "book"],
  "rnbqkbnr/pppp2pp/8/4pp2/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq -" : [96,[36, 29, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/2P1P3/8/PP1P1PPP/RNBQKBNR b KQkq -" : [-51,[5, 26, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/2P1P3/8/PP1P1PPP/RNBQKBNR w KQkq -" : [97,[36, 27, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/3P4/PPP2PPP/RNBQKBNR b KQkq -" : [-15,[6, 21, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/4P3/3P4/PPP2PPP/RNBQKBNR w KQkq -" : [15,[36, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3Pp3/8/3P4/PPP2PPP/RNBQKBNR b KQkq -" : [8,[3, 27, null], "book"],
  "rnbqkbnr/pp3ppp/2p5/3Pp3/8/3P4/PPP2PPP/RNBQKBNR w KQkq -" : [68,[62, 45, null], "book"],
  "rnbqkbnr/pp3ppp/2P5/4p3/8/3P4/PPP2PPP/RNBQKBNR b KQkq -" : [47,[1, 18, null], "book"],
  "r1bqkbnr/pp3ppp/2n5/4p3/8/3P4/PPP2PPP/RNBQKBNR w KQkq -" : [58,[61, 52, null], "book"],
  "rnbqkbnr/pppp2pp/8/4pp2/4P3/3P4/PPP2PPP/RNBQKBNR w KQkq -" : [70,[36, 29, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/3P4/PPP2PPP/RNBQKBNR w KQkq -" : [-5,[62, 45, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/4PP2/3P4/PPP3PP/RNBQKBNR b KQkq -" : [1,[28, 37, null], "book"],
  "rnbqk2r/pppp1ppp/5n2/2b1p3/4PP2/3P4/PPP3PP/RNBQKBNR w KQkq -" : [111,[37, 28, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -" : [-11,[28, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [140,[35, 28, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/3pP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [-5,[62, 45, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/2BpP3/8/PPP2PPP/RNBQK1NR b KQkq -" : [-49,[6, 21, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/3pP3/3B4/PPP2PPP/RNBQK1NR b KQkq -" : [-59,[5, 26, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/3pP3/2P5/PP3PPP/RNBQKBNR b KQkq -" : [-51,[3, 12, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3p4/3pP3/2P5/PP3PPP/RNBQKBNR w KQkq -" : [-6,[36, 27, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/4P3/2p5/PP3PPP/RNBQKBNR w KQkq -" : [3,[57, 42, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/2B1P3/2p5/PP3PPP/RNBQK1NR b KQkq -" : [-68,[42, 49, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/2B1P3/8/Pp3PPP/RNBQK1NR w KQkq -" : [-62,[58, 49, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/2B1P3/8/PB3PPP/RN1QK1NR b KQkq -" : [-66,[6, 21, null], "book"],
  "rnbqk1nr/pppp1ppp/8/8/1bB1P3/8/PB3PPP/RN1QK1NR w KQkq -" : [-49,[57, 42, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3p4/2B1P3/8/PB3PPP/RN1QK1NR w KQkq -" : [22,[34, 27, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/8/2B1P3/8/PB3PPP/RN1QK1NR w KQkq -" : [-79,[57, 42, null], "book"],
  "rnb1kbnr/ppppqppp/8/8/2B1P3/8/PB3PPP/RN1QK1NR w KQkq -" : [51,[57, 42, null], "book"],
  "rnbqkb1r/ppppnppp/8/8/3pP3/2P5/PP3PPP/RNBQKBNR w KQkq -" : [20,[62, 45, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/3pPP2/8/PPP3PP/RNBQKBNR b KQkq -" : [-111,[1, 18, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b5/3pPP2/8/PPP3PP/RNBQKBNR w KQkq -" : [-84,[61, 43, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b5/3pPP2/5N2/PPP3PP/RNBQKB1R b KQkq -" : [-86,[11, 27, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b5/3pPP2/5N2/PPP3PP/RNBQKB1R w KQkq -" : [-83,[61, 43, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b5/3pPP2/2P2N2/PP4PP/RNBQKB1R b KQkq -" : [-110,[11, 27, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/3pP3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [-11,[5, 33, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b5/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [0,[45, 35, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b5/3pP3/2P2N2/PP3PPP/RNBQKB1R b KQkq -" : [-39,[35, 42, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b5/4P3/2p2N2/PP3PPP/RNBQKB1R w KQkq -" : [-35,[57, 42, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b5/2B1P3/2p2N2/PP3PPP/RNBQK2R b KQkq -" : [-31,[11, 27, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/3QP3/8/PPP2PPP/RNB1KBNR b KQkq -" : [-27,[1, 18, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/3QP3/8/PPP2PPP/RNB1KBNR w KQkq -" : [-24,[35, 34, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/2Q1P3/8/PPP2PPP/RNB1KBNR b KQkq -" : [-20,[6, 21, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/4P3/4Q3/PPP2PPP/RNB1KBNR b KQkq -" : [-22,[6, 21, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/8/4P3/4Q3/PPP2PPP/RNB1KBNR w KQkq -" : [-42,[58, 51, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/8/4P3/2N1Q3/PPP2PPP/R1B1KBNR b KQkq -" : [-32,[5, 33, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/8/1b2P3/2N1Q3/PPP2PPP/R1B1KBNR w KQkq -" : [-28,[48, 40, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/8/1b2P3/2N1Q3/PPPB1PPP/R3KBNR b KQkq -" : [-30,[4, 6, null], "book"],
  "r1bq1rk1/pppp1ppp/2n2n2/8/1b2P3/2N1Q3/PPPB1PPP/R3KBNR w KQ -" : [-40,[60, 58, null], "book"],
  "r1bq1rk1/pppp1ppp/2n2n2/8/1b2P3/2N1Q3/PPPB1PPP/2KR1BNR b - -" : [-61,[5, 4, null], "book"],
  "r1bqr1k1/pppp1ppp/2n2n2/8/1b2P3/2N1Q3/PPPB1PPP/2KR1BNR w - -" : [-37,[61, 34, null], "book"],
  "r1bqr1k1/pppp1ppp/2n2n2/8/1bB1P3/2N1Q3/PPPB1PPP/2KR2NR b - -" : [-45,[11, 19, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/5P2/PPPP2PP/RNBQKBNR b KQkq -" : [-74,[6, 21, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5P2/PPPP2PP/RNBQKBNR w KQkq -" : [-75,[51, 35, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/2N2P2/PPPP2PP/R1BQKBNR b KQkq -" : [-93,[5, 26, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq -" : [-59,[28, 37, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b1p3/4PP2/8/PPPP2PP/RNBQKBNR w KQkq -" : [-6,[57, 42, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b1p3/4PP2/5N2/PPPP2PP/RNBQKB1R b KQkq -" : [-1,[11, 19, null], "book"],
  "rnbqk1nr/ppp2ppp/3p4/2b1p3/4PP2/5N2/PPPP2PP/RNBQKB1R w KQkq -" : [8,[50, 42, null], "book"],
  "rnbqk1nr/ppp2ppp/3p4/2b1p3/1P2PP2/5N2/P1PP2PP/RNBQKB1R b KQkq -" : [-54,[26, 33, null], "book"],
  "rnbqk1nr/ppp2ppp/3p4/2b1p3/4PP2/2P2N2/PP1P2PP/RNBQKB1R b KQkq -" : [5,[13, 29, null], "book"],
  "rn1qk1nr/ppp2ppp/3p4/2b1p3/4PPb1/2P2N2/PP1P2PP/RNBQKB1R w KQkq -" : [40,[55, 47, null], "book"],
  "rn1qk1nr/ppp2ppp/3p4/2b1P3/4P1b1/2P2N2/PP1P2PP/RNBQKB1R b KQkq -" : [41,[19, 28, null], "book"],
  "rn1qk1nr/ppp2ppp/8/2b1p3/4P1b1/2P2N2/PP1P2PP/RNBQKB1R w KQkq -" : [40,[61, 34, null], "book"],
  "rn1qk1nr/ppp2ppp/8/2b1p3/Q3P1b1/2P2N2/PP1P2PP/RNB1KB1R b KQkq -" : [33,[38, 11, null], "book"],
  "rnbqk1nr/ppp3pp/3p4/2b1pp2/4PP2/2P2N2/PP1P2PP/RNBQKB1R w KQkq -" : [1,[37, 28, null], "book"],
  "rnbqk1nr/ppp2ppp/3p4/2b1p3/4PP2/2N2N2/PPPP2PP/R1BQKB1R b KQkq -" : [6,[6, 21, null], "book"],
  "rnbqk2r/ppp2ppp/3p1n2/2b1p3/4PP2/2N2N2/PPPP2PP/R1BQKB1R w KQkq -" : [-8,[61, 34, null], "book"],
  "rnbqk2r/ppp2ppp/3p1n2/2b1p3/2B1PP2/2N2N2/PPPP2PP/R1BQK2R b KQkq -" : [-3,[4, 6, null], "book"],
  "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1PP2/2N2N2/PPPP2PP/R1BQK2R w KQkq -" : [-8,[51, 43, null], "book"],
  "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1PP2/2NP1N2/PPP3PP/R1BQK2R b KQkq -" : [-7,[8, 24, null], "book"],
  "r2qk2r/ppp2ppp/2np1n2/2b1p3/2B1PPb1/2NP1N2/PPP3PP/R1BQK2R w KQkq -" : [8,[34, 25, null], "book"],
  "rnbqk1nr/pppp1p1p/8/2b1p1p1/4PP2/5N2/PPPP2PP/RNBQKB1R w KQkq -" : [173,[37, 30, null], "book"],
  "rnbqkbnr/pp1p1ppp/8/2p1p3/4PP2/8/PPPP2PP/RNBQKBNR w KQkq -" : [58,[62, 45, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/4PP2/8/PPPP2PP/RNBQKBNR w KQkq -" : [-29,[36, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/3PPP2/8/PPP3PP/RNBQKBNR b KQkq -" : [-83,[28, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3Pp3/5P2/8/PPPP2PP/RNBQKBNR b KQkq -" : [-48,[28, 37, null], "book"],
  "rnbqk1nr/ppp2ppp/8/2bPp3/5P2/8/PPPP2PP/RNBQKBNR w KQkq -" : [46,[57, 42, null], "book"],
  "rnbqkbnr/pp3ppp/2p5/3Pp3/5P2/8/PPPP2PP/RNBQKBNR w KQkq -" : [35,[59, 52, null], "book"],
  "rnbqkbnr/pp3ppp/2P5/4p3/5P2/8/PPPP2PP/RNBQKBNR b KQkq -" : [-36,[1, 18, null], "book"],
  "rnbqk1nr/pp3ppp/2P5/2b1p3/5P2/8/PPPP2PP/RNBQKBNR w KQkq -" : [82,[62, 45, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3P4/4pP2/8/PPPP2PP/RNBQKBNR w KQkq -" : [69,[51, 43, null], "book"],
  "rnbqkbnr/ppp2ppp/8/1B1P4/4pP2/8/PPPP2PP/RNBQK1NR b KQkq -" : [-16,[10, 18, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3P4/4pP2/3P4/PPP3PP/RNBQKBNR b KQkq -" : [33,[6, 21, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3P4/4pP2/3P4/PPP3PP/RNBQKBNR w KQkq -" : [65,[43, 36, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3P4/4pP2/2NP4/PPP3PP/R1BQKBNR b KQkq -" : [-48,[5, 33, null], "book"],
  "rnbqk2r/ppp2ppp/5n2/3P4/1b2pP2/2NP4/PPP3PP/R1BQKBNR w KQkq -" : [-32,[58, 51, null], "book"],
  "rnbqk2r/ppp2ppp/5n2/3P4/1b2pP2/2NP4/PPPB2PP/R2QKBNR b KQkq -" : [-27,[36, 43, null], "book"],
  "rnbqk2r/ppp2ppp/5n2/3P4/1b3P2/2NPp3/PPPB2PP/R2QKBNR w KQkq -" : [9,[51, 44, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3P4/4pP2/3P4/PPPN2PP/R1BQKBNR b KQkq -" : [-31,[36, 43, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3P4/4pP2/3P4/PPP1Q1PP/RNB1KBNR b KQkq -" : [-19,[2, 38, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3P4/5p2/8/PPPP2PP/RNBQKBNR w KQkq -" : [-24,[62, 45, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/4PP2/5N2/PPPP2PP/RNBQKB1R b KQkq -" : [-30,[28, 37, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPP2PP/RNBQKBNR w KQkq -" : [-63,[61, 52, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/4Pp2/1P6/P1PP2PP/RNBQKBNR b KQkq -" : [-198,[3, 39, null], "book"],
  "rnbqkbnr/pppp1ppp/8/1B6/4Pp2/8/PPPP2PP/RNBQK1NR b KQkq -" : [-149,[10, 18, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/2B1Pp2/8/PPPP2PP/RNBQK1NR b KQkq -" : [-66,[1, 18, null], "book"],
  "rnbqkbnr/p1pp1ppp/8/1p6/2B1Pp2/8/PPPP2PP/RNBQK1NR w KQkq -" : [0,[34, 13, null], "book"],
  "rnbqkbnr/pp1p1ppp/2p5/8/2B1Pp2/8/PPPP2PP/RNBQK1NR w KQkq -" : [-42,[51, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3p4/2B1Pp2/8/PPPP2PP/RNBQK1NR w KQkq -" : [-47,[34, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3B4/4Pp2/8/PPPP2PP/RNBQK1NR b KQkq -" : [-50,[3, 39, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3B4/4Pp2/8/PPPP2PP/RNBQK1NR w KQkq -" : [-24,[57, 42, null], "book"],
  "rnbqkbnr/pppp2pp/8/5p2/2B1Pp2/8/PPPP2PP/RNBQK1NR w KQkq -" : [0,[59, 52, null], "book"],
  "rnbqkbnr/pppp1p1p/8/6p1/2B1Pp2/8/PPPP2PP/RNBQK1NR w KQkq -" : [21,[55, 39, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/2B1Pp2/8/PPPP2PP/RNBQK1NR w KQkq -" : [-49,[51, 35, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/8/2B1Pp2/8/PPPP2PP/RNBQK1NR w KQkq -" : [-34,[57, 42, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/8/2B1Pp2/2N5/PPPP2PP/R1BQK1NR b KQkq -" : [-28,[10, 18, null], "book"],
  "rnbqkb1r/pp1p1ppp/2p2n2/8/2B1Pp2/2N5/PPPP2PP/R1BQK1NR w KQkq -" : [-32,[51, 35, null], "book"],
  "rnb1kbnr/pppp1ppp/8/8/2B1Pp1q/8/PPPP2PP/RNBQK1NR w KQkq -" : [-35,[60, 61, null], "book"],
  "rnb1kbnr/pppp1ppp/8/8/2B1Pp1q/8/PPPP2PP/RNBQ1KNR b kq -" : [-27,[11, 27, null], "book"],
  "rnb1kbnr/p1pp1ppp/8/1p6/2B1Pp1q/8/PPPP2PP/RNBQ1KNR w kq -" : [48,[34, 25, null], "book"],
  "rnb1k1nr/pppp1ppp/8/2b5/2B1Pp1q/8/PPPP2PP/RNBQ1KNR w kq -" : [57,[51, 35, null], "book"],
  "rnb1kbnr/ppp2ppp/3p4/8/2B1Pp1q/8/PPPP2PP/RNBQ1KNR w kq -" : [-50,[51, 35, null], "book"],
  "rnb1kbnr/pppp1p1p/8/6p1/2B1Pp1q/8/PPPP2PP/RNBQ1KNR w kq -" : [-32,[57, 42, null], "book"],
  "rnb1kbnr/pppp1p1p/8/6p1/2B1Pp1q/2N5/PPPP2PP/R1BQ1KNR b kq -" : [-22,[11, 19, null], "book"],
  "rnb1k1nr/pppp1pbp/8/6p1/2B1Pp1q/2N5/PPPP2PP/R1BQ1KNR w kq -" : [-11,[54, 46, null], "book"],
  "rnb1k1nr/pppp1pbp/8/6p1/2BPPp1q/2N5/PPP3PP/R1BQ1KNR b kq -" : [-33,[11, 19, null], "book"],
  "rnb1k1nr/ppp2pbp/3p4/6p1/2BPPp1q/2N5/PPP3PP/R1BQ1KNR w kq -" : [-45,[54, 46, null], "book"],
  "rnb1k1nr/ppp2pbp/3p4/4P1p1/2BP1p1q/2N5/PPP3PP/R1BQ1KNR b kq -" : [-52,[6, 12, null], "book"],
  "rnb1k2r/ppppnpbp/8/6p1/2BPPp1q/2N5/PPP3PP/R1BQ1KNR w kq -" : [34,[54, 46, null], "book"],
  "rnb1k2r/ppppnpbp/8/6p1/2BPPp1q/2N3P1/PPP4P/R1BQ1KNR b kq -" : [47,[39, 23, null], "book"],
  "rnb1k1nr/pppp1pbp/8/6p1/2B1Pp1q/2N3P1/PPPP3P/R1BQ1KNR b kq -" : [-4,[37, 46, null], "book"],
  "rnb1k1nr/pppp1pbp/8/6p1/2B1P2q/2N3p1/PPPP3P/R1BQ1KNR w kq -" : [-31,[59, 45, null], "book"],
  "rnb1k1nr/pppp1pbp/8/6p1/2B1P2q/2N2Qp1/PPPP3P/R1B2KNR b kq -" : [-50,[46, 54, null], "book"],
  "rnb1kbnr/pppp1p1p/8/6p1/2B1Pp1q/5Q2/PPPP2PP/RNB2KNR b kq -" : [-106,[39, 23, null], "book"],
  "r1b1kbnr/pppp1ppp/2n5/8/2B1Pp1q/8/PPPP2PP/RNBQ1KNR w kq -" : [0,[62, 45, null], "book"],
  "rnb1kb1r/pppp1ppp/5n2/8/2B1Pp1q/8/PPPP2PP/RNBQ1KNR w kq -" : [-33,[62, 45, null], "book"],
  "rnb1kbnr/pppp1ppp/5q2/8/2B1Pp2/8/PPPP2PP/RNBQ1KNR w kq -" : [-8,[57, 42, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPPB1PP/RNBQK1NR b KQkq -" : [-52,[11, 27, null], "book"],
  "rnbqkbnr/pppp2pp/8/5p2/4Pp2/8/PPPPB1PP/RNBQK1NR w KQkq -" : [-55,[36, 28, null], "book"],
  "rnbqkbnr/pppp2pp/8/5P2/5p2/8/PPPPB1PP/RNBQK1NR b KQkq -" : [-80,[3, 39, null], "book"],
  "rnbqkbnr/ppp3pp/3p4/5P2/5p2/8/PPPPB1PP/RNBQK1NR w KQkq -" : [59,[62, 45, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/3PPp2/8/PPP3PP/RNBQKBNR b KQkq -" : [-79,[3, 39, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/4Pp2/6P1/PPPP3P/RNBQKBNR b KQkq -" : [-173,[37, 46, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/4P3/6p1/PPPP3P/RNBQKBNR w KQkq -" : [-169,[55, 46, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/4P3/5Np1/PPPP3P/RNBQKB1R b KQkq -" : [-214,[11, 27, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/4Pp1P/8/PPPP2P1/RNBQKBNR b KQkq -" : [-119,[11, 27, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPP1KPP/RNBQ1BNR b kq -" : [-237,[6, 21, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/4Pp2/2N5/PPPP2PP/R1BQKBNR b KQkq -" : [-69,[3, 39, null], "book"],
  "rnb1kbnr/pppp1ppp/8/8/4Pp1q/2N5/PPPP2PP/R1BQKBNR w KQkq -" : [-45,[60, 52, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPPN1PP/RNBQKB1R b KQkq -" : [-189,[3, 39, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/4Pp2/5N2/PPPP2PP/RNBQKB1R b KQkq -" : [-79,[14, 30, null], "book"],
  "rnbqk1nr/ppppbppp/8/8/4Pp2/5N2/PPPP2PP/RNBQKB1R w KQkq -" : [-7,[61, 52, null], "book"],
  "rnbqk1nr/ppppbppp/8/8/2B1Pp2/5N2/PPPP2PP/RNBQK2R b KQkq -" : [-35,[6, 21, null], "book"],
  "rnbqk1nr/pppp1ppp/8/8/2B1Pp1b/5N2/PPPP2PP/RNBQK2R w KQkq -" : [-22,[60, 61, null], "book"],
  "rnbqk1nr/pppp1ppp/8/8/2B1Pp1b/5NP1/PPPP3P/RNBQK2R b KQkq -" : [-74,[37, 46, null], "book"],
  "rnbqk2r/ppppbppp/5n2/8/2B1Pp2/5N2/PPPP2PP/RNBQK2R w KQkq -" : [-41,[51, 43, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3p4/4Pp2/5N2/PPPP2PP/RNBQKB1R w KQkq -" : [-22,[36, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3P4/5p2/5N2/PPPP2PP/RNBQKB1R b KQkq -" : [-30,[6, 21, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3P4/5p2/5N2/PPPP2PP/RNBQKB1R w KQkq -" : [-34,[61, 25, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/8/4Pp2/5N2/PPPP2PP/RNBQKB1R w KQkq -" : [-14,[51, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/8/1P2Pp2/5N2/P1PP2PP/RNBQKB1R b KQkq -" : [-117,[5, 12, null], "book"],
  "rnbqkbnr/pppp2pp/8/5p2/4Pp2/5N2/PPPP2PP/RNBQKB1R w KQkq -" : [40,[51, 43, null], "book"],
  "rnbqkbnr/pppp1p1p/8/6p1/4Pp2/5N2/PPPP2PP/RNBQKB1R w KQkq -" : [-70,[57, 42, null], "book"],
  "rnbqkbnr/pppp1p1p/8/6p1/2B1Pp2/5N2/PPPP2PP/RNBQK2R b KQkq -" : [-102,[30, 38, null], "book"],
  "rnbqk1nr/pppp1pbp/8/6p1/2B1Pp2/5N2/PPPP2PP/RNBQK2R w KQkq -" : [-58,[55, 39, null], "book"],
  "rnbqk1nr/pppp1pbp/8/6p1/2BPPp2/5N2/PPP3PP/RNBQK2R b KQkq -" : [-59,[11, 19, null], "book"],
  "rnbqk1nr/ppp2pbp/3p4/6p1/2BPPp2/5N2/PPP3PP/RNBQK2R w KQkq -" : [-68,[55, 39, null], "book"],
  "rnbqk1nr/ppp2pbp/3p4/6p1/2BPPp2/2P2N2/PP4PP/RNBQK2R b KQkq -" : [-120,[15, 23, null], "book"],
  "rnbqk1nr/pppp1pbp/8/6p1/2B1Pp1P/5N2/PPPP2P1/RNBQK2R b KQkq -" : [-53,[15, 23, null], "book"],
  "rnbqk1nr/pppp1pb1/7p/6p1/2B1Pp1P/5N2/PPPP2P1/RNBQK2R w KQkq -" : [-73,[51, 35, null], "book"],
  "rnbqk1nr/pppp1pb1/7p/6p1/2BPPp1P/5N2/PPP3P1/RNBQK2R b KQkq -" : [-74,[1, 18, null], "book"],
  "rnbqk1nr/ppp2pb1/3p3p/6p1/2BPPp1P/5N2/PPP3P1/RNBQK2R w KQkq -" : [-61,[59, 43, null], "book"],
  "rnbqk1nr/ppp2pb1/3p3p/6P1/2BPPp2/5N2/PPP3P1/RNBQK2R b KQkq -" : [-127,[23, 30, null], "book"],
  "rnbqk1nr/ppp2pb1/3p4/6p1/2BPPp2/5N2/PPP3P1/RNBQK2R w KQkq -" : [-139,[63, 7, null], "book"],
  "rnbqk1nR/ppp2pb1/3p4/6p1/2BPPp2/5N2/PPP3P1/RNBQK3 b Qq -" : [-159,[14, 7, null], "book"],
  "rnbqk1nr/ppp2pb1/3p3p/6p1/2BPPp1P/3Q1N2/PPP3P1/RNB1K2R b KQkq -" : [-73,[1, 18, null], "book"],
  "rnbqk1nr/pppp1pbp/8/6p1/2B1Pp2/5N2/PPPP2PP/RNBQ1RK1 b kq -" : [-119,[11, 19, null], "book"],
  "rnbqkbnr/ppp2p1p/3p4/6p1/2B1Pp2/5N2/PPPP2PP/RNBQK2R w KQkq -" : [-16,[55, 39, null], "book"],
  "rnbqkbnr/ppp2p1p/3p4/6p1/2B1Pp2/5N2/PPPP2PP/RNBQ1RK1 b kq -" : [-134,[1, 18, null], "book"],
  "rn1qkbnr/ppp2p1p/3p4/6p1/2B1Ppb1/5N2/PPPP2PP/RNBQ1RK1 w kq -" : [-22,[51, 35, null], "book"],
  "rn1qkbnr/ppp2p1p/3p4/6p1/2B1Ppb1/5N1P/PPPP2P1/RNBQ1RK1 b kq -" : [-81,[38, 31, null], "book"],
  "rn1qkbnr/ppp2p2/3p4/6pp/2B1Ppb1/5N1P/PPPP2P1/RNBQ1RK1 w kq -" : [-36,[51, 35, null], "book"],
  "rn1qkbnr/ppp2p2/3p4/6pp/2B1PpP1/5N2/PPPP2P1/RNBQ1RK1 b kq -" : [-124,[31, 38, null], "book"],
  "rnbqkbnr/pppp1p1p/8/8/2B1Ppp1/5N2/PPPP2PP/RNBQK2R w KQkq -" : [-110,[45, 62, null], "book"],
  "rnbqkbnr/pppp1B1p/8/8/4Ppp1/5N2/PPPP2PP/RNBQK2R b KQkq -" : [-195,[4, 13, null], "book"],
  "rnbq1bnr/pppp1k1p/8/8/4Ppp1/5N2/PPPP2PP/RNBQK2R w KQ -" : [-225,[45, 28, null], "book"],
  "rnbq1bnr/pppp1k1p/8/8/4Ppp1/5N2/PPPP2PP/RNBQ1RK1 b - -" : [-235,[11, 19, null], "book"],
  "rnbq1bnr/pppp1k1p/8/8/4Pp2/5p2/PPPP2PP/RNBQ1RK1 w - -" : [-233,[59, 45, null], "book"],
  "rnbq1bnr/pppp1k1p/8/8/4Pp2/5Q2/PPPP2PP/RNB2RK1 b - -" : [-253,[11, 19, null], "book"],
  "rnb2bnr/pppp1k1p/5q2/8/4Pp2/5Q2/PPPP2PP/RNB2RK1 w - -" : [-236,[51, 35, null], "book"],
  "rnb2bnr/pppp1k1p/5q2/8/3PPp2/5Q2/PPP3PP/RNB2RK1 b - -" : [-209,[21, 35, null], "book"],
  "rnb2bnr/pppp1k1p/8/8/3qPp2/5Q2/PPP3PP/RNB2RK1 w - -" : [-122,[58, 44, null], "book"],
  "rnb2bnr/pppp1k1p/8/8/3qPp2/4BQ2/PPP3PP/RN3RK1 b - -" : [-102,[35, 14, null], "book"],
  "rnbqkbnr/pppp1p1p/8/8/2BPPpp1/5N2/PPP3PP/RNBQK2R b KQkq -" : [-139,[11, 27, null], "book"],
  "rnbqkbnr/pppp1p1p/8/8/2BPPp2/5p2/PPP3PP/RNBQK2R w KQkq -" : [-153,[60, 62, null], "book"],
  "rnbqkbnr/pppp1p1p/8/8/2BPPB2/5p2/PPP3PP/RN1QK2R b KQkq -" : [-245,[5, 33, null], "book"],
  "rnbqkbnr/pppp1p1p/8/8/2BPPp2/5Q2/PPP3PP/RNB1K2R b KQkq -" : [-148,[11, 27, null], "book"],
  "rnbqkbnr/pppp1p1p/8/8/2B1PppP/5N2/PPPP2P1/RNBQK2R b KQkq h3" : [-290,[38, 45, null], "book"],
  "rnbqkbnr/pppp1p1p/8/8/2B1Ppp1/2N2N2/PPPP2PP/R1BQK2R b KQkq -" : [-91,[1, 18, null], "book"],
  "rnbqkbnr/pppp1p1p/8/4N3/2B1Ppp1/8/PPPP2PP/RNBQK2R b KQkq -" : [-104,[3, 39, null], "book"],
  "rnb1kbnr/pppp1p1p/8/4N3/2B1Pppq/8/PPPP2PP/RNBQK2R w KQkq -" : [-130,[60, 61, null], "book"],
  "rnb1kbnr/pppp1p1p/8/4N3/2B1Pppq/8/PPPP2PP/RNBQ1K1R b kq -" : [-100,[1, 18, null], "book"],
  "rnb1kbnr/pppp1p1p/8/4N3/2B1P1pq/5p2/PPPP2PP/RNBQ1K1R w kq -" : [-44,[51, 35, null], "book"],
  "r1b1kbnr/pppp1p1p/2n5/4N3/2B1Pppq/8/PPPP2PP/RNBQ1K1R w kq -" : [-108,[51, 35, null], "book"],
  "rnb1kb1r/pppp1p1p/5n2/4N3/2B1Pppq/8/PPPP2PP/RNBQ1K1R w kq -" : [-63,[51, 35, null], "book"],
  "rnb1kb1r/pppp1p1p/7n/4N3/2B1Pppq/8/PPPP2PP/RNBQ1K1R w kq -" : [-13,[51, 35, null], "book"],
  "rnb1kb1r/pppp1p1p/7n/4N3/2BPPppq/8/PPP3PP/RNBQ1K1R b kq -" : [-23,[37, 45, null], "book"],
  "rnb1kb1r/ppp2p1p/3p3n/4N3/2BPPppq/8/PPP3PP/RNBQ1K1R w kq -" : [25,[28, 43, null], "book"],
  "rnbqkbnr/pppp1p1p/8/8/2B1Ppp1/5N2/PPPP2PP/RNBQ1RK1 b kq -" : [-104,[38, 45, null], "book"],
  "rnbqkbnr/ppp2p1p/8/3p4/2B1Ppp1/5N2/PPPP2PP/RNBQ1RK1 w kq -" : [-12,[36, 27, null], "book"],
  "rnbqkbnr/pppp1p1p/8/8/2B1Pp2/5p2/PPPP2PP/RNBQ1RK1 w kq -" : [-123,[59, 45, null], "book"],
  "rnbqkbnr/pppp1p1p/8/8/2B1Pp2/5Q2/PPPP2PP/RNB2RK1 b kq -" : [-121,[3, 21, null], "book"],
  "r1bqkbnr/pppp1p1p/2n5/8/2B1Pp2/5Q2/PPPP2PP/RNB2RK1 w kq -" : [79,[45, 37, null], "book"],
  "rnb1kbnr/ppppqp1p/8/8/2B1Pp2/5Q2/PPPP2PP/RNB2RK1 w kq -" : [-44,[45, 37, null], "book"],
  "rnb1kbnr/pppp1p1p/5q2/8/2B1Pp2/5Q2/PPPP2PP/RNB2RK1 w kq -" : [-94,[51, 43, null], "book"],
  "rnb1kbnr/pppp1B1p/5q2/8/4Pp2/5Q2/PPPP2PP/RNB2RK1 b kq -" : [-368,[21, 13, null], "book"],
  "rnb2bnr/pppp1k1p/5q2/8/4Pp2/4BQ2/PPP3PP/RN3RK1 w - -" : [68,[44, 37, null], "book"],
  "rnb1kbnr/pppp1p1p/5q2/4P3/2B2p2/5Q2/PPPP2PP/RNB2RK1 b kq -" : [-173,[21, 28, null], "book"],
  "rnb1kbnr/pppp1p1p/8/4q3/2B2p2/5Q2/PPPP2PP/RNB2RK1 w kq -" : [-138,[51, 43, null], "book"],
  "rnb1kbnr/pppp1B1p/8/4q3/5p2/5Q2/PPPP2PP/RNB2RK1 b kq -" : [-163,[4, 13, null], "book"],
  "rnb1kbnr/pppp1p1p/8/4q3/2B2p2/3P1Q2/PPP3PP/RNB2RK1 b kq -" : [-164,[5, 23, null], "book"],
  "rnb1k1nr/pppp1p1p/7b/4q3/2B2p2/3P1Q2/PPP3PP/RNB2RK1 w kq -" : [-130,[57, 42, null], "book"],
  "rnb1k1nr/pppp1p1p/7b/4q3/2B2p2/2NP1Q2/PPP3PP/R1B2RK1 b kq -" : [-144,[6, 12, null], "book"],
  "rnb1k2r/ppppnp1p/7b/4q3/2B2p2/2NP1Q2/PPP3PP/R1B2RK1 w kq -" : [-135,[58, 37, null], "book"],
  "rnb1k2r/ppppnp1p/7b/4q3/2B2p2/2NP1Q2/PPPB2PP/R4RK1 b kq -" : [-171,[4, 6, null], "book"],
  "rnb1kbnr/pppp1p1p/5q2/8/2B1Pp2/2N2Q2/PPPP2PP/R1B2RK1 b kq -" : [-227,[21, 35, null], "book"],
  "rnb1kbnr/pppp1p1p/8/8/2BqPp2/2N2Q2/PPPP2PP/R1B2RK1 w kq -" : [-217,[62, 63, null], "book"],
  "rnb1kbnr/pppp1p1p/8/8/2BqPp2/2N2Q2/PPPP2PP/R1B2R1K b kq -" : [-225,[35, 34, null], "book"],
  "rnb1kbnr/pppp1p1p/8/8/2q1Pp2/2N2Q2/PPPP2PP/R1B2R1K w kq -" : [-186,[49, 41, null], "book"],
  "rnb1kbnr/pppp1p1p/8/3N4/2q1Pp2/5Q2/PPPP2PP/R1B2R1K b kq -" : [-216,[11, 19, null], "book"],
  "rnb1kbnr/ppppqp1p/8/8/2B1Ppp1/5N2/PPPP2PP/RNBQ1RK1 w kq -" : [123,[51, 35, null], "book"],
  "r1bqkbnr/pppp1p1p/2n5/6p1/2B1Pp2/5N2/PPPP2PP/RNBQK2R w KQkq -" : [-96,[51, 35, null], "book"],
  "rnbqkbnr/pppp1p1p/8/6p1/3PPp2/5N2/PPP3PP/RNBQKB1R b KQkq -" : [-104,[30, 38, null], "book"],
  "rnbqkbnr/pppp1p1p/8/8/3PPpp1/5N2/PPP3PP/RNBQKB1R w KQkq -" : [-75,[45, 28, null], "book"],
  "rnbqkbnr/pppp1p1p/8/8/3PPBp1/5N2/PPP3PP/RN1QKB1R b KQkq -" : [-105,[38, 45, null], "book"],
  "rnbqkbnr/pppp1p1p/8/6p1/4Pp1P/5N2/PPPP2P1/RNBQKB1R b KQkq -" : [-74,[30, 38, null], "book"],
  "rnbqkbnr/pppp1p1p/8/8/4PppP/5N2/PPPP2P1/RNBQKB1R w KQkq -" : [-67,[45, 28, null], "book"],
  "rnbqkbnr/pppp1p1p/8/4N3/4PppP/8/PPPP2P1/RNBQKB1R b KQkq -" : [-88,[6, 21, null], "book"],
  "rnbqk1nr/pppp1pbp/8/4N3/4PppP/8/PPPP2P1/RNBQKB1R w KQkq -" : [20,[51, 35, null], "book"],
  "rnbqkbnr/ppp2p1p/8/3pN3/4PppP/8/PPPP2P1/RNBQKB1R w KQkq -" : [20,[51, 35, null], "book"],
  "rnbqkbnr/ppp2p1p/3p4/4N3/4PppP/8/PPPP2P1/RNBQKB1R w KQkq -" : [-11,[28, 38, null], "book"],
  "rnbqkbnr/pppp1p2/8/4N2p/4PppP/8/PPPP2P1/RNBQKB1R w KQkq -" : [34,[61, 34, null], "book"],
  "rnbqkbnr/pppp1p2/7p/4N3/4PppP/8/PPPP2P1/RNBQKB1R w KQkq -" : [80,[51, 35, null], "book"],
  "rnbqkbnr/pppp1N2/7p/8/4PppP/8/PPPP2P1/RNBQKB1R b KQkq -" : [-128,[4, 13, null], "book"],
  "r1bqkbnr/pppp1p1p/2n5/4N3/4PppP/8/PPPP2P1/RNBQKB1R w KQkq -" : [-13,[51, 35, null], "book"],
  "rnbqkb1r/pppp1p1p/5n2/4N3/4PppP/8/PPPP2P1/RNBQKB1R w KQkq -" : [-79,[51, 35, null], "book"],
  "rnbqkb1r/pppp1p1p/5n2/4N3/2B1PppP/8/PPPP2P1/RNBQK2R b KQkq -" : [-91,[11, 27, null], "book"],
  "rnbqkb1r/ppp2p1p/5n2/3pN3/2B1PppP/8/PPPP2P1/RNBQK2R w KQkq -" : [-105,[36, 27, null], "book"],
  "rnbqkb1r/ppp2p1p/5n2/3PN3/2B2ppP/8/PPPP2P1/RNBQK2R b KQkq -" : [-102,[5, 19, null], "book"],
  "rnbqk2r/ppp2p1p/3b1n2/3PN3/2B2ppP/8/PPPP2P1/RNBQK2R w KQkq -" : [-88,[51, 35, null], "book"],
  "rnbqk2r/ppp2p1p/3b1n2/3PN3/2BP1ppP/8/PPP3P1/RNBQK2R b KQkq -" : [-96,[21, 31, null], "book"],
  "rnbqk2r/ppp2p1p/3b4/3PN2n/2BP1ppP/8/PPP3P1/RNBQK2R w KQkq -" : [-93,[57, 42, null], "book"],
  "rnbqk2r/ppp2p1p/3b4/3PN2n/2BP1BpP/8/PPP3P1/RN1QK2R b KQkq -" : [-162,[31, 37, null], "book"],
  "rnbqk2r/ppp2p1p/3b4/3PN3/2BP1npP/8/PPP3P1/RN1QK2R w KQkq -" : [-139,[60, 62, null], "book"],
  "rnbqk2r/ppp2p1p/3b1n2/3PN3/2B2ppP/8/PPPP2P1/RNBQ1RK1 b kq -" : [-150,[19, 28, null], "book"],
  "rnbqk2r/ppp2p1p/5n2/3Pb3/2B2ppP/8/PPPP2P1/RNBQ1RK1 w kq -" : [-142,[51, 35, null], "book"],
  "rnbqk2r/ppp2pbp/5n2/3PN3/2B2ppP/8/PPPP2P1/RNBQK2R w KQkq -" : [-69,[51, 35, null], "book"],
  "rnbqkb1r/pppp1p1p/5n2/4N3/3PPppP/8/PPP3P1/RNBQKB1R b KQkq -" : [-71,[11, 19, null], "book"],
  "rnbqkb1r/pppp1p1p/5n2/8/4PpNP/8/PPPP2P1/RNBQKB1R b KQkq -" : [-31,[21, 36, null], "book"],
  "rnbqkb1r/ppp2p1p/5n2/3p4/4PpNP/8/PPPP2P1/RNBQKB1R w KQkq -" : [0,[38, 21, null], "book"],
  "rnb1kbnr/ppppqp1p/8/4N3/4PppP/8/PPPP2P1/RNBQKB1R w KQkq -" : [-47,[51, 35, null], "book"],
  "rnbqkbnr/pppp1p1p/8/6N1/4PppP/8/PPPP2P1/RNBQKB1R b KQkq -" : [-119,[15, 23, null], "book"],
  "rnbqkbnr/pppp1p2/7p/6N1/4PppP/8/PPPP2P1/RNBQKB1R w KQkq -" : [-124,[30, 13, null], "book"],
  "rnbq1bnr/pppp1k2/7p/8/4PppP/8/PPPP2P1/RNBQKB1R w KQ -" : [-157,[51, 35, null], "book"],
  "rnbq1bnr/pppp1k2/7p/8/2B1PppP/8/PPPP2P1/RNBQK2R b KQ -" : [-140,[11, 27, null], "book"],
  "rnbq1bnr/ppp2k2/7p/3p4/2B1PppP/8/PPPP2P1/RNBQK2R w KQ -" : [-144,[34, 27, null], "book"],
  "rnbq1bnr/ppp2k2/7p/3B4/4PppP/8/PPPP2P1/RNBQK2R b KQ -" : [-141,[13, 4, null], "book"],
  "rnbqkbnr/ppp5/7p/3B4/4PppP/8/PPPP2P1/RNBQK2R w KQ -" : [-130,[51, 35, null], "book"],
  "rnbqkbnr/ppp5/7p/3B4/3PPppP/8/PPP3P1/RNBQK2R b KQ -" : [-130,[37, 45, null], "book"],
  "rnbq1bnr/pppp1k2/7p/8/3PPppP/8/PPP3P1/RNBQKB1R b KQ -" : [-127,[11, 27, null], "book"],
  "rnbq1bnr/pppp1k2/7p/8/4PpQP/8/PPPP2P1/RNB1KB1R b KQ -" : [-149,[6, 21, null], "book"],
  "rnbq1b1r/pppp1k2/5n1p/8/4PpQP/8/PPPP2P1/RNB1KB1R w KQ -" : [-182,[38, 37, null], "book"],
  "rnbq1b1r/pppp1k2/5n1p/8/4PQ1P/8/PPPP2P1/RNB1KB1R b KQ -" : [-178,[5, 19, null], "book"],
  "rnbqkbnr/pppp1p1p/8/6p1/4Pp2/2N2N2/PPPP2PP/R1BQKB1R b KQkq -" : [-76,[11, 19, null], "book"],
  "rnbqkbnr/pppp1pp1/7p/8/4Pp2/5N2/PPPP2PP/RNBQKB1R w KQkq -" : [-38,[57, 42, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/4Pp2/5N2/PPPP2PP/RNBQKB1R w KQkq -" : [0,[51, 35, null], "book"],
  "rnbqkb1r/ppppnppp/8/8/4Pp2/5N2/PPPP2PP/RNBQKB1R w KQkq -" : [0,[51, 35, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/8/4Pp2/5N2/PPPP2PP/RNBQKB1R w KQkq -" : [-40,[36, 28, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4P3/5p2/5N2/PPPP2PP/RNBQKB1R b KQkq -" : [-27,[21, 31, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4P2n/5p2/5N2/PPPP2PP/RNBQKB1R w KQkq -" : [-45,[61, 52, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4P2n/5pP1/5N2/PPPP3P/RNBQKB1R b KQkq g3" : [-111,[37, 46, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/4Pp2/7N/PPPP2PP/RNBQKB1R b KQkq -" : [-117,[11, 27, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPPQ1PP/RNB1KBNR b KQkq -" : [-100,[1, 18, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/4Pp2/5Q2/PPPP2PP/RNB1KBNR b KQkq -" : [-97,[1, 18, null], "book"],
  "rnbqkbnr/pppp1ppp/8/8/4PpQ1/8/PPPP2PP/RNB1KBNR b KQkq -" : [-134,[11, 27, null], "book"],
  "rnbqkbnr/pppp1ppp/8/7Q/4Pp2/8/PPPP2PP/RNB1KBNR b KQkq -" : [-157,[6, 21, null], "book"],
  "rnbqkbnr/pppp2pp/8/4pp2/4PP2/8/PPPP2PP/RNBQKBNR w KQkq -" : [80,[36, 29, null], "book"],
  "rnbqkbnr/pppp2pp/5p2/4p3/4PP2/8/PPPP2PP/RNBQKBNR w KQkq -" : [121,[61, 34, null], "book"],
  "rnbqkbnr/pppp2pp/5p2/4P3/4P3/8/PPPP2PP/RNBQKBNR b KQkq -" : [75,[1, 18, null], "book"],
  "r1bqkbnr/pppp2pp/2n2p2/4P3/4P3/8/PPPP2PP/RNBQKBNR w KQkq -" : [66,[61, 25, null], "book"],
  "rnbqkbnr/pppp1p1p/8/4p1p1/4PP2/8/PPPP2PP/RNBQKBNR w KQkq -" : [193,[37, 28, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/4PP2/8/PPPP2PP/RNBQKBNR w KQkq -" : [4,[62, 45, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/4PP2/5N2/PPPP2PP/RNBQKB1R b KQkq -" : [-5,[28, 37, null], "book"],
  "r1bqkbnr/pppp2pp/2n5/4pp2/4PP2/5N2/PPPP2PP/RNBQKB1R w KQkq -" : [36,[36, 29, null], "book"],
  "r1bqkbnr/pppp1p1p/2n5/4p1p1/4PP2/5N2/PPPP2PP/RNBQKB1R w KQkq -" : [132,[37, 30, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/4PP2/8/PPPP2PP/RNBQKBNR w KQkq -" : [30,[37, 28, null], "book"],
  "rnb1kbnr/pppp1ppp/5q2/4p3/4PP2/8/PPPP2PP/RNBQKBNR w KQkq -" : [73,[57, 42, null], "book"],
  "rnb1kbnr/pppp1ppp/5q2/4p3/4PP2/2N5/PPPP2PP/R1BQKBNR b KQkq -" : [75,[28, 37, null], "book"],
  "rnb1kbnr/pppp1ppp/8/4p3/4Pq2/2N5/PPPP2PP/R1BQKBNR w KQkq -" : [115,[62, 45, null], "book"],
  "rnb1kbnr/pppp1ppp/8/4p3/3PPq2/2N5/PPP3PP/R1BQKBNR b KQkq -" : [64,[37, 39, null], "book"],
  "rnb1kbnr/pppp1ppp/8/4p3/4PP1q/8/PPPP2PP/RNBQKBNR w KQkq -" : [61,[54, 46, null], "book"],
  "rnb1kbnr/pppp1ppp/8/4p3/4PP1q/6P1/PPPP3P/RNBQKBNR b KQkq -" : [52,[39, 12, null], "book"],
  "rnb1kbnr/ppppqppp/8/4p3/4PP2/6P1/PPPP3P/RNBQKBNR w KQkq -" : [63,[57, 42, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq -" : [17,[1, 18, null], "book"],
  "rnbqk1nr/pppp1ppp/8/4p3/1b2P3/2N5/PPPP1PPP/R1BQKBNR w KQkq -" : [44,[51, 35, null], "book"],
  "rnbqk1nr/pppp1ppp/8/4p3/1b2P1Q1/2N5/PPPP1PPP/R1B1KBNR b KQkq -" : [-6,[6, 21, null], "book"],
  "rnbqk2r/pppp1ppp/5n2/4p3/1b2P1Q1/2N5/PPPP1PPP/R1B1KBNR w KQkq -" : [8,[38, 14, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b1p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq -" : [36,[62, 45, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b1p3/N3P3/8/PPPP1PPP/R1BQKBNR b KQkq -" : [-49,[26, 53, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b1p3/4P1Q1/2N5/PPPP1PPP/R1B1KBNR b KQkq -" : [-44,[6, 21, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq -" : [47,[51, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/4p3/4PP2/2N5/PPPP2PP/R1BQKBNR b KQkq -" : [-4,[28, 37, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq -" : [15,[61, 34, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/2N5/PPPP1PPP/R1BQK1NR b KQkq -" : [13,[6, 21, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2N5/PPPP1PPP/R1BQK1NR w KQkq -" : [32,[59, 38, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P1Q1/2N5/PPPP1PPP/R1B1K1NR b KQkq -" : [40,[14, 22, null], "book"],
  "r1b1k1nr/pppp1ppp/2n2q2/2b1p3/2B1P1Q1/2N5/PPPP1PPP/R1B1K1NR w KQkq -" : [130,[42, 27, null], "book"],
  "r1b1k1nr/pppp1ppp/2n2q2/2bNp3/2B1P1Q1/8/PPPP1PPP/R1B1K1NR b KQkq -" : [99,[21, 53, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2N5/PPPP1PPP/R1BQK1NR w KQkq -" : [9,[51, 43, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1PP2/2N5/PPPP2PP/R1BQK1NR b KQkq -" : [-111,[21, 36, null], "book"],
  "r1bqkb1r/pppp1ppp/2n5/4p3/2B1nP2/2N5/PPPP2PP/R1BQK1NR w KQkq -" : [-105,[62, 45, null], "book"],
  "r1bqkb1r/pppp1ppp/2n5/4p3/2B1nP2/2N2N2/PPPP2PP/R1BQK2R b KQkq -" : [-109,[36, 42, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [-55,[18, 35, null], "book"],
  "r1bqkbnr/pppp2pp/2n5/4pp2/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [157,[36, 29, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/4PP2/2N5/PPPP2PP/R1BQKBNR b KQkq -" : [-69,[28, 37, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1p3/4PP2/2N5/PPPP2PP/R1BQKBNR w KQkq -" : [15,[62, 45, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1P3/4P3/2N5/PPPP2PP/R1BQKBNR b KQkq -" : [-10,[11, 19, null], "book"],
  "r1bqk1nr/ppp2ppp/2np4/2b1P3/4P3/2N5/PPPP2PP/R1BQKBNR w KQkq -" : [-5,[61, 25, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/4Pp2/2N5/PPPP2PP/R1BQKBNR w KQkq -" : [-60,[62, 45, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/3PPp2/2N5/PPP3PP/R1BQKBNR b KQkq -" : [-79,[3, 39, null], "book"],
  "r1b1kbnr/pppp1ppp/2n5/8/3PPp1q/2N5/PPP3PP/R1BQKBNR w KQkq -" : [-36,[60, 52, null], "book"],
  "r1b1kbnr/pppp1ppp/2n5/8/3PPp1q/2N5/PPP1K1PP/R1BQ1BNR b kq -" : [-98,[9, 17, null], "book"],
  "r1b1kbnr/p1pp1ppp/1pn5/8/3PPp1q/2N5/PPP1K1PP/R1BQ1BNR w kq -" : [-11,[59, 51, null], "book"],
  "r1b1kbnr/ppp2ppp/2n5/3p4/3PPp1q/2N5/PPP1K1PP/R1BQ1BNR w kq -" : [0,[36, 27, null], "book"],
  "r1b1kbnr/ppp2ppp/2np4/8/3PPp1q/2N5/PPP1K1PP/R1BQ1BNR w kq -" : [-22,[62, 45, null], "book"],
  "r1b1kbnr/pppp1p1p/2n5/6p1/3PPp1q/2N5/PPP1K1PP/R1BQ1BNR w kq -" : [-23,[62, 45, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/4Pp2/2N2N2/PPPP2PP/R1BQKB1R b KQkq -" : [-67,[14, 30, null], "book"],
  "r1bqk1nr/ppppbppp/2n5/8/4Pp2/2N2N2/PPPP2PP/R1BQKB1R w KQkq -" : [26,[61, 34, null], "book"],
  "r1bqkbnr/pppp1p1p/2n5/6p1/4Pp2/2N2N2/PPPP2PP/R1BQKB1R w KQkq -" : [-67,[54, 46, null], "book"],
  "r1bqkbnr/pppp1p1p/2n5/6p1/2B1Pp2/2N2N2/PPPP2PP/R1BQK2R b KQkq -" : [-86,[30, 38, null], "book"],
  "r1bqkbnr/pppp1p1p/2n5/8/2B1Ppp1/2N2N2/PPPP2PP/R1BQK2R w KQkq -" : [-97,[45, 62, null], "book"],
  "r1bqkbnr/pppp1p1p/2n5/8/2B1Ppp1/2N2N2/PPPP2PP/R1BQ1RK1 b kq -" : [-127,[38, 45, null], "book"],
  "r1bqkbnr/pppp1p1p/2n5/6p1/3PPp2/2N2N2/PPP3PP/R1BQKB1R b KQkq -" : [-104,[30, 38, null], "book"],
  "r1bqkbnr/pppp1p1p/2n5/6p1/4Pp1P/2N2N2/PPPP2P1/R1BQKB1R b KQkq -" : [-92,[30, 38, null], "book"],
  "r1bqkbnr/pppp1p1p/2n5/8/4PppP/2N2N2/PPPP2P1/R1BQKB1R w KQkq -" : [-74,[45, 62, null], "book"],
  "r1bqkbnr/pppp1p1p/2n5/6N1/4PppP/2N5/PPPP2P1/R1BQKB1R b KQkq -" : [-89,[15, 23, null], "book"],
  "r1bqkbnr/pppp1p2/2n4p/6N1/4PppP/2N5/PPPP2P1/R1BQKB1R w KQkq -" : [-100,[30, 13, null], "book"],
  "r1bqkbnr/pppp1N2/2n4p/8/4PppP/2N5/PPPP2P1/R1BQKB1R b KQkq -" : [-114,[4, 13, null], "book"],
  "r1bq1bnr/pppp1k2/2n4p/8/4PppP/2N5/PPPP2P1/R1BQKB1R w KQ -" : [-110,[51, 35, null], "book"],
  "r1bq1bnr/pppp1k2/2n4p/8/3PPppP/2N5/PPP3P1/R1BQKB1R b KQ -" : [-113,[37, 45, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/2N3P1/PPPP1P1P/R1BQKBNR b KQkq -" : [-13,[5, 26, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/2N3P1/PPPP1P1P/R1BQKBNR w KQkq -" : [0,[42, 32, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/2N3P1/PPPP1PBP/R1BQK1NR b KQkq -" : [-12,[11, 19, null], "book"],
  "r1bqk1nr/pppp1pp1/2n5/2b1p2p/4P3/2N3P1/PPPP1PBP/R1BQK1NR w KQkq -" : [34,[55, 47, null], "book"],
  "r1bqk1nr/pppp1pp1/2n5/2b1p2p/4P3/2N2NP1/PPPP1PBP/R1BQK2R b KQkq -" : [-14,[31, 39, null], "book"],
  "r1bqk1nr/pppp1pp1/2n5/2b1p3/4P2p/2N2NP1/PPPP1PBP/R1BQK2R w KQkq -" : [-1,[45, 39, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq -" : [15,[62, 45, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/P1N5/1PPP1PPP/R1BQKBNR b KQkq -" : [1,[1, 18, null], "book"],
  "rnbqk2r/pppp1ppp/5n2/4p3/1bB1P3/2N5/PPPP1PPP/R1BQK1NR w KQkq -" : [24,[42, 27, null], "book"],
  "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/2N5/PPPP1PPP/R1BQK1NR w KQkq -" : [0,[62, 45, null], "book"],
  "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/2N5/PPPPNPPP/R1BQK2R b KQkq -" : [-11,[4, 6, null], "book"],
  "rnbqk2r/p1pp1ppp/5n2/1pb1p3/2B1P3/2N5/PPPPNPPP/R1BQK2R w KQkq -" : [72,[34, 25, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4p3/2B1n3/2N2N2/PPPP1PPP/R1BQK2R b KQkq -" : [-64,[36, 42, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4p2Q/2B1n3/2N5/PPPP1PPP/R1B1K1NR b KQkq -" : [22,[36, 19, null], "book"],
  "rnbqkb1r/pppp1ppp/3n4/4p2Q/2B5/2N5/PPPP1PPP/R1B1K1NR w KQkq -" : [9,[31, 28, null], "book"],
  "rnbqkb1r/pppp1ppp/3n4/4p2Q/8/1BN5/PPPP1PPP/R1B1K1NR b KQkq -" : [-73,[1, 18, null], "book"],
  "rnbqk2r/ppppbppp/3n4/4p2Q/8/1BN5/PPPP1PPP/R1B1K1NR w KQkq -" : [-18,[31, 28, null], "book"],
  "rnbqk2r/ppppbppp/3n4/4p2Q/8/1BN2N2/PPPP1PPP/R1B1K2R b KQkq -" : [-17,[1, 18, null], "book"],
  "r1bqk2r/ppppbppp/2nn4/4p2Q/8/1BN2N2/PPPP1PPP/R1B1K2R w KQkq -" : [-28,[45, 28, null], "book"],
  "r1bqk2r/ppppbppp/2nn4/4N2Q/8/1BN5/PPPP1PPP/R1B1K2R b KQkq -" : [-11,[14, 22, null], "book"],
  "r1bqkb1r/pppp1ppp/2nn4/4p2Q/8/1BN5/PPPP1PPP/R1B1K1NR w KQkq -" : [249,[42, 25, null], "book"],
  "r1bqkb1r/pppp1ppp/2nn4/4p2Q/3P4/1BN5/PPP2PPP/R1B1K1NR b KQkq -" : [-78,[18, 35, null], "book"],
  "r1bqkb1r/pppp1ppp/2nn4/1N2p2Q/8/1B6/PPPP1PPP/R1B1K1NR b KQkq -" : [63,[14, 22, null], "book"],
  "r1bqkb1r/pppp1p1p/2nn2p1/1N2p2Q/8/1B6/PPPP1PPP/R1B1K1NR w KQkq -" : [73,[31, 45, null], "book"],
  "r1bqkb1r/pppp1p1p/2nn2p1/1N2p3/8/1B3Q2/PPPP1PPP/R1B1K1NR b KQkq -" : [138,[19, 29, null], "book"],
  "r1bqkb1r/pppp3p/2nn2p1/1N2pp2/8/1B3Q2/PPPP1PPP/R1B1K1NR w KQkq -" : [117,[45, 27, null], "book"],
  "r1bqkb1r/pppp3p/2nn2p1/1N1Qpp2/8/1B6/PPPP1PPP/R1B1K1NR b KQkq -" : [82,[3, 21, null], "book"],
  "r1b1kb1r/ppppq2p/2nn2p1/1N1Qpp2/8/1B6/PPPP1PPP/R1B1K1NR w KQkq -" : [63,[25, 10, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/4PP2/2N5/PPPP2PP/R1BQKBNR b KQkq -" : [-14,[11, 27, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3pp3/4PP2/2N5/PPPP2PP/R1BQKBNR w KQkq -" : [-10,[37, 28, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3pp3/4PP2/2NP4/PPP3PP/R1BQKBNR b KQkq -" : [-66,[28, 37, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3pP3/4P3/2N5/PPPP2PP/R1BQKBNR b KQkq -" : [-13,[21, 36, null], "book"],
  "rnbqkb1r/ppp2ppp/8/3pP3/4n3/2N5/PPPP2PP/R1BQKBNR w KQkq -" : [-25,[62, 45, null], "book"],
  "rnbqkb1r/ppp2ppp/8/3pP3/4n3/2NP4/PPP3PP/R1BQKBNR b KQkq -" : [-48,[36, 42, null], "book"],
  "rnb1kb1r/ppp2ppp/8/3pP3/4n2q/2NP4/PPP3PP/R1BQKBNR w KQkq -" : [15,[54, 46, null], "book"],
  "rnb1kb1r/ppp2ppp/8/3pP3/4n2q/2NP2P1/PPP4P/R1BQKBNR b KQkq -" : [28,[36, 42, null], "book"],
  "rnb1kb1r/ppp2ppp/8/3pP3/7q/2NP2n1/PPP4P/R1BQKBNR w KQkq -" : [67,[62, 45, null], "book"],
  "rnb1kb1r/ppp2ppp/8/3pP3/7q/2NP1Nn1/PPP4P/R1BQKB1R b KQkq -" : [5,[39, 31, null], "book"],
  "rnb1kb1r/ppp2ppp/8/3pP2q/8/2NP1Nn1/PPP4P/R1BQKB1R w KQkq -" : [64,[42, 27, null], "book"],
  "rnb1kb1r/ppp2ppp/8/3NP2q/8/3P1Nn1/PPP4P/R1BQKB1R b KQkq -" : [26,[2, 38, null], "book"],
  "rnbqkb1r/ppp2ppp/8/3pP3/4n3/2N2N2/PPPP2PP/R1BQKB1R b KQkq -" : [-27,[5, 12, null], "book"],
  "rnbqk2r/ppp1bppp/8/3pP3/4n3/2N2N2/PPPP2PP/R1BQKB1R w KQkq -" : [-14,[51, 43, null], "book"],
  "rn1qkb1r/ppp2ppp/8/3pP3/4n1b1/2N2N2/PPPP2PP/R1BQKB1R w KQkq -" : [24,[59, 52, null], "book"],
  "rn1qkb1r/ppp2ppp/8/3pP3/4n1b1/2N2N2/PPPPQ1PP/R1B1KB1R b KQkq -" : [21,[36, 42, null], "book"],
  "rnbqkb1r/ppp2ppp/8/3pP3/4n3/2N2Q2/PPPP2PP/R1B1KBNR b KQkq -" : [-32,[1, 18, null], "book"],
  "rnbqkb1r/ppp3pp/8/3pPp2/4n3/2N2Q2/PPPP2PP/R1B1KBNR w KQkq f6" : [-31,[51, 35, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/2N3P1/PPPP1P1P/R1BQKBNR b KQkq -" : [6,[11, 27, null], "book"],
  "rnbqk2r/pppp1ppp/5n2/2b1p3/4P3/2N3P1/PPPP1P1P/R1BQKBNR w KQkq -" : [9,[61, 54, null], "book"],
  "rnbqk2r/pppp1ppp/5n2/2b1p3/4P3/2N3P1/PPPP1PBP/R1BQK1NR b KQkq -" : [7,[4, 6, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b1p3/4P3/2N3P1/PPPP1PBP/R1BQK1NR w KQkq -" : [22,[62, 52, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b1p3/4P3/2N3P1/PPPPNPBP/R1BQK2R b KQkq -" : [12,[11, 19, null], "book"],
  "r1bqk2r/ppp2ppp/2n2n2/2bpp3/4P3/2N3P1/PPPPNPBP/R1BQK2R w KQkq -" : [72,[36, 27, null], "book"],
  "r1bqk2r/ppp2ppp/2n2n2/2bPp3/8/2N3P1/PPPPNPBP/R1BQK2R b KQkq -" : [59,[18, 33, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3pp3/4P3/2N3P1/PPPP1P1P/R1BQKBNR w KQkq -" : [10,[36, 27, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3Pp3/8/2N3P1/PPPP1P1P/R1BQKBNR b KQkq -" : [-4,[21, 27, null], "book"],
  "rnbqkb1r/pp3ppp/2p2n2/3Pp3/8/2N3P1/PPPP1P1P/R1BQKBNR w KQkq -" : [8,[51, 35, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPPNPPP/RNBQKB1R b KQkq -" : [-3,[5, 26, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -" : [37,[1, 18, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [139,[45, 28, null], "book"],
  "rnbqk1nr/pppp1ppp/8/2b1N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq -" : [146,[1, 18, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1N3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq -" : [158,[28, 18, null], "book"],
  "rnbqkbnr/pp1p1ppp/2p5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [105,[51, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [92,[36, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3Pp3/8/5N2/PPPP1PPP/RNBQKB1R b KQkq -" : [95,[3, 27, null], "book"],
  "rnbqk1nr/ppp2ppp/3b4/3Pp3/8/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [97,[51, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3P4/4p3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [96,[59, 52, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pN3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq -" : [82,[27, 36, null], "book"],
  "rnbqkbnr/ppp2ppp/8/4N3/4p3/8/PPPP1PPP/RNBQKB1R w KQkq -" : [98,[61, 34, null], "book"],
  "rnbqkbnr/ppp2ppp/8/4N3/2B1p3/8/PPPP1PPP/RNBQK2R b KQkq -" : [87,[6, 23, null], "book"],
  "rnb1kbnr/ppp2ppp/8/4N1q1/2B1p3/8/PPPP1PPP/RNBQK2R w KQkq -" : [115,[34, 13, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [45,[51, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [45,[6, 21, null], "book"],
  "rnbqkbnr/ppp3pp/3p4/4pp2/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [182,[51, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [62,[28, 35, null], "book"],
  "rn1qkbnr/pppb1ppp/3p4/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [112,[35, 28, null], "book"],
  "rn1qkbnr/ppp2ppp/3p4/4p3/3PP1b1/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [106,[58, 44, null], "book"],
  "rn1qkbnr/ppp2ppp/3p4/4P3/4P1b1/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [90,[1, 18, null], "book"],
  "r2qkbnr/pppn1ppp/3p4/4P3/4P1b1/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [98,[28, 19, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [48,[45, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/8/2BpP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [25,[6, 21, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/8/3pP3/2P2N2/PP3PPP/RNBQKB1R b KQkq -" : [-25,[35, 42, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq -" : [53,[5, 12, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3p4/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [130,[36, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3P4/3N4/8/PPP2PPP/RNBQKB1R b KQkq -" : [156,[6, 21, null], "book"],
  "rnbqkbnr/ppp2p1p/3p2p1/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [100,[57, 42, null], "book"],
  "rnbqkbnr/ppp2ppp/3p4/8/3QP3/5N2/PPP2PPP/RNB1KB1R b KQkq -" : [45,[6, 21, null], "book"],
  "rn1qkbnr/pppb1ppp/3p4/8/3QP3/5N2/PPP2PPP/RNB1KB1R w KQkq -" : [86,[58, 44, null], "book"],
  "rnbqkbnr/ppp3pp/3p4/4pp2/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [167,[61, 34, null], "book"],
  "rnbqkbnr/ppp3pp/3p4/4pp2/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq -" : [128,[29, 36, null], "book"],
  "r1bqkbnr/pppn1ppp/3p4/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [61,[61, 34, null], "book"],
  "r1bqkbnr/pppn1ppp/3p4/4p3/2BPP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [63,[28, 35, null], "book"],
  "r1bqkbnr/pp1n1ppp/2pp4/4p3/2BPP3/5N2/PPP2PPP/RNBQK2R w KQkq -" : [87,[35, 28, null], "book"],
  "r1bqkbnr/pp1n1ppp/2pp4/4p3/2BPP3/2P2N2/PP3PPP/RNBQK2R b KQkq -" : [33,[6, 21, null], "book"],
  "r1bqkbnr/pp1n1ppp/2pp4/4p3/2BPP3/2N2N2/PPP2PPP/R1BQK2R b KQkq -" : [91,[5, 12, null], "book"],
  "r1bqkbnr/pp1n1ppp/2pp4/4p3/2BPP3/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [88,[28, 35, null], "book"],
  "r1bqk1nr/pp1nbppp/2pp4/4p3/2BPP3/5N2/PPP2PPP/RNBQ1RK1 w kq -" : [104,[35, 28, null], "book"],
  "r1bqk1nr/pp1nbppp/2pp4/4P3/2B1P3/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [114,[19, 28, null], "book"],
  "r1bqkbnr/ppp2ppp/1n1p4/4p3/2BPP3/5N2/PPP2PPP/RNBQK2R w KQkq -" : [84,[34, 41, null], "book"],
  "r1bqkbnr/pppn1ppp/3p4/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq -" : [60,[15, 23, null], "book"],
  "rnbqkb1r/ppp2ppp/3p1n2/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [68,[35, 28, null], "book"],
  "rnbqkb1r/ppp2ppp/3p1n2/4p3/2BPP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [23,[28, 35, null], "book"],
  "rnbqkb1r/ppp2ppp/3p1n2/4P3/4P3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [85,[21, 36, null], "book"],
  "rnbqkb1r/ppp2ppp/3p4/4P3/4n3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [76,[59, 27, null], "book"],
  "rnbqkb1r/ppp2ppp/3p4/4P3/4n3/5N2/PPPN1PPP/R1BQKB1R b KQkq -" : [39,[36, 51, null], "book"],
  "rnbqkb1r/ppp2ppp/3p4/3QP3/4n3/5N2/PPP2PPP/RNB1KB1R b KQkq -" : [75,[36, 26, null], "book"],
  "rnbqkb1r/ppp2ppp/3p1n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq -" : [64,[1, 11, null], "book"],
  "r1bqkb1r/pppn1ppp/3p1n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq -" : [62,[61, 34, null], "book"],
  "rnbqkb1r/ppp2ppp/3p1n2/4p1N1/3PP3/8/PPP2PPP/RNBQKB1R b KQkq -" : [-13,[28, 35, null], "book"],
  "rnbqkb1r/ppp2pp1/3p1n1p/4p1N1/3PP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [57,[35, 28, null], "book"],
  "rnbqkb1r/ppp2Np1/3p1n1p/4p3/3PP3/8/PPP2PPP/RNBQKB1R b KQkq -" : [-104,[4, 13, null], "book"],
  "rnbqkbnr/pppp2pp/8/4pp2/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [142,[45, 28, null], "book"],
  "rnbqkbnr/pppp2pp/8/4pp2/1P2P3/5N2/P1PP1PPP/RNBQKB1R b KQkq -" : [-89,[29, 36, null], "book"],
  "rnbqkbnr/pppp2pp/8/4pp2/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [9,[29, 36, null], "book"],
  "rnbqkbnr/p1pp2pp/8/1p2pp2/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [190,[34, 41, null], "book"],
  "rnbqkbnr/pppp2pp/8/4p3/2B1p3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [18,[45, 28, null], "book"],
  "rnbqkbnr/pppp2pp/8/4N3/2B1p3/8/PPPP1PPP/RNBQK2R b KQkq -" : [27,[3, 30, null], "book"],
  "rnbqkbnr/ppp3pp/8/3pN3/2B1p3/8/PPPP1PPP/RNBQK2R w KQkq -" : [60,[59, 31, null], "book"],
  "rnb1kbnr/pppp2pp/8/4N1q1/2B1p3/8/PPPP1PPP/RNBQK2R w KQkq -" : [33,[51, 35, null], "book"],
  "rnb1kbnr/pppp2pp/8/4N1q1/2BPp3/8/PPP2PPP/RNBQK2R b KQkq d3" : [7,[30, 54, null], "book"],
  "rnb1kbnr/pppp2pp/8/4N3/2BPp3/8/PPP2PqP/RNBQK2R w KQkq -" : [22,[59, 31, null], "book"],
  "rnb1kbnr/pppp2pp/8/4N2Q/2BPp3/8/PPP2PqP/RNB1K2R b KQkq -" : [17,[14, 22, null], "book"],
  "rnb1kbnr/pppp3p/6p1/4N2Q/2BPp3/8/PPP2PqP/RNB1K2R w KQkq -" : [20,[34, 13, null], "book"],
  "rnb1kbnr/pppp1B1p/6p1/4N2Q/3Pp3/8/PPP2PqP/RNB1K2R b KQkq -" : [16,[4, 3, null], "book"],
  "rnbk1bnr/pppp1B1p/6p1/4N2Q/3Pp3/8/PPP2PqP/RNB1K2R w KQ -" : [11,[31, 30, null], "book"],
  "rnbk1bnr/pppp3p/6B1/4N2Q/3Pp3/8/PPP2PqP/RNB1K2R b KQ -" : [0,[54, 63, null], "book"],
  "rnbk1bnr/pppp3p/6B1/4N2Q/3Pp3/8/PPP2P1P/RNB1K2q w Q -" : [-40,[60, 52, null], "book"],
  "rnbqkb1r/pppp2pp/5n2/4pp2/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [162,[45, 28, null], "book"],
  "rnbqkbnr/pppp2pp/8/4pp2/2P1P3/5N2/PP1P1PPP/RNBQKB1R b KQkq -" : [-18,[1, 18, null], "book"],
  "rnbqkbnr/pppp2pp/8/4pp2/4P3/3P1N2/PPP2PPP/RNBQKB1R b KQkq -" : [13,[1, 18, null], "book"],
  "r1bqkbnr/pppp2pp/2n5/4pp2/4P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq -" : [14,[61, 52, null], "book"],
  "r1bqkbnr/pppp2pp/2n5/4pP2/8/3P1N2/PPP2PPP/RNBQKB1R b KQkq -" : [-59,[11, 27, null], "book"],
  "rnbqkbnr/pppp2pp/8/4pp2/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [48,[29, 36, null], "book"],
  "rnbqkbnr/pppp2pp/8/4pP2/8/5N2/PPPP1PPP/RNBQKB1R b KQkq -" : [99,[6, 21, null], "book"],
  "rnbqkbnr/pppp2pp/8/4pp2/4P1P1/5N2/PPPP1P1P/RNBQKB1R b KQkq -" : [-175,[29, 36, null], "book"],
  "rnbqkbnr/pppp2pp/8/4pp2/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq -" : [111,[6, 21, null], "book"],
  "rnbqkbnr/pppp2pp/8/4Np2/4P3/8/PPPP1PPP/RNBQKB1R b KQkq -" : [126,[3, 21, null], "book"],
  "r1bqkbnr/pppp2pp/2n5/4Np2/4P3/8/PPPP1PPP/RNBQKB1R w KQkq -" : [198,[59, 31, null], "book"],
  "rnbqkb1r/pppp2pp/5n2/4Np2/4P3/8/PPPP1PPP/RNBQKB1R w KQkq -" : [127,[61, 34, null], "book"],
  "rnbqkb1r/pppp2pp/5n2/4Np2/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq -" : [134,[3, 12, null], "book"],
  "rnbqkb1r/pppp2pp/5n2/4N3/2B1p3/8/PPPP1PPP/RNBQK2R w KQkq -" : [258,[28, 13, null], "book"],
  "rnbqkb1r/pppp1Npp/5n2/8/2B1p3/8/PPPP1PPP/RNBQK2R b KQkq -" : [266,[3, 12, null], "book"],
  "rnb1kb1r/ppppqNpp/5n2/8/2B1p3/8/PPPP1PPP/RNBQK2R w KQkq -" : [241,[13, 7, null], "book"],
  "rnb1kb1N/ppppq1pp/5n2/8/2B1p3/8/PPPP1PPP/RNBQK2R b KQq -" : [242,[11, 27, null], "book"],
  "rnb1kb1N/ppp1q1pp/5n2/3p4/2B1p3/8/PPPP1PPP/RNBQK2R w KQq -" : [255,[34, 25, null], "book"],
  "rnb1kbnr/ppppq1pp/8/4Np2/4P3/8/PPPP1PPP/RNBQKB1R w KQkq -" : [153,[59, 31, null], "book"],
  "rnb1kbnr/pppp2pp/5q2/4Np2/4P3/8/PPPP1PPP/RNBQKB1R w KQkq -" : [122,[28, 34, null], "book"],
  "rnb1kbnr/pppp2pp/5q2/4Np2/3PP3/8/PPP2PPP/RNBQKB1R b KQkq -" : [132,[11, 19, null], "book"],
  "rnb1kbnr/ppp3pp/3p1q2/4Np2/3PP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [118,[28, 34, null], "book"],
  "rnb1kbnr/ppp3pp/3p1q2/5p2/2NPP3/8/PPP2PPP/RNBQKB1R b KQkq -" : [128,[29, 36, null], "book"],
  "rnb1kbnr/ppp3pp/3p1q2/8/2NPp3/8/PPP2PPP/RNBQKB1R w KQkq -" : [120,[57, 42, null], "book"],
  "rnb1kbnr/ppp3pp/3p1q2/8/2NPp3/8/PPP1BPPP/RNBQK2R b KQkq -" : [111,[1, 18, null], "book"],
  "rnb1kbnr/ppp3pp/3p1q2/8/3Pp3/4N3/PPP2PPP/RNBQKB1R b KQkq -" : [90,[1, 18, null], "book"],
  "rnb1kbnr/ppp3pp/3p1q2/7Q/2NPp3/8/PPP2PPP/RNB1KB1R b KQkq -" : [-18,[14, 22, null], "book"],
  "rnb1kbnr/ppp4p/3p1qp1/7Q/2NPp3/8/PPP2PPP/RNB1KB1R w KQkq -" : [-1,[31, 59, null], "book"],
  "rnb1kbnr/ppp4p/3p1qp1/8/2NPp3/8/PPP1QPPP/RNB1KB1R b KQkq -" : [-58,[19, 27, null], "book"],
  "rnb1kbnr/pppp2pp/5q2/5p2/2N1P3/8/PPPP1PPP/RNBQKB1R b KQkq -" : [131,[29, 36, null], "book"],
  "rnb1kbnr/pppp2pp/5q2/8/2N1p3/8/PPPP1PPP/RNBQKB1R w KQkq -" : [143,[57, 42, null], "book"],
  "rnb1kbnr/pppp2pp/5q2/8/2N1p3/3P4/PPP2PPP/RNBQKB1R b KQkq -" : [61,[11, 27, null], "book"],
  "rnb1kbnr/pppp2pp/5q2/8/2N1p3/2N5/PPPP1PPP/R1BQKB1R b KQkq -" : [125,[21, 13, null], "book"],
  "rnbqkbnr/pppp2pp/5p2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [139,[61, 34, null], "book"],
  "rnbqkbnr/pppp2pp/5p2/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq -" : [161,[3, 12, null], "book"],
  "rnbqkbnr/pppp2pp/8/4p3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq -" : [288,[59, 31, null], "book"],
  "rnbqkbnr/pppp2pp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KB1R b KQkq -" : [319,[4, 12, null], "book"],
  "rnbqkbnr/pppp3p/6p1/4p2Q/4P3/8/PPPP1PPP/RNB1KB1R w KQkq -" : [354,[31, 28, null], "book"],
  "rnbqkbnr/pppp3p/6p1/4Q3/4P3/8/PPPP1PPP/RNB1KB1R b KQkq -" : [269,[3, 12, null], "book"],
  "rnb1kbnr/ppppq2p/6p1/4Q3/4P3/8/PPPP1PPP/RNB1KB1R w KQkq -" : [371,[28, 7, null], "book"],
  "rnb1kbnQ/ppppq2p/6p1/8/4P3/8/PPPP1PPP/RNB1KB1R b KQq -" : [351,[6, 21, null], "book"],
  "rnb1kbnr/ppppq1pp/5p2/4N3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq -" : [125,[28, 45, null], "book"],
  "rnb1kbnr/ppppq1pp/5p2/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -" : [153,[11, 27, null], "book"],
  "rnb1kbnr/ppp1q1pp/5p2/3p4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [157,[51, 43, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [40,[61, 25, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/1P2P3/5N2/P1PP1PPP/RNBQKB1R b KQkq -" : [-130,[5, 33, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [49,[8, 16, null], "book"],
  "r1bqkbnr/1ppp1ppp/2n5/pB2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [63,[60, 62, null], "book"],
  "r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [43,[25, 32, null], "book"],
  "r1bqkbnr/1ppp1ppp/p1n5/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [41,[6, 21, null], "book"],
  "r1bqkbnr/2pp1ppp/p1n5/1p2p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [47,[32, 41, null], "book"],
  "r1bqkbnr/2pp1ppp/p1n5/1p2p3/4P3/1B3N2/PPPP1PPP/RNBQK2R b KQkq -" : [51,[2, 9, null], "book"],
  "r1bqk1nr/2pp1ppp/p1n5/1pb1p3/4P3/1B3N2/PPPP1PPP/RNBQK2R w KQkq -" : [70,[50, 42, null], "book"],
  "r1bqkbnr/2pp1ppp/p7/np2p3/4P3/1B3N2/PPPP1PPP/RNBQK2R w KQkq -" : [44,[60, 62, null], "book"],
  "r1bqkbnr/2pp1Bpp/p7/np2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [-38,[4, 13, null], "book"],
  "r1bqk1nr/1ppp1ppp/p1n5/4p3/Bb2P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [96,[50, 42, null], "book"],
  "r1bqk1nr/1ppp1ppp/p1n5/2b1p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [71,[50, 42, null], "book"],
  "r1bqkbnr/1pp2ppp/p1np4/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [57,[50, 42, null], "book"],
  "r1bqkbnr/1pp2ppp/p1Bp4/4p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [23,[9, 18, null], "book"],
  "r1bqkbnr/2p2ppp/p1pp4/4p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [31,[51, 35, null], "book"],
  "r1bqkbnr/2p2ppp/p1pp4/4p3/3PP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [24,[28, 35, null], "book"],
  "r1bqkbnr/2p3pp/p1pp1p2/4p3/3PP3/5N2/PPP2PPP/RNBQK2R w KQkq -" : [39,[57, 42, null], "book"],
  "r1bqkbnr/1pp2ppp/p1np4/4p3/B3P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq -" : [57,[2, 11, null], "book"],
  "r2qkbnr/1ppb1ppp/p1np4/4p3/B3P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq -" : [49,[51, 35, null], "book"],
  "r2qkbnr/1ppb1ppp/p1np4/4p3/B2PP3/2P2N2/PP3PPP/RNBQK2R b KQkq -" : [59,[14, 22, null], "book"],
  "r2qkbnr/1ppb1p1p/p1np2p1/4p3/B2PP3/2P2N2/PP3PPP/RNBQK2R w KQkq -" : [59,[60, 62, null], "book"],
  "r1bqkbnr/1pp3pp/p1np4/4pp2/B3P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq -" : [79,[36, 29, null], "book"],
  "r1bqkbnr/1pp3pp/p1np4/4pP2/B7/2P2N2/PP1P1PPP/RNBQK2R b KQkq -" : [90,[2, 29, null], "book"],
  "r2qkbnr/1pp3pp/p1np4/4pb2/B7/2P2N2/PP1P1PPP/RNBQK2R w KQkq -" : [88,[60, 62, null], "book"],
  "r2qkbnr/1pp3pp/p1np4/4pb2/B7/2P2N2/PP1P1PPP/RNBQ1RK1 b kq -" : [82,[29, 43, null], "book"],
  "r1bqkbnr/1pp2ppp/p1np4/4p3/B1P1P3/5N2/PP1P1PPP/RNBQK2R b KQkq -" : [29,[2, 38, null], "book"],
  "r1bqkbnr/1pp2ppp/p1np4/4p3/B2PP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [13,[9, 25, null], "book"],
  "r1bqkbnr/2p2ppp/p1np4/1p2p3/B2PP3/5N2/PPP2PPP/RNBQK2R w KQkq -" : [23,[32, 41, null], "book"],
  "r1bqkbnr/2p2ppp/p1np4/1p2p3/3PP3/1B3N2/PPP2PPP/RNBQK2R b KQkq -" : [22,[18, 35, null], "book"],
  "r1bqkbnr/2p2ppp/p1np4/1p6/3pP3/1B3N2/PPP2PPP/RNBQK2R w KQkq -" : [75,[41, 27, null], "book"],
  "r1bqkbnr/2p2ppp/p1np4/1p6/3NP3/1B6/PPP2PPP/RNBQK2R b KQkq -" : [-231,[18, 35, null], "book"],
  "r1bqkbnr/2p2ppp/p2p4/1p6/3nP3/1B6/PPP2PPP/RNBQK2R w KQkq -" : [-231,[59, 35, null], "book"],
  "r1bqkbnr/2p2ppp/p2p4/1p6/3QP3/1B6/PPP2PPP/RNB1K2R b KQkq -" : [-234,[10, 26, null], "book"],
  "r1bqkbnr/5ppp/p2p4/1pp5/3QP3/1B6/PPP2PPP/RNB1K2R w KQkq -" : [-241,[35, 42, null], "book"],
  "r1bqkbnr/5ppp/p2p4/1ppQ4/4P3/1B6/PPP2PPP/RNB1K2R b KQkq -" : [-281,[2, 20, null], "book"],
  "r2qkbnr/5ppp/p2pb3/1ppQ4/4P3/1B6/PPP2PPP/RNB1K2R w KQkq -" : [-279,[27, 18, null], "book"],
  "r2qkbnr/5ppp/p1Qpb3/1pp5/4P3/1B6/PPP2PPP/RNB1K2R b KQkq -" : [-274,[20, 11, null], "book"],
  "r2qkbnr/3b1ppp/p1Qp4/1pp5/4P3/1B6/PPP2PPP/RNB1K2R w KQkq -" : [-281,[18, 27, null], "book"],
  "r1bqkbnr/1pp2ppp/p1np4/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 b kq -" : [50,[6, 21, null], "book"],
  "r1bqkbnr/1ppp2pp/p1n5/4pp2/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [83,[51, 35, null], "book"],
  "r1bqkbnr/1ppp2pp/p1n5/4pP2/B7/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [-44,[28, 36, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [52,[60, 62, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1B2n2/4p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [-14,[11, 18, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq -" : [-33,[21, 36, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/3P1N2/PPP2PPP/RNBQK2R b KQkq -" : [4,[5, 26, null], "book"],
  "r1bqkb1r/1pp2ppp/p1np1n2/4p3/B3P3/3P1N2/PPP2PPP/RNBQK2R w KQkq -" : [39,[50, 42, null], "book"],
  "r1bqkb1r/1pp2ppp/p1np1n2/4p3/B1P1P3/3P1N2/PP3PPP/RNBQK2R b KQkq -" : [9,[14, 22, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B2PP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [2,[28, 35, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1n2n2/8/B2pP3/5N2/PPP2PPP/RNBQK2R w KQkq -" : [6,[60, 62, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq -" : [19,[5, 26, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 b kq -" : [55,[5, 12, null], "book"],
  "r1bqkb1r/2pp1ppp/p1n2n2/1p2p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [48,[32, 41, null], "book"],
  "r1bqkb1r/2pp1ppp/p1n2n2/1p2p3/4P3/1B3N2/PPPP1PPP/RNBQ1RK1 b kq -" : [53,[2, 9, null], "book"],
  "r2qkb1r/1bpp1ppp/p1n2n2/1p2p3/4P3/1B3N2/PPPP1PPP/RNBQ1RK1 w kq -" : [55,[61, 60, null], "book"],
  "r2qkb1r/1bpp1ppp/p1n2n2/1p2p1N1/4P3/1B6/PPPP1PPP/RNBQ1RK1 b kq -" : [-32,[11, 27, null], "book"],
  "r2qkb1r/1bp2ppp/p1n2n2/1p1pp1N1/4P3/1B6/PPPP1PPP/RNBQ1RK1 w kq -" : [-37,[36, 27, null], "book"],
  "r1bqk2r/2ppbppp/p1n2n2/1p2p3/4P3/1B3N2/PPPP1PPP/RNBQ1RK1 w kq -" : [50,[51, 35, null], "book"],
  "r1bqk2r/2ppbppp/p1n2n2/1p2p3/P3P3/1B3N2/1PPP1PPP/RNBQ1RK1 b kq -" : [50,[2, 9, null], "book"],
  "r1bqkb1r/2p2ppp/p1np1n2/1p2p3/4P3/1B3N2/PPPP1PPP/RNBQ1RK1 w kq -" : [58,[50, 42, null], "book"],
  "r1bqk2r/1ppp1ppp/p1n2n2/2b1p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [50,[50, 42, null], "book"],
  "r1bqk2r/1pppbppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [49,[61, 60, null], "book"],
  "r1bqk2r/1pppbppp/p1B2n2/4p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq -" : [5,[11, 18, null], "book"],
  "r1bqk2r/1pppbppp/p1n2n2/4p3/B2PP3/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [4,[28, 35, null], "book"],
  "r1bqk2r/1pppbppp/p1n2n2/8/B2pP3/5N2/PPP2PPP/RNBQ1RK1 w kq -" : [10,[36, 28, null], "book"],
  "r1bqk2r/1pppbppp/p1n2n2/4P3/B2p4/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [6,[21, 36, null], "book"],
  "r1bqk2r/1pppbppp/p1n5/4P3/B2pn3/5N2/PPP2PPP/RNBQ1RK1 w kq -" : [11,[45, 35, null], "book"],
  "r1bqk2r/1pppbppp/p1n5/4P3/B2pn3/2P2N2/PP3PPP/RNBQ1RK1 b kq -" : [-51,[35, 42, null], "book"],
  "r1bqk2r/1pppbppp/p1n2n2/4p3/B3P3/2N2N2/PPPP1PPP/R1BQ1RK1 b kq -" : [13,[9, 25, null], "book"],
  "r1bqk2r/1pppbppp/p1n2n2/4p3/B3P3/5N2/PPPPQPPP/RNB2RK1 b kq -" : [8,[9, 25, null], "book"],
  "r1bqk2r/2ppbppp/p1n2n2/1p2p3/B3P3/5N2/PPPPQPPP/RNB2RK1 w kq -" : [12,[32, 41, null], "book"],
  "r1bqk2r/2ppbppp/p1n2n2/1p2p3/4P3/1B3N2/PPPPQPPP/RNB2RK1 b kq -" : [21,[4, 6, null], "book"],
  "r1bq1rk1/2ppbppp/p1n2n2/1p2p3/4P3/1B3N2/PPPPQPPP/RNB2RK1 w - -" : [24,[50, 42, null], "book"],
  "r1bq1rk1/2ppbppp/p1n2n2/1p2p3/4P3/1BP2N2/PP1PQPPP/RNB2RK1 b - -" : [6,[11, 27, null], "book"],
  "r1bq1rk1/2p1bppp/p1n2n2/1p1pp3/4P3/1BP2N2/PP1PQPPP/RNB2RK1 w - -" : [21,[36, 27, null], "book"],
  "r1bq1rk1/2p1bppp/p1np1n2/1p2p3/4P3/1BP2N2/PP1PQPPP/RNB2RK1 w - -" : [27,[61, 59, null], "book"],
  "r1bq1rk1/2p1bppp/p1np1n2/1p2p3/3PP3/1BP2N2/PP2QPPP/RNB2RK1 b - -" : [25,[2, 38, null], "book"],
  "r2q1rk1/2p1bppp/p1np1n2/1p2p3/3PP1b1/1BP2N2/PP2QPPP/RNB2RK1 w - -" : [19,[61, 59, null], "book"],
  "r1bqk2r/1pppbppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQR1K1 b kq -" : [55,[9, 25, null], "book"],
  "r1bqk2r/2ppbppp/p1n2n2/1p2p3/B3P3/5N2/PPPP1PPP/RNBQR1K1 w kq -" : [40,[32, 41, null], "book"],
  "r1bqk2r/2ppbppp/p1n2n2/1p2p3/4P3/1B3N2/PPPP1PPP/RNBQR1K1 b kq -" : [37,[4, 6, null], "book"],
  "r2qk2r/1bppbppp/p1n2n2/1p2p3/4P3/1B3N2/PPPP1PPP/RNBQR1K1 w kq -" : [67,[51, 35, null], "book"],
  "r2qk2r/1bppbppp/p1n2n2/1p2p3/4P3/1BP2N2/PP1P1PPP/RNBQR1K1 b kq -" : [59,[11, 19, null], "book"],
  "r2qk2r/1bp1bppp/p1n2n2/1p1pp3/4P3/1BP2N2/PP1P1PPP/RNBQR1K1 w kq -" : [85,[36, 27, null], "book"],
  "r2qk2r/1bp1bppp/p1n2n2/1p1Pp3/8/1BP2N2/PP1P1PPP/RNBQR1K1 b kq -" : [47,[21, 27, null], "book"],
  "r2qk2r/1bp1bppp/p1n5/1p1np3/8/1BP2N2/PP1P1PPP/RNBQR1K1 w kq -" : [50,[45, 28, null], "book"],
  "r2qk2r/1bp1bppp/p1n5/1p1nN3/8/1BP5/PP1P1PPP/RNBQR1K1 b kq -" : [60,[18, 28, null], "book"],
  "r2qk2r/1bp1bppp/p7/1p1nn3/8/1BP5/PP1P1PPP/RNBQR1K1 w kq -" : [56,[60, 28, null], "book"],
  "r1bqk2r/2p1bppp/p1np1n2/1p2p3/4P3/1B3N2/PPPP1PPP/RNBQR1K1 w kq -" : [60,[50, 42, null], "book"],
  "r1bqk2r/2p1bppp/p1np1n2/1p2p3/4P3/1BP2N2/PP1P1PPP/RNBQR1K1 b kq -" : [54,[4, 6, null], "book"],
  "r1bqk2r/2p1bppp/p2p1n2/np2p3/4P3/1BP2N2/PP1P1PPP/RNBQR1K1 w kq -" : [76,[41, 50, null], "book"],
  "r1bqk2r/2p1bppp/p2p1n2/np2p3/4P3/2P2N2/PPBP1PPP/RNBQR1K1 b kq -" : [57,[10, 26, null], "book"],
  "r1bqk2r/4bppp/p2p1n2/npp1p3/4P3/2P2N2/PPBP1PPP/RNBQR1K1 w kq -" : [61,[55, 47, null], "book"],
  "r1bqk2r/4bppp/p2p1n2/npp1p3/3PP3/2P2N2/PPB2PPP/RNBQR1K1 b kq -" : [65,[26, 35, null], "book"],
  "r1b1k2r/2q1bppp/p2p1n2/npp1p3/3PP3/2P2N2/PPB2PPP/RNBQR1K1 w kq -" : [77,[35, 27, null], "book"],
  "r1bq1rk1/2p1bppp/p1np1n2/1p2p3/4P3/1BP2N2/PP1P1PPP/RNBQR1K1 w - -" : [62,[48, 32, null], "book"],
  "r1bq1rk1/2p1bppp/p1np1n2/1p2p3/4P3/PBP2N2/1P1P1PPP/RNBQR1K1 b - -" : [17,[18, 24, null], "book"],
  "r1bq1rk1/2p1bppp/p1np1n2/1p2p3/4P3/2P2N2/PPBP1PPP/RNBQR1K1 b - -" : [20,[5, 4, null], "book"],
  "r1bq1rk1/2p1bppp/p1np1n2/1p2p3/4P3/1BPP1N2/PP3PPP/RNBQR1K1 b - -" : [18,[18, 24, null], "book"],
  "r1bq1rk1/2p1bppp/p1np1n2/1p2p3/3PP3/1BP2N2/PP3PPP/RNBQR1K1 b - -" : [34,[2, 38, null], "book"],
  "r2q1rk1/2p1bppp/p1np1n2/1p2p3/3PP1b1/1BP2N2/PP3PPP/RNBQR1K1 w - -" : [29,[58, 44, null], "book"],
  "r1bq1rk1/2p1bppp/p1np1n2/1p2p3/4P3/1BP2N1P/PP1P1PP1/RNBQR1K1 b - -" : [48,[2, 20, null], "book"],
  "r1bq1rk1/2p1bppp/2np1n2/pp2p3/4P3/1BP2N1P/PP1P1PP1/RNBQR1K1 w - -" : [71,[51, 35, null], "book"],
  "r2q1rk1/1bp1bppp/p1np1n2/1p2p3/4P3/1BP2N1P/PP1P1PP1/RNBQR1K1 w - -" : [71,[51, 35, null], "book"],
  "r2q1rk1/2p1bppp/p1npbn2/1p2p3/4P3/1BP2N1P/PP1P1PP1/RNBQR1K1 w - -" : [52,[41, 20, null], "book"],
  "r1bq1rk1/2p1bpp1/p1np1n1p/1p2p3/4P3/1BP2N1P/PP1P1PP1/RNBQR1K1 w - -" : [75,[51, 35, null], "book"],
  "r1bq1rk1/2p1bppp/p2p1n2/np2p3/4P3/1BP2N1P/PP1P1PP1/RNBQR1K1 w - -" : [67,[41, 50, null], "book"],
  "r1bq1rk1/2p1bppp/p2p1n2/np2p3/4P3/2P2N1P/PPBP1PP1/RNBQR1K1 b - -" : [71,[10, 26, null], "book"],
  "r1bq1rk1/4bppp/p2p1n2/npp1p3/4P3/2P2N1P/PPBP1PP1/RNBQR1K1 w - -" : [57,[51, 35, null], "book"],
  "r1bq1rk1/4bppp/p2p1n2/npp1p3/3PP3/2P2N1P/PPB2PP1/RNBQR1K1 b - -" : [64,[28, 35, null], "book"],
  "r1bq1rk1/4bppp/p1np1n2/1pp1p3/3PP3/2P2N1P/PPB2PP1/RNBQR1K1 w - -" : [90,[35, 27, null], "book"],
  "r1bq1rk1/3nbppp/p2p4/npp1p3/3PP3/2P2N1P/PPB2PP1/RNBQR1K1 w - -" : [62,[57, 51, null], "book"],
  "r1b2rk1/2q1bppp/p2p1n2/npp1p3/3PP3/2P2N1P/PPB2PP1/RNBQR1K1 w - -" : [72,[35, 27, null], "book"],
  "r1b2rk1/2q1bppp/p2p1n2/nppPp3/4P3/2P2N1P/PPB2PP1/RNBQR1K1 b - -" : [68,[24, 34, null], "book"],
  "r1b2rk1/2q1bppp/p2p1n2/npp1p3/3PP3/2P2N1P/PPBN1PP1/R1BQR1K1 b - -" : [44,[2, 11, null], "book"],
  "r1b2rk1/2q1bppp/p2p1n2/np2p3/3pP3/2P2N1P/PPBN1PP1/R1BQR1K1 w - -" : [51,[42, 35, null], "book"],
  "r1b2rk1/2q1bppp/p1np1n2/1pp1p3/3PP3/2P2N1P/PPBN1PP1/R1BQR1K1 w - -" : [77,[35, 27, null], "book"],
  "r1b2rk1/2q1bppp/p1np1n2/1pp1P3/4P3/2P2N1P/PPBN1PP1/R1BQR1K1 b - -" : [-3,[19, 28, null], "book"],
  "r1b2rk1/2q1bppp/p1n2n2/1pp1p3/4P3/2P2N1P/PPBN1PP1/R1BQR1K1 w - -" : [10,[51, 61, null], "book"],
  "r1b2rk1/2q1bppp/p1n2n2/1pp1p3/P3P3/2P2N1P/1PBN1PP1/R1BQR1K1 b - -" : [-23,[2, 20, null], "book"],
  "rnbq1rk1/2p1bppp/p2p1n2/1p2p3/4P3/1BP2N1P/PP1P1PP1/RNBQR1K1 w - -" : [46,[51, 35, null], "book"],
  "rnbq1rk1/2p1bppp/p2p1n2/1p2p3/3PP3/1BP2N1P/PP3PP1/RNBQR1K1 b - -" : [48,[1, 11, null], "book"],
  "r1bq1rk1/2pnbppp/p2p1n2/1p2p3/3PP3/1BP2N1P/PP3PP1/RNBQR1K1 w - -" : [64,[42, 34, null], "book"],
  "r1bq1rk1/2pnbppp/p2p1n2/1p2p3/2PPP3/1B3N1P/PP3PP1/RNBQR1K1 b - -" : [40,[10, 18, null], "book"],
  "r1bq1rk1/2pnbppp/p2p1n2/1p2p3/3PP3/1BP2N1P/PP1N1PP1/R1BQR1K1 b - -" : [38,[2, 9, null], "book"],
  "r2q1rk1/1bpnbppp/p2p1n2/1p2p3/3PP3/1BP2N1P/PP1N1PP1/R1BQR1K1 w - -" : [47,[41, 50, null], "book"],
  "r2q1rk1/1bpnbppp/p2p1n2/1p2p3/3PP3/2P2N1P/PPBN1PP1/R1BQR1K1 b - -" : [38,[5, 4, null], "book"],
  "r2qr1k1/1bpnbppp/p2p1n2/1p2p3/3PP3/2P2N1P/PPBN1PP1/R1BQR1K1 w - -" : [45,[51, 61, null], "book"],
  "r2qr1k1/1bpnbppp/p2p1n2/1p2p3/3PP3/2P2N1P/PPB2PP1/R1BQRNK1 b - -" : [37,[12, 5, null], "book"],
  "r2qrbk1/1bpn1ppp/p2p1n2/1p2p3/3PP3/2P2N1P/PPB2PP1/R1BQRNK1 w - -" : [50,[61, 46, null], "book"],
  "r2qrbk1/1bpn1ppp/p2p1n2/1p2p1B1/3PP3/2P2N1P/PPB2PP1/R2QRNK1 b - -" : [34,[15, 23, null], "book"],
  "r1bq1rk1/2pnbppp/p2p1n2/1p2p3/3PP2N/1BP4P/PP3PP1/RNBQR1K1 b - -" : [25,[21, 36, null], "book"],
  "r1bq1rk1/2pnbppp/p1np4/1p2p3/4P3/1BP2N1P/PP1P1PP1/RNBQR1K1 w - -" : [71,[51, 35, null], "book"],
  "r1bqr1k1/2p1bppp/p1np1n2/1p2p3/4P3/1BP2N1P/PP1P1PP1/RNBQR1K1 w - -" : [53,[51, 35, null], "book"],
  "r1bqk2r/2p1bppp/p1np1n2/1p2p3/3PP3/1B3N2/PPP2PPP/RNBQR1K1 b kq -" : [-51,[18, 35, null], "book"],
  "r1bq1rk1/2ppbppp/p1n2n2/1p2p3/4P3/1B3N2/PPPP1PPP/RNBQR1K1 w - -" : [39,[50, 42, null], "book"],
  "r1bq1rk1/2ppbppp/p1n2n2/1p2p3/P3P3/1B3N2/1PPP1PPP/RNBQR1K1 b - -" : [38,[2, 9, null], "book"],
  "r1bq1rk1/2ppbppp/p1n2n2/1p2p3/4P3/1BP2N2/PP1P1PPP/RNBQR1K1 b - -" : [50,[18, 24, null], "book"],
  "r1bq1rk1/2p1bppp/p1n2n2/1p1pp3/4P3/1BP2N2/PP1P1PPP/RNBQR1K1 w - -" : [42,[36, 27, null], "book"],
  "r1bq1rk1/2p1bppp/p1n2n2/1p1pp3/3PP3/1BP2N2/PP3PPP/RNBQR1K1 b - -" : [18,[27, 36, null], "book"],
  "r1bq1rk1/2p1bppp/p1n2n2/1p1Pp3/8/1BP2N2/PP1P1PPP/RNBQR1K1 b - -" : [39,[21, 27, null], "book"],
  "r1bq1rk1/2p1bppp/p1n2n2/1p1P4/4p3/1BP2N2/PP1P1PPP/RNBQR1K1 w - -" : [94,[27, 18, null], "book"],
  "r1bq1rk1/2p1bppp/p1n5/1p1np3/8/1BP2N2/PP1P1PPP/RNBQR1K1 w - -" : [71,[45, 28, null], "book"],
  "r1bq1rk1/2p1bppp/p1n5/1p1nN3/8/1BP5/PP1P1PPP/RNBQR1K1 b - -" : [47,[18, 28, null], "book"],
  "r1bq1rk1/2p1bppp/p7/1p1nn3/8/1BP5/PP1P1PPP/RNBQR1K1 w - -" : [70,[60, 28, null], "book"],
  "r1bq1rk1/2p1bppp/p7/1p1nR3/8/1BP5/PP1P1PPP/RNBQ2K1 b - -" : [44,[10, 18, null], "book"],
  "r1bq1rk1/4bppp/p1p5/1p1nR3/8/1BP5/PP1P1PPP/RNBQ2K1 w - -" : [47,[28, 60, null], "book"],
  "r1bq1rk1/4bppp/p1p5/1p1BR3/8/2P5/PP1P1PPP/RNBQ2K1 b - -" : [0,[18, 27, null], "book"],
  "r1bq1rk1/4bppp/p7/1p1pR3/8/2P5/PP1P1PPP/RNBQ2K1 w - -" : [0,[51, 35, null], "book"],
  "r1bq1rk1/4bppp/p7/1p1pR3/3P4/2P5/PP3PPP/RNBQ2K1 b - -" : [16,[12, 19, null], "book"],
  "r1bq1rk1/5ppp/p2b4/1p1pR3/3P4/2P5/PP3PPP/RNBQ2K1 w - -" : [15,[28, 44, null], "book"],
  "r1bq1rk1/5ppp/p2b4/1p1p4/3P4/2P1R3/PP3PPP/RNBQ2K1 b - -" : [-10,[3, 39, null], "book"],
  "r1bq1rk1/4bppp/p1p5/1p1nR3/3P4/1BP5/PP3PPP/RNBQ2K1 b - -" : [12,[12, 19, null], "book"],
  "r1bq1rk1/5ppp/p1pb4/1p1nR3/3P4/1BP5/PP3PPP/RNBQ2K1 w - -" : [25,[28, 60, null], "book"],
  "r1bq1rk1/5ppp/p1pb4/1p1n4/3P4/1BP5/PP3PPP/RNBQR1K1 b - -" : [16,[3, 39, null], "book"],
  "r1b2rk1/5ppp/p1pb4/1p1n4/3P3q/1BP5/PP3PPP/RNBQR1K1 w - -" : [30,[54, 46, null], "book"],
  "r1b2rk1/5ppp/p1pb4/1p1n4/3P3q/1BP3P1/PP3P1P/RNBQR1K1 b - -" : [27,[39, 47, null], "book"],
  "r1b2rk1/5ppp/p1pb4/1p1n4/3P4/1BP3Pq/PP3P1P/RNBQR1K1 w - -" : [24,[60, 36, null], "book"],
  "r1bq1rk1/4bppp/p1p5/1p1nR3/8/1BP3P1/PP1P1P1P/RNBQ2K1 b - -" : [16,[12, 21, null], "book"],
  "r1bq1rk1/2ppbppp/p4n2/np2p3/4P3/1BP2N2/PP1P1PPP/RNBQR1K1 w - -" : [62,[41, 50, null], "book"],
  "r1bq1rk1/2ppbppp/p4n2/np2p3/4P3/2P2N2/PPBP1PPP/RNBQR1K1 b - -" : [46,[11, 27, null], "book"],
  "r1bq1rk1/3pbppp/p4n2/npp1p3/4P3/2P2N2/PPBP1PPP/RNBQR1K1 w - -" : [115,[45, 28, null], "book"],
  "r1bq1rk1/3pbppp/p4n2/npp1p3/3PP3/2P2N2/PPB2PPP/RNBQR1K1 b - -" : [49,[26, 35, null], "book"],
  "r1b2rk1/2qpbppp/p4n2/npp1p3/3PP3/2P2N2/PPB2PPP/RNBQR1K1 w - -" : [156,[45, 28, null], "book"],
  "r1b2rk1/2qpbppp/p4n2/npp1p3/3PP3/2P2N1P/PPB2PP1/RNBQR1K1 b - -" : [72,[26, 35, null], "book"],
  "r1b2rk1/2qpbppp/p1n2n2/1pp1p3/3PP3/2P2N1P/PPB2PP1/RNBQR1K1 w - -" : [126,[35, 28, null], "book"],
  "r1b2rk1/2qpbppp/p1n2n2/1ppPp3/4P3/2P2N1P/PPB2PP1/RNBQR1K1 b - -" : [95,[18, 24, null], "book"],
  "r1bn1rk1/2qpbppp/p4n2/1ppPp3/4P3/2P2N1P/PPB2PP1/RNBQR1K1 w - -" : [126,[48, 32, null], "book"],
  "r1bn1rk1/2qpbppp/p4n2/1ppPp3/4P3/2P2N1P/PPBN1PP1/R1BQR1K1 b - -" : [105,[11, 19, null], "book"],
  "r1bn1rk1/2qpbp1p/p4n2/1ppPp1p1/4P3/2P2N1P/PPBN1PP1/R1BQR1K1 w - -" : [327,[48, 32, null], "book"],
  "r1bqk2r/1pp1bppp/p1np1n2/4p3/B3P3/5N2/PPPP1PPP/RNBQR1K1 w kq -" : [51,[50, 42, null], "book"],
  "r1bqk2r/1pp1bppp/p1np1n2/4p3/B3P3/2P2N2/PP1P1PPP/RNBQR1K1 b kq -" : [49,[4, 6, null], "book"],
  "r1bq1rk1/1pp1bppp/p1np1n2/4p3/B3P3/2P2N2/PP1P1PPP/RNBQR1K1 w - -" : [52,[55, 47, null], "book"],
  "r1bq1rk1/1pp1bppp/p1np1n2/4p3/B2PP3/2P2N2/PP3PPP/RNBQR1K1 b - -" : [44,[9, 25, null], "book"],
  "r2q1rk1/1ppbbppp/p1np1n2/4p3/B2PP3/2P2N2/PP3PPP/RNBQR1K1 w - -" : [62,[55, 47, null], "book"],
  "r2q1rk1/1ppbbppp/p1np1n2/4p3/B2PP3/2P2N2/PP1N1PPP/R1BQR1K1 b - -" : [79,[28, 35, null], "book"],
  "r2qbrk1/1pp1bppp/p1np1n2/4p3/B2PP3/2P2N2/PP1N1PPP/R1BQR1K1 w - -" : [107,[32, 50, null], "book"],
  "r2q1rk1/1ppbbppp/p1np1n2/8/B2pP3/2P2N2/PP1N1PPP/R1BQR1K1 w - -" : [46,[42, 35, null], "book"],
  "r2q1rk1/1ppbbppp/p1np1n2/8/B2PP3/5N2/PP1N1PPP/R1BQR1K1 b - -" : [49,[18, 33, null], "book"],
  "r2q1rk1/1ppbbppp/p2p1n2/8/Bn1PP3/5N2/PP1N1PPP/R1BQR1K1 w - -" : [50,[32, 11, null], "book"],
  "r1bqkb1r/1pp2ppp/p1n2n2/3pp3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [215,[45, 28, null], "book"],
  "r1bqkb1r/1pp2ppp/p1np1n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [55,[61, 60, null], "book"],
  "r1bqkb1r/1ppp1p1p/p1n2np1/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [108,[32, 18, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1n5/4p3/B3n3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [54,[51, 35, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1n5/4p3/B2Pn3/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [61,[9, 25, null], "book"],
  "r1bqkb1r/2pp1ppp/p1n5/1p2p3/B2Pn3/5N2/PPP2PPP/RNBQ1RK1 w kq -" : [48,[32, 41, null], "book"],
  "r1bqkb1r/2pp1ppp/p1n5/1p2p3/3Pn3/1B3N2/PPP2PPP/RNBQ1RK1 b kq -" : [47,[11, 27, null], "book"],
  "r1bqkb1r/2p2ppp/p1n5/1p1pp3/3Pn3/1B3N2/PPP2PPP/RNBQ1RK1 w kq -" : [37,[35, 28, null], "book"],
  "r1bqkb1r/2p2ppp/p1n5/1p1pp3/P2Pn3/1B3N2/1PP2PPP/RNBQ1RK1 b kq -" : [-42,[18, 35, null], "book"],
  "r1bqkb1r/2p2ppp/p7/1p1pp3/P2nn3/1B3N2/1PP2PPP/RNBQ1RK1 w kq -" : [-31,[45, 35, null], "book"],
  "r1bqkb1r/2p2ppp/p7/1p1pp3/P2Nn3/1B6/1PP2PPP/RNBQ1RK1 b kq -" : [-20,[28, 35, null], "book"],
  "r1bqkb1r/2p2ppp/p7/1p1p4/P2pn3/1B6/1PP2PPP/RNBQ1RK1 w kq -" : [-27,[32, 25, null], "book"],
  "r1bqkb1r/2p2ppp/p7/1p1p4/P2pn3/1BN5/1PP2PPP/R1BQ1RK1 b kq -" : [-47,[36, 42, null], "book"],
  "r1bqkb1r/2p2ppp/p1n5/1p1pp3/2PPn3/1B3N2/PP3PPP/RNBQ1RK1 b kq -" : [-147,[27, 34, null], "book"],
  "r1bqkb1r/2p2ppp/p1n5/1p1pP3/4n3/1B3N2/PPP2PPP/RNBQ1RK1 b kq -" : [57,[2, 20, null], "book"],
  "r2qkb1r/2p2ppp/p1n1b3/1p1pP3/4n3/1B3N2/PPP2PPP/RNBQ1RK1 w kq -" : [44,[58, 44, null], "book"],
  "r2qkb1r/2p2ppp/p1n1b3/1p1pP3/4n3/1BP2N2/PP3PPP/RNBQ1RK1 b kq -" : [48,[5, 12, null], "book"],
  "r2qk2r/2p2ppp/p1n1b3/1pbpP3/4n3/1BP2N2/PP3PPP/RNBQ1RK1 w kq -" : [52,[41, 50, null], "book"],
  "r2qk2r/2p2ppp/p1n1b3/1pbpP3/4n3/1BP2N2/PP1N1PPP/R1BQ1RK1 b kq -" : [53,[4, 6, null], "book"],
  "r2q1rk1/2p2ppp/p1n1b3/1pbpP3/4n3/1BP2N2/PP1N1PPP/R1BQ1RK1 w - -" : [52,[41, 50, null], "book"],
  "r2q1rk1/2p2ppp/p1n1b3/1pbpP3/4n3/2P2N2/PPBN1PPP/R1BQ1RK1 b - -" : [30,[26, 53, null], "book"],
  "r2qk2r/2p2ppp/p1n1b3/1pbpP3/4n3/1BPQ1N2/PP3PPP/RNB2RK1 b kq -" : [28,[4, 6, null], "book"],
  "r2qk2r/2p1nppp/p3b3/1pbpP3/4n3/1BPQ1N2/PP3PPP/RNB2RK1 w kq -" : [52,[57, 51, null], "book"],
  "r2qk2r/2p1bppp/p1n1b3/1p1pP3/4n3/1BP2N2/PP3PPP/RNBQ1RK1 w kq -" : [43,[58, 37, null], "book"],
  "r2qk2r/2p1bppp/p1n1b3/1p1pP3/4n3/1BP2N2/PP3PPP/RNBQR1K1 b kq -" : [40,[4, 6, null], "book"],
  "r2q1rk1/2p1bppp/p1n1b3/1p1pP3/4n3/1BP2N2/PP3PPP/RNBQR1K1 w - -" : [33,[55, 47, null], "book"],
  "r2q1rk1/2p1bppp/p1n1b3/1p1pP3/3Nn3/1BP5/PP3PPP/RNBQR1K1 b - -" : [-17,[18, 28, null], "book"],
  "r2qkb1r/2p2ppp/p1n1b3/1pnpP3/8/1BP2N2/PP3PPP/RNBQ1RK1 w kq -" : [80,[41, 50, null], "book"],
  "r2qkb1r/2p2ppp/p1n1b3/1p1pP3/4n3/1B3N2/PPPN1PPP/R1BQ1RK1 b kq -" : [46,[36, 26, null], "book"],
  "r2qkb1r/2p2ppp/p1n1b3/1pnpP3/8/1B3N2/PPPN1PPP/R1BQ1RK1 w kq -" : [53,[50, 42, null], "book"],
  "r2qkb1r/2p2ppp/p1n1b3/1pnpP3/8/1BP2N2/PP1N1PPP/R1BQ1RK1 b kq -" : [48,[27, 35, null], "book"],
  "r2qkb1r/2p2ppp/p1n1b3/1pn1P3/3p4/1BP2N2/PP1N1PPP/R1BQ1RK1 w kq -" : [30,[41, 20, null], "book"],
  "r2qkb1r/2p2ppp/p1n1b3/1p1pP3/4n3/1B3N2/PPP1QPPP/RNB2RK1 b kq -" : [29,[5, 12, null], "book"],
  "r2qk2r/2p1bppp/p1n1b3/1p1pP3/4n3/1B3N2/PPP1QPPP/RNB2RK1 w kq -" : [41,[50, 42, null], "book"],
  "r2qk2r/2p1bppp/p1n1b3/1p1pP3/2P1n3/1B3N2/PP2QPPP/RNB2RK1 b kq -" : [-73,[25, 34, null], "book"],
  "r2qk2r/2p1bppp/p1n1b3/1p1pP3/4n3/1B3N2/PPP1QPPP/RNBR2K1 b kq -" : [9,[4, 6, null], "book"],
  "r2q1rk1/2p1bppp/p1n1b3/1p1pP3/4n3/1B3N2/PPP1QPPP/RNBR2K1 w - -" : [40,[50, 34, null], "book"],
  "r2q1rk1/2p1bppp/p1n1b3/1p1pP3/2P1n3/1B3N2/PP2QPPP/RNBR2K1 b - -" : [30,[25, 34, null], "book"],
  "r1bqkb1r/2p1nppp/p7/1p1pP3/4n3/1B3N2/PPP2PPP/RNBQ1RK1 w kq -" : [105,[48, 32, null], "book"],
  "r1bqkb1r/2pp1ppp/p1n5/1p1Pp3/B3n3/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [-70,[18, 12, null], "book"],
  "r1bqkb1r/2pp1ppp/p1n5/1p2N3/B2Pn3/8/PPP2PPP/RNBQ1RK1 b kq -" : [-19,[25, 32, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1n5/8/B2pn3/5N2/PPP2PPP/RNBQ1RK1 w kq -" : [112,[61, 60, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1n5/4p3/B3n3/2N2N2/PPPP1PPP/R1BQ1RK1 b kq -" : [-44,[36, 42, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1n5/4p3/B3n3/5N2/PPPPQPPP/RNB2RK1 b kq -" : [-22,[36, 26, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1n5/4p3/B3n3/5N2/PPPP1PPP/RNBQR1K1 b kq -" : [6,[36, 26, null], "book"],
  "r1bqkb1r/1pp2ppp/p1n5/3pp3/B3n3/5N2/PPPP1PPP/RNBQR1K1 w kq -" : [155,[32, 18, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPPQPPP/RNB1K2R b KQkq -" : [-11,[9, 25, null], "book"],
  "r1bqkb1r/1pppnppp/p1n5/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [53,[57, 42, null], "book"],
  "r1bqkbnr/1ppp1ppp/p1B5/4p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [-6,[11, 18, null], "book"],
  "r1bqkbnr/2pp1ppp/p1p5/4p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [55,[51, 35, null], "book"],
  "r1bqkbnr/2pp1ppp/p1p5/4p3/4P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq -" : [85,[3, 21, null], "book"],
  "r1bqkbnr/2pp2pp/p1p2p2/4p3/4P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq -" : [102,[45, 28, null], "book"],
  "r1bqkbnr/2pp2pp/p1p2p2/4p3/4P3/2NP1N2/PPP2PPP/R1BQK2R b KQkq -" : [21,[5, 33, null], "book"],
  "r1bqkbnr/1pp2ppp/p1p5/4p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [5,[60, 62, null], "book"],
  "r1bqkbnr/1pp2ppp/p1p5/4p3/3PP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [-22,[28, 35, null], "book"],
  "r1bqkbnr/1pp2ppp/p1p5/8/3pP3/5N2/PPP2PPP/RNBQK2R w KQkq -" : [-30,[59, 35, null], "book"],
  "r1bqkbnr/1pp2ppp/p1p5/8/3QP3/5N2/PPP2PPP/RNB1K2R b KQkq -" : [-15,[3, 35, null], "book"],
  "r1b1kbnr/1pp2ppp/p1p5/8/3qP3/5N2/PPP2PPP/RNB1K2R w KQkq -" : [-11,[45, 35, null], "book"],
  "r1b1kbnr/1pp2ppp/p1p5/8/3NP3/8/PPP2PPP/RNB1K2R b KQkq -" : [-17,[2, 11, null], "book"],
  "r1b1k1nr/1pp2ppp/p1pb4/8/3NP3/8/PPP2PPP/RNB1K2R w KQkq -" : [-5,[58, 44, null], "book"],
  "r1bqkbnr/1pp2ppp/p1p5/4p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq -" : [1,[3, 21, null], "book"],
  "r1bqk1nr/1pp2ppp/p1pb4/4p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [32,[51, 35, null], "book"],
  "r2qkbnr/1pp2ppp/p1p5/4p3/4P1b1/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [-7,[51, 43, null], "book"],
  "r2qkbnr/1pp2ppp/p1p5/4p3/4P1b1/5N1P/PPPP1PP1/RNBQ1RK1 b kq -" : [0,[15, 31, null], "book"],
  "r2qkbnr/1pp2pp1/p1p5/4p2p/4P1b1/5N1P/PPPP1PP1/RNBQ1RK1 w kq -" : [7,[51, 43, null], "book"],
  "r1bqkbnr/1pp3pp/p1p2p2/4p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [23,[51, 35, null], "book"],
  "r1b1kbnr/1pp2ppp/p1pq4/4p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [21,[57, 40, null], "book"],
  "r1bqkbnr/p1pp1ppp/1pn5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [93,[50, 42, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/1B2p3/1b2P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [76,[50, 42, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/1B2p3/1b2P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq -" : [76,[33, 24, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/bB2p3/4P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq -" : [77,[48, 32, null], "book"],
  "r1bqk1nr/pppp1ppp/2B5/b3p3/4P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq -" : [71,[11, 18, null], "book"],
  "r1bqk1nr/ppp2ppp/2p5/b3p3/4P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq -" : [75,[48, 32, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/1Bb1p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [64,[50, 42, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/1Bb1p3/1P2P3/5N2/P1PP1PPP/RNBQK2R b KQkq -" : [-50,[26, 33, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/1Bb1p3/4P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq -" : [60,[13, 29, null], "book"],
  "r1bqk1nr/pppp1ppp/1bn5/1B2p3/4P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq -" : [78,[51, 35, null], "book"],
  "r1bqk1nr/ppp2ppp/2n5/1Bbpp3/4P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq -" : [162,[45, 28, null], "book"],
  "r1bqk1nr/pppp2pp/2n5/1Bb1pp2/4P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq -" : [75,[51, 35, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/1Bb1p3/4P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq -" : [62,[51, 35, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/1Bb1p3/3PP3/2P2N2/PP3PPP/RNBQK2R b KQkq -" : [63,[28, 35, null], "book"],
  "r1bqk2r/pppp1ppp/1bn2n2/1B2p3/3PP3/2P2N2/PP3PPP/RNBQK2R w KQkq -" : [95,[45, 28, null], "book"],
  "r1bqk2r/pppp1ppp/1bn2n2/1B2p3/3PP3/2P2N2/PP3PPP/RNBQ1RK1 b kq -" : [48,[4, 6, null], "book"],
  "r1bq1rk1/pppp1ppp/1bn2n2/1B2p3/3PP3/2P2N2/PP3PPP/RNBQ1RK1 w - -" : [42,[48, 32, null], "book"],
  "r1b1k1nr/ppppqppp/2n5/1Bb1p3/4P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq -" : [101,[51, 35, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/1Bb1p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq -" : [38,[18, 35, null], "book"],
  "r1bqk1nr/pppp1ppp/8/1Bb1p3/3nP3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [44,[45, 35, null], "book"],
  "r1bqk1nr/pppp1ppp/8/1Bb1p3/1P1nP3/5N2/P1PP1PPP/RNBQ1RK1 b kq -" : [9,[35, 45, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/1Bb1p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [70,[45, 28, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/1Bb1p3/4P3/2P2N2/PP1P1PPP/RNBQ1RK1 b kq -" : [40,[4, 6, null], "book"],
  "r1bqk1nr/ppppbppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [60,[60, 62, null], "book"],
  "r1bqkbnr/ppp2ppp/2n5/1B1pp3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [140,[45, 28, null], "book"],
  "r1bqkbnr/ppp2ppp/2n5/1B1pN3/4P3/8/PPPP1PPP/RNBQK2R b KQkq -" : [129,[8, 16, null], "book"],
  "r1b1kbnr/ppp2ppp/2n5/1B1pN1q1/4P3/8/PPPP1PPP/RNBQK2R w KQkq -" : [161,[28, 45, null], "book"],
  "r1b1kbnr/ppp2ppp/2N5/1B1p2q1/4P3/8/PPPP1PPP/RNBQK2R b KQkq -" : [-53,[30, 54, null], "book"],
  "r1b1kbnr/ppp2ppp/2n5/1B1pN1q1/4P3/8/PPPP1PPP/RNBQ1RK1 b kq -" : [7,[30, 28, null], "book"],
  "r1bqkbnr/ppp2ppp/2np4/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [54,[60, 62, null], "book"],
  "r1bqkbnr/ppp2ppp/2np4/1B2p3/3PP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [62,[28, 35, null], "book"],
  "r2qkbnr/pppb1ppp/2np4/1B2p3/3PP3/5N2/PPP2PPP/RNBQK2R w KQkq -" : [82,[25, 18, null], "book"],
  "r2qkbnr/pppb1ppp/2np4/1B2p3/3PP3/2N2N2/PPP2PPP/R1BQK2R b KQkq -" : [48,[28, 35, null], "book"],
  "r2qkb1r/pppb1ppp/2np1n2/1B2p3/3PP3/2N2N2/PPP2PPP/R1BQK2R w KQkq -" : [88,[25, 18, null], "book"],
  "r2qkb1r/pppb1ppp/2Bp1n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQK2R b KQkq -" : [85,[11, 18, null], "book"],
  "r1bqkbnr/ppp2ppp/2np4/1B6/3pP3/5N2/PPP2PPP/RNBQK2R w KQkq -" : [64,[45, 35, null], "book"],
  "r1bqkbnr/ppp2ppp/2np4/1B6/3pP3/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [40,[2, 11, null], "book"],
  "r1bqkbnr/pppp2pp/2n5/1B2pp2/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [54,[57, 42, null], "book"],
  "r1bqkbnr/pppp2pp/2B5/4pp2/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [22,[11, 18, null], "book"],
  "r1bqkbnr/pppp2pp/2n5/1B2pp2/3PP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [16,[29, 36, null], "book"],
  "r1bqkbnr/pppp2pp/2n5/1B2pP2/8/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [-26,[28, 36, null], "book"],
  "r1bqkbnr/pppp2pp/2n5/1B2pp2/4P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq -" : [54,[29, 36, null], "book"],
  "r1bqkbnr/pppp2pp/2n5/1B2p3/4p3/2N2N2/PPPP1PPP/R1BQK2R w KQkq -" : [49,[42, 36, null], "book"],
  "r1bqkbnr/pppp2pp/2n5/1B2p3/4N3/5N2/PPPP1PPP/R1BQK2R b KQkq -" : [52,[6, 21, null], "book"],
  "r1bqk1nr/ppppb1pp/2n5/1B2p3/4N3/5N2/PPPP1PPP/R1BQK2R w KQkq -" : [125,[51, 35, null], "book"],
  "r1bqkbnr/ppp3pp/2n5/1B1pp3/4N3/5N2/PPPP1PPP/R1BQK2R w KQkq -" : [113,[45, 28, null], "book"],
  "r1bqkbnr/ppp3pp/2n5/1B1pN3/4N3/8/PPPP1PPP/R1BQK2R b KQkq -" : [110,[27, 36, null], "book"],
  "r1bqkbnr/ppp3pp/2n5/1B2N3/4p3/8/PPPP1PPP/R1BQK2R w KQkq -" : [69,[28, 18, null], "book"],
  "r1bqkbnr/ppp3pp/2N5/1B6/4p3/8/PPPP1PPP/R1BQK2R b KQkq -" : [85,[3, 30, null], "book"],
  "r1b1kbnr/ppp3pp/2N5/1B1q4/4p3/8/PPPP1PPP/R1BQK2R w KQkq -" : [117,[50, 34, null], "book"],
  "r1bqkb1r/pppp2pp/2n2n2/1B2p3/4N3/5N2/PPPP1PPP/R1BQK2R w KQkq -" : [64,[59, 52, null], "book"],
  "r1bqkbnr/pppp2pp/8/1B2pp2/3nP3/2N2N2/PPPP1PPP/R1BQK2R w KQkq -" : [118,[45, 28, null], "book"],
  "r1bqkbnr/pppp2pp/8/1B2pp2/3nP3/2N2N2/PPPP1PPP/R1BQ1RK1 b kq -" : [76,[35, 25, null], "book"],
  "r1bqkb1r/pppp2pp/2n2n2/1B2pp2/4P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq -" : [95,[36, 29, null], "book"],
  "r1bqkb1r/pppp2pp/2n2n2/1B2pP2/8/2N2N2/PPPP1PPP/R1BQK2R b KQkq -" : [107,[8, 16, null], "book"],
  "r1bqk2r/pppp2pp/2n2n2/1Bb1pP2/8/2N2N2/PPPP1PPP/R1BQK2R w KQkq -" : [104,[60, 62, null], "book"],
  "r1bqkbnr/pppp2pp/2n2p2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [97,[51, 35, null], "book"],
  "r1bqkbnr/pppp1p1p/2n5/1B2p1p1/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [134,[51, 35, null], "book"],
  "r1bqkbnr/pppp1p1p/2n3p1/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [56,[50, 42, null], "book"],
  "r1bqkbnr/pppp1ppp/8/1B2p3/3nP3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [51,[45, 35, null], "book"],
  "r1bqkbnr/pppp1ppp/8/1B2p3/3NP3/8/PPPP1PPP/RNBQK2R b KQkq -" : [52,[28, 35, null], "book"],
  "r1bqkbnr/pppp1ppp/8/1B6/3pP3/8/PPPP1PPP/RNBQK2R w KQkq -" : [55,[51, 43, null], "book"],
  "r1bqkbnr/pppp1ppp/8/1B6/3pP3/8/PPPP1PPP/RNBQ1RK1 b kq -" : [53,[10, 18, null], "book"],
  "r1bqkb1r/ppppnppp/8/1B6/3pP3/8/PPPP1PPP/RNBQ1RK1 w kq -" : [76,[51, 43, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [31,[60, 62, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/3P1N2/PPP2PPP/RNBQK2R b KQkq -" : [19,[5, 26, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/1Bb1p3/4P3/3P1N2/PPP2PPP/RNBQK2R w KQkq -" : [11,[25, 18, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/1Bb1p3/4P3/3PBN2/PPP2PPP/RN1QK2R b KQkq -" : [-6,[18, 35, null], "book"],
  "r1bqkb1r/ppp2ppp/2np1n2/1B2p3/4P3/3P1N2/PPP2PPP/RNBQK2R w KQkq -" : [31,[60, 62, null], "book"],
  "r1bqkb1r/ppp2ppp/2Bp1n2/4p3/4P3/3P1N2/PPP2PPP/RNBQK2R b KQkq -" : [-3,[9, 18, null], "book"],
  "r1bqkb1r/ppp2ppp/2np1n2/1B2p3/2P1P3/3P1N2/PP3PPP/RNBQK2R b KQkq -" : [-9,[14, 22, null], "book"],
  "r1bqkb1r/ppppnppp/5n2/1B2p3/4P3/3P1N2/PPP2PPP/RNBQK2R w KQkq -" : [49,[43, 35, null], "book"],
  "r1bqkb1r/ppppnppp/5n2/1B2N3/4P3/3P4/PPP2PPP/RNBQK2R b KQkq -" : [-134,[10, 18, null], "book"],
  "r1bqkb1r/pp1pnppp/2p2n2/1B2N3/4P3/3P4/PPP2PPP/RNBQK2R w KQkq -" : [-134,[28, 13, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/1B2p3/3PP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [0,[18, 35, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/1B6/3pP3/5N2/PPP2PPP/RNBQK2R w KQkq -" : [5,[60, 62, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/1B6/3pP3/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [4,[8, 16, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq -" : [32,[21, 36, null], "book"],
  "r1bqkb1r/ppp2ppp/2np1n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [57,[61, 60, null], "book"],
  "r1bqkb1r/ppp2ppp/2np1n2/1B2p3/3PP3/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [42,[28, 35, null], "book"],
  "r2qkb1r/pppb1ppp/2np1n2/1B2p3/3PP3/5N2/PPP2PPP/RNBQ1RK1 w kq -" : [57,[35, 27, null], "book"],
  "r2qkb1r/pppb1ppp/2np1n2/1B2p3/3PP3/2N2N2/PPP2PPP/R1BQ1RK1 b kq -" : [54,[28, 35, null], "book"],
  "r2qk2r/pppbbppp/2np1n2/1B2p3/3PP3/2N2N2/PPP2PPP/R1BQ1RK1 w kq -" : [60,[35, 27, null], "book"],
  "r2qk2r/pppbbppp/2np1n2/1B2p1B1/3PP3/2N2N2/PPP2PPP/R2Q1RK1 b kq -" : [24,[28, 35, null], "book"],
  "r2qk2r/pppbbppp/2Bp1n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQ1RK1 b kq -" : [40,[11, 18, null], "book"],
  "r2qk2r/pppbbppp/2np1n2/1B2p3/3PP3/2N2N2/PPP2PPP/R1BQR1K1 b kq -" : [29,[18, 35, null], "book"],
  "r2q1rk1/pppbbppp/2np1n2/1B2p3/3PP3/2N2N2/PPP2PPP/R1BQR1K1 w - -" : [59,[35, 27, null], "book"],
  "r2qkb1r/pppb1ppp/2np1n2/1B6/3pP3/2N2N2/PPP2PPP/R1BQ1RK1 w kq -" : [59,[45, 35, null], "book"],
  "r1bqkb1r/pppp1ppp/2n5/1B2p3/4P1n1/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [151,[55, 47, null], "book"],
  "r1bqkb1r/pppp1ppp/2n5/1B2p3/4n3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [34,[61, 60, null], "book"],
  "r1bqkb1r/pppp1ppp/2n5/1B2p3/3Pn3/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [19,[36, 19, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1n5/1B2p3/3Pn3/5N2/PPP2PPP/RNBQ1RK1 w kq -" : [49,[25, 18, null], "book"],
  "r1bqk2r/ppppbppp/2n5/1B2p3/3Pn3/5N2/PPP2PPP/RNBQ1RK1 w kq -" : [70,[59, 52, null], "book"],
  "r1bqk2r/ppppbppp/2n5/1B2P3/4n3/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [38,[4, 6, null], "book"],
  "r1bqk2r/ppppbppp/2n5/1B2p3/3Pn3/5N2/PPP1QPPP/RNB2RK1 b kq -" : [55,[36, 19, null], "book"],
  "r1bqk2r/ppp1bppp/2n5/1B1pp3/3Pn3/5N2/PPP1QPPP/RNB2RK1 w kq -" : [113,[45, 28, null], "book"],
  "r1bqk2r/ppppbppp/2nn4/1B2p3/3P4/5N2/PPP1QPPP/RNB2RK1 w kq -" : [55,[25, 18, null], "book"],
  "r1bqk2r/ppppbppp/2Bn4/4p3/3P4/5N2/PPP1QPPP/RNB2RK1 b kq -" : [56,[9, 18, null], "book"],
  "r1bqk2r/p1ppbppp/2pn4/4p3/3P4/5N2/PPP1QPPP/RNB2RK1 w kq -" : [59,[35, 28, null], "book"],
  "r1bqk2r/p1ppbppp/2pn4/4P3/8/5N2/PPP1QPPP/RNB2RK1 b kq -" : [50,[19, 9, null], "book"],
  "r1bqk2r/pnppbppp/2p5/4P3/8/5N2/PPP1QPPP/RNB2RK1 w kq -" : [47,[58, 44, null], "book"],
  "r1bqk2r/pnppbppp/2p5/4P3/8/1P3N2/P1P1QPPP/RNB2RK1 b kq -" : [38,[4, 6, null], "book"],
  "r1bqk2r/pnppbppp/2p5/4P3/2P5/5N2/PP2QPPP/RNB2RK1 b kq -" : [56,[4, 6, null], "book"],
  "r1bqk2r/pnppbppp/2p5/4P3/8/2N2N2/PPP1QPPP/R1B2RK1 b kq -" : [64,[4, 6, null], "book"],
  "r1bq1rk1/pnppbppp/2p5/4P3/8/2N2N2/PPP1QPPP/R1B2RK1 w - -" : [51,[61, 60, null], "book"],
  "r1bq1rk1/pnppbppp/2p5/4P3/8/2N2N2/PPP1QPPP/R1B1R1K1 b - -" : [58,[5, 4, null], "book"],
  "r1bqk2r/pnppbppp/2p5/4P3/3N4/8/PPP1QPPP/RNB2RK1 b kq -" : [44,[4, 6, null], "book"],
  "r1bq1rk1/pnppbppp/2p5/4P3/3N4/8/PPP1QPPP/RNB2RK1 w - -" : [47,[57, 42, null], "book"],
  "r1bqk2r/p1ppbppp/2p5/4Pn2/8/5N2/PPP1QPPP/RNB2RK1 w kq -" : [80,[52, 36, null], "book"],
  "r1bqkb1r/pppp1ppp/2nn4/1B2p3/3P4/5N2/PPP2PPP/RNBQ1RK1 w kq -" : [18,[25, 18, null], "book"],
  "r1bqkb1r/pppp1ppp/2Bn4/4p3/3P4/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [19,[11, 18, null], "book"],
  "r1bqkb1r/ppp2ppp/2pn4/4p3/3P4/5N2/PPP2PPP/RNBQ1RK1 w kq -" : [16,[35, 28, null], "book"],
  "r1bqkb1r/ppp2ppp/2pn4/4P3/8/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [10,[19, 29, null], "book"],
  "r1bqkb1r/ppp2ppp/2p5/4P3/4n3/5N2/PPP2PPP/RNBQ1RK1 w kq -" : [70,[59, 52, null], "book"],
  "r1bqkb1r/ppppnppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [70,[57, 42, null], "book"],
  "r1bqkb1r/ppppnppp/2n5/1B2p3/3PP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [55,[18, 35, null], "book"],
  "r1bqkb1r/ppppnppp/2n5/1B6/3pP3/5N2/PPP2PPP/RNBQK2R w KQkq -" : [56,[45, 35, null], "book"],
  "r1bqkb1r/ppppnppp/2n5/1B6/3NP3/8/PPP2PPP/RNBQK2R b KQkq -" : [54,[8, 16, null], "book"],
  "r1bqkb1r/ppppnp1p/2n3p1/1B6/3NP3/8/PPP2PPP/RNBQK2R w KQkq -" : [58,[58, 44, null], "book"],
  "r1bqkb1r/ppppnp1p/2n3p1/1B6/3NP3/2N5/PPP2PPP/R1BQK2R b KQkq -" : [43,[5, 14, null], "book"],
  "r1bqk2r/ppppnpbp/2n3p1/1B6/3NP3/2N5/PPP2PPP/R1BQK2R w KQkq -" : [58,[58, 44, null], "book"],
  "r1bqk2r/ppppnpbp/2n3p1/1B6/3NP3/2N1B3/PPP2PPP/R2QK2R b KQkq -" : [58,[4, 6, null], "book"],
  "r1bq1rk1/ppppnpbp/2n3p1/1B6/3NP3/2N1B3/PPP2PPP/R2QK2R w KQ -" : [62,[59, 51, null], "book"],
  "r1bq1rk1/ppppnpbp/2n3p1/1B6/3NP3/2N1B3/PPPQ1PPP/R3K2R b KQ -" : [52,[11, 27, null], "book"],
  "r1bq1rk1/ppp1npbp/2n3p1/1B1p4/3NP3/2N1B3/PPPQ1PPP/R3K2R w KQ -" : [62,[25, 18, null], "book"],
  "r1bqkb1r/ppppnppp/2n5/1B2p3/4P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq -" : [60,[12, 22, null], "book"],
  "r1bqkb1r/ppppnp1p/2n3p1/1B2p3/4P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq -" : [75,[51, 35, null], "book"],
  "r1b1kbnr/ppppqppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [112,[60, 62, null], "book"],
  "r1b1kbnr/pppp1ppp/2n2q2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [81,[50, 42, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [16,[5, 26, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [18,[51, 43, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R b KQkq -" : [-30,[26, 33, null], "book"],
  "r1bqk1nr/pppp1ppp/1bn5/4p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R w KQkq -" : [31,[48, 32, null], "book"],
  "r1bqk1nr/pppp1ppp/1bn5/1P2p3/2B1P3/5N2/P1PP1PPP/RNBQK2R b KQkq -" : [-44,[18, 24, null], "book"],
  "r1bqk1nr/pppp1ppp/1b6/nP2p3/2B1P3/5N2/P1PP1PPP/RNBQK2R w KQkq -" : [-53,[45, 28, null], "book"],
  "r1bqk1nr/pppp1ppp/1b6/nP2N3/2B1P3/8/P1PP1PPP/RNBQK2R b KQkq -" : [-41,[6, 23, null], "book"],
  "r1bqk2r/pppp1ppp/1b5n/nP2N3/2B1P3/8/P1PP1PPP/RNBQK2R w KQkq -" : [-47,[34, 52, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/4p3/1bB1P3/5N2/P1PP1PPP/RNBQK2R w KQkq -" : [-6,[50, 42, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/4p3/1bB1P3/2P2N2/P2P1PPP/RNBQK2R b KQkq -" : [-7,[33, 24, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/b3p3/2B1P3/2P2N2/P2P1PPP/RNBQK2R w KQkq -" : [2,[51, 35, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/b3p3/2BPP3/2P2N2/P4PPP/RNBQK2R b KQkq -" : [0,[28, 35, null], "book"],
  "r1bqk1nr/p1pp1ppp/2n5/bp2p3/2BPP3/2P2N2/P4PPP/RNBQK2R w KQkq -" : [25,[34, 25, null], "book"],
  "r1bqk1nr/ppp2ppp/2np4/b3p3/2BPP3/2P2N2/P4PPP/RNBQK2R w KQkq -" : [33,[59, 41, null], "book"],
  "r1bqk1nr/ppp2ppp/2np4/b3p1B1/2BPP3/2P2N2/P4PPP/RN1QK2R b KQkq -" : [-70,[6, 12, null], "book"],
  "r1bqk1nr/ppp2ppp/2np4/b3p3/2BPP3/2P2N2/P4PPP/RNBQ1RK1 b kq -" : [-30,[24, 17, null], "book"],
  "r1bqk1nr/ppp2ppp/1bnp4/4p3/2BPP3/2P2N2/P4PPP/RNBQ1RK1 w kq -" : [-3,[35, 28, null], "book"],
  "r1bqk1nr/ppp2ppp/2np4/b3p3/2BPP3/1QP2N2/P4PPP/RNB1K2R b KQkq -" : [-4,[3, 11, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/b7/2BpP3/2P2N2/P4PPP/RNBQK2R w KQkq -" : [8,[59, 41, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/b7/2BpP3/2P2N2/P4PPP/RNBQ1RK1 b kq -" : [-1,[6, 21, null], "book"],
  "r1bqk1nr/p1pp1ppp/2n5/bp6/2BpP3/2P2N2/P4PPP/RNBQ1RK1 w kq -" : [129,[34, 25, null], "book"],
  "r1bqk1nr/ppp2ppp/2np4/b7/2BpP3/2P2N2/P4PPP/RNBQ1RK1 w kq -" : [24,[59, 41, null], "book"],
  "r1bqk1nr/ppp2ppp/2np4/b7/2BpP3/1QP2N2/P4PPP/RNB2RK1 b kq -" : [21,[3, 12, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/b7/2B1P3/2p2N2/P4PPP/RNBQ1RK1 w kq -" : [60,[59, 41, null], "book"],
  "r1bqk2r/ppppnppp/2n5/b7/2BpP3/2P2N2/P4PPP/RNBQ1RK1 w kq -" : [14,[45, 30, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/b3p3/2B1P3/2P2N2/P2P1PPP/RNBQ1RK1 b kq -" : [-31,[24, 17, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/b3p3/2B1P3/2P2N2/P2P1PPP/RNBQ1RK1 w kq -" : [-51,[51, 35, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/b3p3/2BPP3/2P2N2/P4PPP/RNBQ1RK1 b kq -" : [-12,[28, 35, null], "book"],
  "r1bq1rk1/pppp1ppp/2n2n2/b3p3/2BPP3/2P2N2/P4PPP/RNBQ1RK1 w - -" : [-44,[35, 28, null], "book"],
  "r1bq1rk1/pppp1ppp/2n2n2/b3N3/2BPP3/2P5/P4PPP/RNBQ1RK1 b - -" : [31,[11, 19, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/P2P1PPP/RNBQK2R w KQkq -" : [20,[51, 35, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1p3/2BPP3/2P2N2/P4PPP/RNBQK2R b KQkq -" : [36,[26, 17, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b5/2BpP3/2P2N2/P4PPP/RNBQK2R w KQkq -" : [43,[42, 35, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b5/2BpP3/2P2N2/P4PPP/RNBQ1RK1 b kq -" : [32,[11, 19, null], "book"],
  "r1bqk1nr/ppp2ppp/2np4/2b5/2BpP3/2P2N2/P4PPP/RNBQ1RK1 w kq -" : [44,[42, 35, null], "book"],
  "r1bqk1nr/ppp2ppp/2np4/2b5/2BPP3/5N2/P4PPP/RNBQ1RK1 b kq -" : [31,[26, 17, null], "book"],
  "r1bqk1nr/ppp2ppp/1bnp4/8/2BPP3/5N2/P4PPP/RNBQ1RK1 w kq -" : [65,[57, 42, null], "book"],
  "r1bqk1nr/ppp2ppp/1bnp4/3P4/2B1P3/5N2/P4PPP/RNBQ1RK1 b kq -" : [15,[18, 24, null], "book"],
  "r1bqk1nr/ppp2ppp/1b1p4/n2P4/2B1P3/5N2/P4PPP/RNBQ1RK1 w kq -" : [20,[34, 43, null], "book"],
  "r1bqk1nr/ppp2ppp/1b1p4/n2P4/2B1P3/5N2/PB3PPP/RN1Q1RK1 b kq -" : [-7,[6, 12, null], "book"],
  "r1bqk2r/ppp1nppp/1b1p4/n2P4/2B1P3/5N2/PB3PPP/RN1Q1RK1 w kq -" : [11,[34, 43, null], "book"],
  "r1bqk1nr/ppp2ppp/1bnp4/8/2BPP3/2N2N2/P4PPP/R1BQ1RK1 b kq -" : [20,[18, 24, null], "book"],
  "r2qk1nr/ppp2ppp/1bnp4/8/2BPP1b1/2N2N2/P4PPP/R1BQ1RK1 w kq -" : [65,[34, 25, null], "book"],
  "r2qk1nr/ppp2ppp/1bnp4/8/Q1BPP1b1/2N2N2/P4PPP/R1B2RK1 b kq -" : [7,[38, 11, null], "book"],
  "r1bqk1nr/ppp2ppp/1b1p4/n7/2BPP3/2N2N2/P4PPP/R1BQ1RK1 w kq -" : [15,[34, 43, null], "book"],
  "r1bqk1nr/ppp2ppp/1b1p4/n5B1/2BPP3/2N2N2/P4PPP/R2Q1RK1 b kq -" : [-7,[13, 21, null], "book"],
  "r1bqk1nr/pppp1ppp/2nb4/4p3/2B1P3/2P2N2/P2P1PPP/RNBQK2R w KQkq -" : [43,[51, 35, null], "book"],
  "r1bqk1nr/ppppbppp/2n5/4p3/2B1P3/2P2N2/P2P1PPP/RNBQK2R w KQkq -" : [3,[51, 35, null], "book"],
  "r1bqk1nr/ppppbppp/2n5/4p3/2BPP3/2P2N2/P4PPP/RNBQK2R b KQkq -" : [-21,[18, 24, null], "book"],
  "r1bqk1nr/ppppbppp/8/n3p3/2BPP3/2P2N2/P4PPP/RNBQK2R w KQkq -" : [5,[34, 52, null], "book"],
  "r1bqk1nr/ppp2ppp/2n5/2bpp3/1PB1P3/5N2/P1PP1PPP/RNBQK2R w KQkq -" : [62,[36, 27, null], "book"],
  "r1bqk1nr/pppp1Bpp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [-248,[4, 13, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq -" : [16,[6, 21, null], "book"],
  "r1bqk1nr/ppp2ppp/2np4/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq -" : [59,[51, 35, null], "book"],
  "r1bqk1nr/ppp2ppp/2np4/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R b KQkq -" : [61,[26, 17, null], "book"],
  "r1bqk1nr/ppp2ppp/2np4/2b5/2BpP3/2P2N2/PP3PPP/RNBQK2R w KQkq -" : [62,[42, 35, null], "book"],
  "r1bqk1nr/ppp2ppp/2np4/2b5/2BPP3/5N2/PP3PPP/RNBQK2R b KQkq -" : [59,[26, 17, null], "book"],
  "r1bqk1nr/ppp2ppp/1bnp4/8/2BPP3/5N2/PP3PPP/RNBQK2R w KQkq -" : [67,[34, 25, null], "book"],
  "r1bqk1nr/pppp2pp/2n5/2b1pp2/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq -" : [125,[51, 35, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq -" : [25,[51, 43, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b1p3/1PB1P3/2P2N2/P2P1PPP/RNBQK2R b KQkq -" : [-10,[26, 12, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R b KQkq -" : [14,[11, 19, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R b KQkq -" : [7,[28, 35, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b5/2BpP3/2P2N2/PP3PPP/RNBQK2R w KQkq -" : [0,[42, 35, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b5/2BPP3/5N2/PP3PPP/RNBQK2R b KQkq -" : [-8,[26, 33, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/8/1bBPP3/5N2/PP3PPP/RNBQK2R w KQkq -" : [-5,[57, 51, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/8/1bBPP3/5N2/PP3PPP/RNBQ1K1R b kq -" : [-46,[11, 27, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/8/1bBPP3/2N2N2/PP3PPP/R1BQK2R b KQkq -" : [-53,[21, 36, null], "book"],
  "r1bqk2r/pppp1ppp/2n5/8/1bBPn3/2N2N2/PP3PPP/R1BQK2R w KQkq -" : [-51,[60, 62, null], "book"],
  "r1bqk2r/pppp1ppp/2n5/8/1bBPn3/2N2N2/PP3PPP/R1BQ1RK1 b kq -" : [-55,[33, 42, null], "book"],
  "r1bqk2r/pppp1ppp/2n5/8/2BPn3/2b2N2/PP3PPP/R1BQ1RK1 w kq -" : [-44,[35, 27, null], "book"],
  "r1bqk2r/pppp1ppp/2n5/3P4/2B1n3/2b2N2/PP3PPP/R1BQ1RK1 b kq -" : [-54,[42, 21, null], "book"],
  "r1bqk2r/pppp1ppp/2n2b2/3P4/2B1n3/5N2/PP3PPP/R1BQ1RK1 w kq -" : [-37,[61, 60, null], "book"],
  "r1bqk2r/pppp1ppp/2n2b2/3P4/2B1n3/5N2/PP3PPP/R1BQR1K1 b kq -" : [-34,[18, 12, null], "book"],
  "r1bqk2r/ppppnppp/5b2/3P4/2B1n3/5N2/PP3PPP/R1BQR1K1 w kq -" : [-29,[60, 36, null], "book"],
  "r1bqk2r/pppp1ppp/2n5/8/1bBP4/2n2N2/PP3PPP/R1BQ1RK1 w kq -" : [12,[49, 42, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b5/2BpP3/2P2N2/PP3PPP/RNBQ1RK1 b kq -" : [-42,[21, 36, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQ1RK1 b kq -" : [-62,[21, 36, null], "book"],
  "r1b1k1nr/ppppqppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq -" : [91,[49, 33, null], "book"],
  "r1b1k1nr/ppppqppp/2n5/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R b KQkq -" : [87,[26, 17, null], "book"],
  "r1b1k1nr/ppppqppp/1bn5/4p3/2BPP3/2P2N2/PP3PPP/RNBQK2R w KQkq -" : [101,[60, 62, null], "book"],
  "r1b1k1nr/ppppqppp/1bn5/4p1B1/2BPP3/2P2N2/PP3PPP/RN1QK2R b KQkq -" : [51,[6, 21, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq -" : [10,[6, 21, null], "book"],
  "r1bqk1nr/pppp2pp/2n5/2b1pp2/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq -" : [86,[57, 42, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq -" : [18,[57, 42, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R b KQkq -" : [27,[8, 16, null], "book"],
  "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq -" : [18,[42, 32, null], "book"],
  "r1bqk2r/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2QK2R b KQkq -" : [-1,[15, 23, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1p3/2BPP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [-28,[18, 35, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq -" : [12,[6, 21, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq -" : [15,[51, 43, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq -" : [5,[6, 21, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq -" : [6,[51, 43, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [-34,[26, 35, null], "book"],
  "r1bqk1nr/ppppbppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [45,[51, 35, null], "book"],
  "r1bqk1nr/ppppbppp/2n5/4p3/2BPP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [57,[28, 35, null], "book"],
  "r1bqk1nr/ppppbppp/2n5/8/2BpP3/5N2/PPP2PPP/RNBQK2R w KQkq -" : [67,[45, 35, null], "book"],
  "r1bqk1nr/ppppbppp/2n5/8/2BpP3/2P2N2/PP3PPP/RNBQK2R b KQkq -" : [30,[18, 24, null], "book"],
  "r1bqk2r/ppppbppp/2n2n2/8/2BpP3/2P2N2/PP3PPP/RNBQK2R w KQkq -" : [65,[36, 28, null], "book"],
  "r1bqkbnr/ppp2ppp/2np4/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [46,[50, 42, null], "book"],
  "r1bqkbnr/pppp2pp/2n5/4pp2/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [101,[51, 35, null], "book"],
  "r1bqkbnr/pppp1ppp/8/4p3/2BnP3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [109,[45, 35, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [32,[45, 30, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq -" : [-58,[21, 36, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq -" : [16,[5, 26, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2BPP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [-6,[28, 35, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/8/2BpP3/5N2/PPP2PPP/RNBQK2R w KQkq -" : [0,[36, 28, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/6N1/2BpP3/8/PPP2PPP/RNBQK2R b KQkq -" : [-57,[11, 27, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/8/2BpP3/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [-24,[21, 36, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b5/2BpP3/5N2/PPP2PPP/RNBQ1RK1 w kq -" : [52,[36, 28, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b1P3/2Bp4/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [34,[11, 27, null], "book"],
  "r1bqk2r/ppp2ppp/2n2n2/2bpP3/2Bp4/5N2/PPP2PPP/RNBQ1RK1 w kq d6" : [35,[28, 21, null], "book"],
  "r1bqk2r/ppp2ppp/2n2P2/2bp4/2Bp4/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [32,[27, 34, null], "book"],
  "r1bqk2r/ppp2ppp/2n2P2/2b5/2pp4/5N2/PPP2PPP/RNBQ1RK1 w kq -" : [37,[21, 14, null], "book"],
  "r1bqk2r/ppp2ppp/2n2P2/2b5/2pp4/5N2/PPP2PPP/RNBQR1K1 b kq -" : [19,[4, 5, null], "book"],
  "r2qk2r/ppp2ppp/2n1bP2/2b5/2pp4/5N2/PPP2PPP/RNBQR1K1 w kq -" : [40,[21, 14, null], "book"],
  "r2qk2r/ppp2ppp/2n1bP2/2b3N1/2pp4/8/PPP2PPP/RNBQR1K1 b kq -" : [0,[3, 27, null], "book"],
  "r2qk2r/ppp2p1p/2n1bPp1/2b3N1/2pp4/8/PPP2PPP/RNBQR1K1 w kq -" : [78,[59, 45, null], "book"],
  "r1bqk2r/ppp1bppp/2n2P2/8/2pp4/5N2/PPP2PPP/RNBQR1K1 w kq -" : [446,[21, 12, null], "book"],
  "r1bqk2r/ppp1bppp/2n2P2/6N1/2pp4/8/PPP2PPP/RNBQR1K1 b kq -" : [-227,[14, 21, null], "book"],
  "r1b1k2r/ppp1bppp/2n2P2/3q2N1/2pp4/8/PPP2PPP/RNBQR1K1 w kq -" : [360,[21, 12, null], "book"],
  "r1b1k2r/ppp1bppp/2n2P2/3q2N1/2pp4/2N5/PPP2PPP/R1BQR1K1 b kq -" : [233,[27, 29, null], "book"],
  "r1b1k2r/ppp1bppp/2n2P2/5qN1/2pp4/2N5/PPP2PPP/R1BQR1K1 w kq -" : [216,[60, 12, null], "book"],
  "r1bqkb1r/pppp1ppp/2n5/8/2Bpn3/5N2/PPP2PPP/RNBQ1RK1 w kq -" : [-39,[61, 60, null], "book"],
  "r1bqkb1r/pppp1ppp/2n5/8/2Bpn3/2N2N2/PPP2PPP/R1BQ1RK1 b kq -" : [-61,[36, 42, null], "book"],
  "r1bqkb1r/pppp1ppp/2n5/8/2Bpn3/5N2/PPP2PPP/RNBQR1K1 b kq -" : [-13,[11, 27, null], "book"],
  "r1bqkb1r/ppp2ppp/2n5/3p4/2Bpn3/5N2/PPP2PPP/RNBQR1K1 w kq -" : [4,[34, 27, null], "book"],
  "r1bqkb1r/ppp2ppp/2n5/3B4/3pn3/5N2/PPP2PPP/RNBQR1K1 b kq -" : [-16,[3, 27, null], "book"],
  "r1b1kb1r/ppp2ppp/2n5/3q4/3pn3/5N2/PPP2PPP/RNBQR1K1 w kq -" : [-3,[57, 42, null], "book"],
  "r1b1kb1r/ppp2ppp/2n5/3q4/3pn3/2N2N2/PPP2PPP/R1BQR1K1 b kq -" : [-12,[27, 24, null], "book"],
  "r1b1kb1r/ppp2ppp/2n5/q7/3pn3/2N2N2/PPP2PPP/R1BQR1K1 w kq -" : [3,[42, 36, null], "book"],
  "r1b1kb1r/ppp2ppp/2n5/q7/3pN3/5N2/PPP2PPP/R1BQR1K1 b kq -" : [0,[2, 20, null], "book"],
  "r3kb1r/ppp2ppp/2n1b3/q7/3pN3/5N2/PPP2PPP/R1BQR1K1 w kq -" : [11,[36, 30, null], "book"],
  "r3kb1r/ppp2ppp/2n1b3/q5B1/3pN3/5N2/PPP2PPP/R2QR1K1 b kq -" : [-81,[15, 23, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq -" : [18,[11, 27, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/2b1p1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq -" : [137,[30, 13, null], "book"],
  "r1bqk2r/pppp1Bpp/2n2n2/2b1p1N1/4P3/8/PPPP1PPP/RNBQK2R b KQkq -" : [80,[4, 12, null], "book"],
  "r1bq3r/ppppkBpp/2n2n2/2b1p1N1/4P3/8/PPPP1PPP/RNBQK2R w KQ -" : [91,[13, 34, null], "book"],
  "r1bq3r/ppppkBpp/2n2n2/2b1p1N1/3PP3/8/PPP2PPP/RNBQK2R b KQ -" : [8,[18, 35, null], "book"],
  "r1bqkb1r/ppp2ppp/2n2n2/3pp1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq -" : [26,[36, 27, null], "book"],
  "r1bqkb1r/ppp2ppp/2n2n2/3Pp1N1/2B5/8/PPPP1PPP/RNBQK2R b KQkq -" : [24,[18, 24, null], "book"],
  "r1bqkb1r/p1p2ppp/2n2n2/1p1Pp1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq -" : [71,[34, 61, null], "book"],
  "r1bqkb1r/p1p2ppp/2n2n2/1p1Pp1N1/8/8/PPPP1PPP/RNBQKB1R b KQkq -" : [62,[18, 35, null], "book"],
  "r1bqkb1r/p1p2pp1/2n2n1p/1p1Pp1N1/8/8/PPPP1PPP/RNBQKB1R w KQkq -" : [112,[30, 13, null], "book"],
  "r1bqkb1r/p1p2Np1/2n2n1p/1p1Pp3/8/8/PPPP1PPP/RNBQKB1R b KQkq -" : [103,[4, 13, null], "book"],
  "r1bqkb1r/ppp2ppp/5n2/n2Pp1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq -" : [33,[34, 25, null], "book"],
  "r1bqkb1r/ppp2ppp/5n2/nB1Pp1N1/8/8/PPPP1PPP/RNBQK2R b KQkq -" : [34,[10, 18, null], "book"],
  "r1bqkb1r/pp3ppp/2p2n2/nB1Pp1N1/8/8/PPPP1PPP/RNBQK2R w KQkq -" : [45,[27, 18, null], "book"],
  "r1bqkb1r/pp3ppp/2P2n2/nB2p1N1/8/8/PPPP1PPP/RNBQK2R b KQkq -" : [16,[9, 18, null], "book"],
  "r1bqkb1r/p4ppp/2p2n2/nB2p1N1/8/8/PPPP1PPP/RNBQK2R w KQkq -" : [13,[25, 43, null], "book"],
  "r1bqkb1r/p4ppp/2p2n2/n3p1N1/8/8/PPPPBPPP/RNBQK2R b KQkq -" : [0,[15, 23, null], "book"],
  "r1bqkb1r/p4pp1/2p2n1p/n3p1N1/8/8/PPPPBPPP/RNBQK2R w KQkq -" : [14,[30, 47, null], "book"],
  "r1bqkb1r/p4pp1/2p2n1p/n3p3/8/5N2/PPPPBPPP/RNBQK2R b KQkq -" : [-31,[28, 36, null], "book"],
  "r1bqkb1r/p4pp1/2p2n1p/n7/4p3/5N2/PPPPBPPP/RNBQK2R w KQkq -" : [-19,[45, 28, null], "book"],
  "r1bqkb1r/p4pp1/2p2n1p/n3N3/4p3/8/PPPPBPPP/RNBQK2R b KQkq -" : [-3,[5, 26, null], "book"],
  "r1bqkb1r/p4ppp/2p2n2/nB2p1N1/8/5Q2/PPPP1PPP/RNB1K2R b KQkq -" : [-32,[5, 12, null], "book"],
  "1rbqkb1r/p4ppp/2p2n2/nB2p1N1/8/5Q2/PPPP1PPP/RNB1K2R w KQk -" : [11,[25, 43, null], "book"],
  "r1bqkb1r/ppp2ppp/5n2/n2Pp1N1/2B5/3P4/PPP2PPP/RNBQK2R b KQkq -" : [-50,[15, 23, null], "book"],
  "r1bqkb1r/ppp2pp1/5n1p/n2Pp1N1/2B5/3P4/PPP2PPP/RNBQK2R w KQkq -" : [-32,[30, 45, null], "book"],
  "r1bqkb1r/ppp2pp1/5n1p/n2Pp3/2B5/3P1N2/PPP2PPP/RNBQK2R b KQkq -" : [-38,[28, 36, null], "book"],
  "r1bqkb1r/ppp2pp1/5n1p/n2P4/2B1p3/3P1N2/PPP2PPP/RNBQK2R w KQkq -" : [-50,[59, 52, null], "book"],
  "r1bqkb1r/ppp2pp1/5n1p/n2P4/2B1p3/3P1N2/PPP1QPPP/RNB1K2R b KQkq -" : [-64,[24, 34, null], "book"],
  "r1bqkb1r/ppp2pp1/5n1p/3P4/2n1p3/3P1N2/PPP1QPPP/RNB1K2R w KQkq -" : [-48,[43, 34, null], "book"],
  "r1bqkb1r/ppp2pp1/5n1p/3P4/2P1p3/5N2/PPP1QPPP/RNB1K2R b KQkq -" : [-48,[5, 26, null], "book"],
  "r1bqk2r/ppp2pp1/5n1p/2bP4/2P1p3/5N2/PPP1QPPP/RNB1K2R w KQkq -" : [-49,[45, 51, null], "book"],
  "r1bqk2r/ppp2pp1/5n1p/2bP4/2P1p3/8/PPPNQPPP/RNB1K2R b KQkq -" : [-72,[4, 6, null], "book"],
  "r1bqkb1r/ppp2ppp/5n2/3Pp1N1/1nB5/8/PPPP1PPP/RNBQK2R w KQkq -" : [70,[27, 19, null], "book"],
  "r1bqkb1r/ppp2ppp/5n2/3Pp1N1/2Bn4/8/PPPP1PPP/RNBQK2R w KQkq -" : [61,[50, 42, null], "book"],
  "r1bqkb1r/ppp2ppp/5n2/3Pp1N1/2Bn4/2P5/PP1P1PPP/RNBQK2R b KQkq -" : [88,[35, 29, null], "book"],
  "r1bqkb1r/p1p2ppp/5n2/1p1Pp1N1/2Bn4/2P5/PP1P1PPP/RNBQK2R w KQkq -" : [72,[34, 61, null], "book"],
  "r1bqkb1r/p1p2ppp/5n2/1p1Pp1N1/3n4/2P5/PP1P1PPP/RNBQKB1R b KQkq -" : [74,[21, 27, null], "book"],
  "r1bqkb1r/p1p2ppp/8/1p1np1N1/3n4/2P5/PP1P1PPP/RNBQKB1R w KQkq -" : [93,[30, 13, null], "book"],
  "r1bqkb1r/p1p2ppp/8/1p1np3/3nN3/2P5/PP1P1PPP/RNBQKB1R b KQkq -" : [12,[35, 20, null], "book"],
  "r1b1kb1r/p1p2ppp/8/1p1np3/3nN2q/2P5/PP1P1PPP/RNBQKB1R w KQkq -" : [105,[36, 46, null], "book"],
  "r1bqkb1r/ppp2ppp/2n5/3np1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq -" : [88,[30, 13, null], "book"],
  "r1bqkb1r/ppp2ppp/2n5/3np1N1/2BP4/8/PPP2PPP/RNBQK2R b KQkq -" : [64,[18, 35, null], "book"],
  "r1bqkb1r/ppp2Npp/2n5/3np3/2B5/8/PPPP1PPP/RNBQK2R b KQkq -" : [90,[4, 13, null], "book"],
  "r1bqkb1r/pppp1ppp/2n5/4p1N1/2B1n3/8/PPPP1PPP/RNBQK2R w KQkq -" : [171,[34, 13, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPPBPPP/RNBQK2R b KQkq -" : [-15,[6, 21, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/5N2/PPPPBPPP/RNBQK2R w KQkq -" : [0,[57, 42, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/3P1N2/PPP1BPPP/RNBQK2R b KQkq -" : [-21,[11, 27, null], "book"],
  "r1bqkb1r/ppp2ppp/2n2n2/3pp3/4P3/3P1N2/PPP1BPPP/RNBQK2R w KQkq -" : [-7,[36, 27, null], "book"],
  "r1bqkb1r/ppp2ppp/2n2n2/3pp3/4P3/3P1N2/PPPNBPPP/R1BQK2R b KQkq -" : [-30,[5, 26, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/5N2/PPP1BPPP/RNBQK2R b KQkq -" : [-43,[28, 35, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/8/3pP3/5N2/PPP1BPPP/RNBQK2R w KQkq -" : [-37,[36, 28, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4P3/3p4/5N2/PPP1BPPP/RNBQK2R b KQkq -" : [-40,[21, 38, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/2P2N2/PP1P1PPP/RNBQKB1R b KQkq -" : [-14,[11, 27, null], "book"],
  "r1bqkbnr/ppp2ppp/2n5/3pp3/4P3/2P2N2/PP1P1PPP/RNBQKB1R w KQkq -" : [-24,[59, 32, null], "book"],
  "r1bqkbnr/ppp2ppp/2n5/1B1pp3/4P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq -" : [-57,[27, 36, null], "book"],
  "r1bqkbnr/ppp2ppp/2n5/1B2p3/4p3/2P2N2/PP1P1PPP/RNBQK2R w KQkq -" : [-47,[45, 28, null], "book"],
  "r1bqkbnr/ppp2ppp/2n5/1B2N3/4p3/2P5/PP1P1PPP/RNBQK2R b KQkq -" : [-44,[3, 27, null], "book"],
  "r1b1kbnr/ppp2ppp/2n5/1B1qN3/4p3/2P5/PP1P1PPP/RNBQK2R w KQkq -" : [-44,[25, 18, null], "book"],
  "r1b1kbnr/ppp2ppp/2n5/1B1qN3/Q3p3/2P5/PP1P1PPP/RNB1K2R b KQkq -" : [-45,[6, 12, null], "book"],
  "r1bqkbnr/ppp2ppp/2n5/3pp3/Q3P3/2P2N2/PP1P1PPP/RNB1KB1R b KQkq -" : [-23,[13, 21, null], "book"],
  "r2qkbnr/pppb1ppp/2n5/3pp3/Q3P3/2P2N2/PP1P1PPP/RNB1KB1R w KQkq -" : [-8,[36, 27, null], "book"],
  "r1bqkbnr/ppp3pp/2n2p2/3pp3/Q3P3/2P2N2/PP1P1PPP/RNB1KB1R w KQkq -" : [-24,[51, 43, null], "book"],
  "r1bqkb1r/ppp2ppp/2n2n2/3pp3/Q3P3/2P2N2/PP1P1PPP/RNB1KB1R w KQkq -" : [26,[45, 28, null], "book"],
  "r1bqkbnr/pppp2pp/2n5/4pp2/4P3/2P2N2/PP1P1PPP/RNBQKB1R w KQkq -" : [42,[36, 29, null], "book"],
  "r1bqkbnr/pppp2pp/2n5/4pp2/3PP3/2P2N2/PP3PPP/RNBQKB1R b KQkq -" : [31,[29, 36, null], "book"],
  "r1bqkbnr/ppp3pp/2np4/4pp2/3PP3/2P2N2/PP3PPP/RNBQKB1R w KQkq -" : [113,[36, 29, null], "book"],
  "r1bqkbnr/ppp3pp/2np4/3Ppp2/4P3/2P2N2/PP3PPP/RNBQKB1R b KQkq -" : [63,[18, 12, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2P2N2/PP1P1PPP/RNBQKB1R w KQkq -" : [16,[51, 35, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2PP1N2/PP3PPP/RNBQKB1R b KQkq -" : [-29,[11, 27, null], "book"],
  "r1bqk2r/ppppbppp/2n2n2/4p3/4P3/2PP1N2/PP3PPP/RNBQKB1R w KQkq -" : [-7,[42, 34, null], "book"],
  "r1bqk2r/ppppbppp/2n2n2/4p3/1P2P3/2PP1N2/P4PPP/RNBQKB1R b KQkq -" : [-6,[11, 27, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/2P2N2/PP3PPP/RNBQKB1R b KQkq -" : [-8,[21, 36, null], "book"],
  "r1bqkb1r/pppp1ppp/2n5/4p3/3Pn3/2P2N2/PP3PPP/RNBQKB1R w KQkq -" : [22,[35, 27, null], "book"],
  "r1bqkb1r/pppp1ppp/2n5/3Pp3/4n3/2P2N2/PP3PPP/RNBQKB1R b KQkq -" : [-35,[5, 26, null], "book"],
  "r1bqk2r/pppp1ppp/2n5/2bPp3/4n3/2P2N2/PP3PPP/RNBQKB1R w KQkq -" : [-11,[27, 18, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/2P1P3/5N2/PP1P1PPP/RNBQKB1R b KQkq -" : [-54,[5, 26, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [35,[28, 35, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [36,[45, 35, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/1B6/3pP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [-45,[5, 26, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/2BpP3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [1,[6, 21, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/8/1bBpP3/5N2/PPP2PPP/RNBQK2R w KQkq -" : [3,[50, 42, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b5/2BpP3/5N2/PPP2PPP/RNBQK2R w KQkq -" : [0,[50, 42, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b3N1/2BpP3/8/PPP2PPP/RNBQK2R b KQkq -" : [-20,[6, 23, null], "book"],
  "r1bqk2r/pppp1ppp/2n4n/2b3N1/2BpP3/8/PPP2PPP/RNBQK2R w KQkq -" : [0,[30, 13, null], "book"],
  "r1bqk2r/pppp1ppp/2n4n/2b3NQ/2BpP3/8/PPP2PPP/RNB1K2R b KQkq -" : [-103,[3, 12, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b5/2BpP3/5N2/PPP2PPP/RNBQ1RK1 b kq -" : [-41,[11, 19, null], "book"],
  "r1bqk1nr/ppp2ppp/2np4/2b5/2BpP3/5N2/PPP2PPP/RNBQ1RK1 w kq -" : [-32,[50, 42, null], "book"],
  "r1bqk1nr/ppp2ppp/2np4/2b5/2BpP3/2P2N2/PP3PPP/RNBQ1RK1 b kq -" : [-56,[2, 38, null], "book"],
  "r2qk1nr/ppp2ppp/2np4/2b5/2BpP1b1/2P2N2/PP3PPP/RNBQ1RK1 w kq -" : [-40,[59, 41, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/3pP3/2P2N2/PP3PPP/RNBQKB1R b KQkq -" : [-22,[11, 27, null], "book"],
  "r1bqkbnr/ppp2ppp/2n5/3p4/3pP3/2P2N2/PP3PPP/RNBQKB1R w KQkq -" : [-26,[36, 27, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/4P3/2p2N2/PP3PPP/RNBQKB1R w KQkq -" : [-5,[57, 42, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/2B1P3/2p2N2/PP3PPP/RNBQK2R b KQkq -" : [-66,[42, 49, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/4P3/2N2N2/PP3PPP/R1BQKB1R b KQkq -" : [-28,[5, 26, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/8/1b2P3/2N2N2/PP3PPP/R1BQKB1R w KQkq -" : [0,[61, 34, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/8/1bB1P3/2N2N2/PP3PPP/R1BQK2R b KQkq -" : [-5,[33, 42, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/8/1bB1P3/2N2N2/PP3PPP/R1BQK2R w KQkq -" : [6,[36, 28, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq -" : [37,[6, 21, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/8/1b1NP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [37,[50, 42, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b5/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [30,[35, 41, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b5/3NP3/4B3/PPP2PPP/RN1QKB1R b KQkq -" : [23,[3, 21, null], "book"],
  "r1b1k1nr/pppp1ppp/2n2q2/2b5/3NP3/4B3/PPP2PPP/RN1QKB1R w KQkq -" : [29,[50, 42, null], "book"],
  "r1b1k1nr/pppp1ppp/2n2q2/2b5/3NP3/2P1B3/PP3PPP/RN1QKB1R b KQkq -" : [21,[21, 22, null], "book"],
  "r1b1k2r/ppppnppp/2n2q2/2b5/3NP3/2P1B3/PP3PPP/RN1QKB1R w KQkq -" : [32,[61, 34, null], "book"],
  "r1b1k2r/ppppnppp/2n2q2/1Bb5/3NP3/2P1B3/PP3PPP/RN1QK2R b KQkq -" : [20,[26, 17, null], "book"],
  "r1bnk2r/ppppnppp/5q2/1Bb5/3NP3/2P1B3/PP3PPP/RN1QK2R w KQkq -" : [76,[60, 62, null], "book"],
  "r1b1k2r/ppppnppp/2n2q2/2b5/4P3/2P1B3/PPN2PPP/RN1QKB1R b KQkq -" : [-20,[11, 19, null], "book"],
  "r1b1k2r/ppppnppp/2n2q2/2b5/3NP3/2P1B3/PP1Q1PPP/RN2KB1R b KQkq -" : [0,[4, 6, null], "book"],
  "r1b1k1nr/pppp1ppp/2n3q1/2b5/3NP3/2P1B3/PP3PPP/RN1QKB1R w KQkq -" : [45,[59, 52, null], "book"],
  "r1b1k1nr/pppp1ppp/2n2q2/1Nb5/4P3/4B3/PPP2PPP/RN1QKB1R b KQkq -" : [-73,[26, 44, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b5/4P3/1N6/PPP2PPP/RNBQKB1R b KQkq -" : [40,[26, 33, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/8/1b2P3/1N6/PPP2PPP/RNBQKB1R w KQkq -" : [55,[50, 42, null], "book"],
  "r1bqk1nr/pppp1ppp/1bn5/8/4P3/1N6/PPP2PPP/RNBQKB1R w KQkq -" : [33,[57, 42, null], "book"],
  "r1bqk1nr/pppp1ppp/1bn5/8/P3P3/1N6/1PP2PPP/RNBQKB1R b KQkq -" : [34,[8, 24, null], "book"],
  "r1bqk1nr/1ppp1ppp/pbn5/8/P3P3/1N6/1PP2PPP/RNBQKB1R w KQkq -" : [22,[57, 42, null], "book"],
  "r1bqk1nr/1ppp1ppp/pbn5/8/P3P3/1NN5/1PP2PPP/R1BQKB1R b KQkq -" : [19,[11, 19, null], "book"],
  "r1bqk2r/1ppp1ppp/pbn2n2/8/P3P3/1NN5/1PP2PPP/R1BQKB1R w KQkq -" : [19,[58, 30, null], "book"],
  "r1bqk1nr/pppp1ppp/2N5/2b5/4P3/8/PPP2PPP/RNBQKB1R b KQkq -" : [25,[3, 21, null], "book"],
  "r1b1k1nr/pppp1ppp/2N2q2/2b5/4P3/8/PPP2PPP/RNBQKB1R w KQkq -" : [18,[59, 45, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [26,[35, 18, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4P3/3N4/8/PPP2PPP/RNBQKB1R b KQkq -" : [-77,[18, 28, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq -" : [16,[5, 33, null], "book"],
  "r1bqkb1r/pppp1ppp/2N2n2/8/4P3/8/PPP2PPP/RNBQKB1R b KQkq -" : [11,[9, 18, null], "book"],
  "r1bqkb1r/p1pp1ppp/2p2n2/8/4P3/8/PPP2PPP/RNBQKB1R w KQkq -" : [26,[36, 28, null], "book"],
  "r1bqkb1r/p1pp1ppp/2p2n2/8/4P3/8/PPPN1PPP/R1BQKB1R b KQkq -" : [-13,[5, 26, null], "book"],
  "r1b1kbnr/pppp1ppp/2n5/8/3NP2q/8/PPP2PPP/RNBQKB1R w KQkq -" : [70,[57, 42, null], "book"],
  "r1b1kbnr/pppp1ppp/2n5/8/3NP2q/4B3/PPP2PPP/RN1QKB1R b KQkq -" : [17,[6, 21, null], "book"],
  "r1b1kbnr/pppp1ppp/2n5/1N6/4P2q/8/PPP2PPP/RNBQKB1R b KQkq -" : [29,[5, 33, null], "book"],
  "r1b1kbnr/pppp1ppp/2n5/8/3NP2q/2N5/PPP2PPP/R1BQKB1R b KQkq -" : [60,[5, 33, null], "book"],
  "r1b1k1nr/pppp1ppp/2n5/8/1b1NP2q/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [57,[61, 52, null], "book"],
  "r1b1kbnr/pppp1ppp/2n5/8/4P2q/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [0,[39, 36, null], "book"],
  "r1b1kbnr/pppp1ppp/2n5/5N2/4P2q/8/PPP2PPP/RNBQKB1R b KQkq -" : [-67,[39, 36, null], "book"],
  "r1bqkbnr/pppp1ppp/8/4p3/3nP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [61,[45, 35, null], "book"],
  "r1bqkbnr/pppp1ppp/8/4p3/3NP3/8/PPP2PPP/RNBQKB1R b KQkq -" : [69,[28, 35, null], "book"],
  "r1bqkbnr/pppp1ppp/8/8/3pP3/8/PPP2PPP/RNBQKB1R w KQkq -" : [71,[59, 35, null], "book"],
  "r1bqkbnr/pppp1ppp/8/8/2BpP3/8/PPP2PPP/RNBQK2R b KQkq -" : [52,[11, 27, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5NP1/PPPP1P1P/RNBQKB1R b KQkq -" : [-9,[11, 27, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq -" : [8,[6, 21, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/4p3/1b2P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq -" : [58,[42, 27, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/3Np3/1b2P3/5N2/PPPP1PPP/R1BQKB1R b KQkq -" : [54,[6, 21, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/3Np3/1b2P3/5N2/PPPP1PPP/R1BQKB1R w KQkq -" : [59,[50, 42, null], "book"],
  "r1bqkbnr/pppp2pp/2n5/4pp2/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq -" : [114,[36, 29, null], "book"],
  "r1bqkbnr/pppp1p1p/2n3p1/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq -" : [105,[51, 35, null], "book"],
  "r1bqkbnr/pppp1p1p/2n3p1/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq -" : [88,[28, 35, null], "book"],
  "r1bqkbnr/pppp1p1p/2n3p1/8/3pP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq -" : [94,[45, 35, null], "book"],
  "r1bqkbnr/pppp1p1p/2n3p1/3N4/3pP3/5N2/PPP2PPP/R1BQKB1R b KQkq -" : [0,[5, 14, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq -" : [26,[61, 25, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/P1N2N2/1PPP1PPP/R1BQKB1R b KQkq -" : [-8,[11, 27, null], "book"],
  "r1bqkb1r/ppp2ppp/2np1n2/4p3/4P3/P1N2N2/1PPP1PPP/R1BQKB1R w KQkq -" : [48,[51, 35, null], "book"],
  "r1bqkb1r/ppp2ppp/2np1n2/4p3/4P3/P1N2N1P/1PPP1PP1/R1BQKB1R b KQkq -" : [17,[18, 35, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq -" : [4,[18, 35, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1n2n2/1B2p3/4P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq -" : [44,[25, 18, null], "book"],
  "r1bqkb1r/1ppp1ppp/p1B2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq -" : [50,[11, 18, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/1B2p3/1b2P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq -" : [26,[60, 62, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/1B2p3/1b2P3/2N2N2/PPPP1PPP/R1BQ1RK1 b kq -" : [15,[4, 6, null], "book"],
  "r1bq1rk1/pppp1ppp/2n2n2/1B2p3/1b2P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - -" : [21,[51, 43, null], "book"],
  "r1bq1rk1/pppp1ppp/2B2n2/4p3/1b2P3/2N2N2/PPPP1PPP/R1BQ1RK1 b - -" : [2,[11, 18, null], "book"],
  "r1bq1rk1/pppp1ppp/2n2n2/1B2p3/1b2P3/2NP1N2/PPP2PPP/R1BQ1RK1 b - -" : [22,[11, 19, null], "book"],
  "r1bq1rk1/pppp1ppp/2n2n2/1B2p3/4P3/2bP1N2/PPP2PPP/R1BQ1RK1 w - -" : [17,[49, 42, null], "book"],
  "r1bq1rk1/pppp1ppp/2n2n2/1B2p3/4P3/2PP1N2/P1P2PPP/R1BQ1RK1 b - -" : [27,[11, 19, null], "book"],
  "r1bq1rk1/ppp2ppp/2n2n2/1B1pp3/4P3/2PP1N2/P1P2PPP/R1BQ1RK1 w - -" : [38,[25, 18, null], "book"],
  "r1bq1rk1/ppp2ppp/2np1n2/1B2p3/4P3/2PP1N2/P1P2PPP/R1BQ1RK1 w - -" : [25,[58, 30, null], "book"],
  "r1bq1rk1/ppp2ppp/2np1n2/1B2p3/4P3/2PP1N2/P1P2PPP/R1BQR1K1 b - -" : [14,[8, 16, null], "book"],
  "r1bq1rk1/ppp2ppp/2np1n2/1B2p3/1b2P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - -" : [34,[42, 52, null], "book"],
  "r1bq1rk1/ppp2ppp/2np1n2/1B2p1B1/1b2P3/2NP1N2/PPP2PPP/R2Q1RK1 b - -" : [4,[18, 12, null], "book"],
  "r1bq1rk1/ppp2ppp/2np1n2/1B2p1B1/4P3/2bP1N2/PPP2PPP/R2Q1RK1 w - -" : [30,[49, 42, null], "book"],
  "r1bq1rk1/ppp2ppp/2np1n2/1B2p1B1/4P3/2PP1N2/P1P2PPP/R2Q1RK1 b - -" : [22,[15, 23, null], "book"],
  "r1bq1rk1/ppp1nppp/3p1n2/1B2p1B1/4P3/2PP1N2/P1P2PPP/R2Q1RK1 w - -" : [32,[30, 21, null], "book"],
  "r1b2rk1/ppp1qppp/2np1n2/1B2p1B1/4P3/2PP1N2/P1P2PPP/R2Q1RK1 w - -" : [33,[43, 35, null], "book"],
  "r1b2rk1/ppp1qppp/2np1n2/1B2p1B1/4P3/2PP1N2/P1P2PPP/R2QR1K1 b - -" : [18,[8, 16, null], "book"],
  "r1bn1rk1/ppp1qppp/3p1n2/1B2p1B1/4P3/2PP1N2/P1P2PPP/R2QR1K1 w - -" : [46,[43, 35, null], "book"],
  "r1bq1rk1/ppp1nppp/3p1n2/1B2p1B1/1b2P3/2NP1N2/PPP2PPP/R2Q1RK1 w - -" : [6,[30, 21, null], "book"],
  "r1bq1rk1/ppp2ppp/2np1n2/1B2p3/1b2P3/3P1N2/PPP1NPPP/R1BQ1RK1 b - -" : [27,[18, 12, null], "book"],
  "r1bq1rk1/pppp1ppp/2n2n2/1B1Np3/1b2P3/5N2/PPPP1PPP/R1BQ1RK1 b - -" : [-14,[21, 27, null], "book"],
  "r1bq1rk1/pppp1ppp/2n2n2/1BbNp3/4P3/5N2/PPPP1PPP/R1BQ1RK1 w - -" : [67,[50, 42, null], "book"],
  "r1bq1rk1/pppp1ppp/2n2n2/1BbNp3/3PP3/5N2/PPP2PPP/R1BQ1RK1 b - -" : [50,[21, 27, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/1Bb1p3/4P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq -" : [30,[60, 62, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/1Bb1N3/4P3/2N5/PPPP1PPP/R1BQK2R b KQkq -" : [19,[18, 28, null], "book"],
  "r1bqk2r/pppp1ppp/5n2/1Bb1N3/3nP3/2N5/PPPP1PPP/R1BQK2R w KQkq -" : [66,[28, 43, null], "book"],
  "r1bqk2r/pppp1ppp/5n2/2b1N3/B2nP3/2N5/PPPP1PPP/R1BQK2R b KQkq -" : [-3,[4, 6, null], "book"],
  "r1bq1rk1/pppp1ppp/5n2/2b1N3/B2nP3/2N5/PPPP1PPP/R1BQK2R w KQ -" : [-13,[28, 43, null], "book"],
  "r1bqkb1r/pppp1ppp/5n2/1B2p3/3nP3/2N2N2/PPPP1PPP/R1BQK2R w KQkq -" : [0,[45, 35, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq -" : [-42,[21, 36, null], "book"],
  "r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/2N2N2/PPPP1PPP/R1BQK2R w KQkq -" : [-17,[42, 36, null], "book"],
  "r1bqkb1r/pppp1Bpp/2n5/4p3/4n3/2N2N2/PPPP1PPP/R1BQK2R b KQkq -" : [-113,[4, 13, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq -" : [4,[28, 35, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/4p3/1b1PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq -" : [20,[45, 28, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/3Pp3/1b2P3/2N2N2/PPP2PPP/R1BQKB1R b KQkq -" : [3,[18, 12, null], "book"],
  "r1bqk2r/pppp1ppp/5n2/3Pp3/1b1nP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq -" : [269,[45, 28, null], "book"],
  "r1bqk2r/pppp1ppp/2n2n2/4N3/1b1PP3/2N5/PPP2PPP/R1BQKB1R b KQkq -" : [22,[21, 36, null], "book"],
  "r1b1k2r/ppppqppp/2n2n2/4N3/1b1PP3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [38,[59, 43, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/8/3pP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq -" : [2,[45, 35, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/3N4/3pP3/5N2/PPP2PPP/R1BQKB1R b KQkq -" : [-32,[18, 33, null], "book"],
  "r1bqkb1r/pppp1ppp/2n5/8/3Nn3/2N5/PPP2PPP/R1BQKB1R w KQkq -" : [51,[42, 36, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4N3/4P3/2N5/PPPP1PPP/R1BQKB1R b KQkq -" : [-133,[18, 28, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq -" : [-246,[18, 28, null], "book"],
  "r1bqkbnr/pppp1ppp/8/4n3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq -" : [-264,[57, 42, null], "book"],
  "r1bqkbnr/pppp1ppp/8/4n3/3PP3/8/PPP2PPP/RNBQKB1R b KQkq -" : [-275,[28, 22, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [61,[45, 28, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [-49,[21, 36, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [-50,[45, 28, null], "book"],
  "rnbqkb1r/ppp2ppp/8/3pp3/2B1n3/2N2N2/PPPP1PPP/R1BQK2R w KQkq -" : [39,[34, 27, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [44,[21, 36, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3pp3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [56,[36, 27, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [75,[36, 28, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4P3/3p4/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [68,[21, 36, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4P3/3pn3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [54,[59, 35, null], "book"],
  "rnbqkb1r/pppp1ppp/8/1B2P3/3pn3/5N2/PPP2PPP/RNBQK2R b KQkq -" : [-5,[1, 18, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4P3/3Qn3/5N2/PPP2PPP/RNB1KB1R b KQkq -" : [59,[11, 27, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4p3/3Pn3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [45,[45, 28, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4p3/3Pn3/3B1N2/PPP2PPP/RNBQK2R b KQkq -" : [35,[1, 18, null], "book"],
  "rnbqkb1r/ppp2ppp/8/3pp3/3Pn3/3B1N2/PPP2PPP/RNBQK2R w KQkq -" : [37,[45, 28, null], "book"],
  "rnbqkb1r/ppp2ppp/8/3pN3/3Pn3/3B4/PPP2PPP/RNBQK2R b KQkq -" : [41,[1, 11, null], "book"],
  "rnbqk2r/ppp2ppp/3b4/3pN3/3Pn3/3B4/PPP2PPP/RNBQK2R w KQkq -" : [42,[57, 42, null], "book"],
  "rnbqk2r/ppp2ppp/3b4/3pN3/3Pn3/3B4/PPP2PPP/RNBQ1RK1 b kq -" : [24,[4, 6, null], "book"],
  "rnbq1rk1/ppp2ppp/3b4/3pN3/3Pn3/3B4/PPP2PPP/RNBQ1RK1 w - -" : [59,[50, 34, null], "book"],
  "rnbq1rk1/ppp2ppp/3b4/3pN3/2PPn3/3B4/PP3PPP/RNBQ1RK1 b - -" : [40,[10, 26, null], "book"],
  "rnbq1rk1/ppp2ppp/8/3pb3/2PPn3/3B4/PP3PPP/RNBQ1RK1 w - -" : [66,[35, 28, null], "book"],
  "r1bqkb1r/pppp1ppp/2n5/4p3/3Pn3/3B1N2/PPP2PPP/RNBQK2R w KQkq -" : [31,[60, 62, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq -" : [15,[1, 18, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq -" : [57,[11, 19, null], "book"],
  "rnbqkb1r/ppp2ppp/3p1n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq -" : [59,[28, 45, null], "book"],
  "rnbqkb1r/ppp2ppp/3p1n2/4N3/3PP3/8/PPP2PPP/RNBQKB1R b KQkq -" : [-415,[19, 28, null], "book"],
  "rnbqkb1r/ppp2ppp/3p1n2/8/2N1P3/8/PPPP1PPP/RNBQKB1R b KQkq -" : [12,[21, 36, null], "book"],
  "rnbqkb1r/ppp2ppp/3p1n2/8/4P3/3N4/PPPP1PPP/RNBQKB1R b KQkq -" : [19,[21, 36, null], "book"],
  "rnbqkb1r/ppp2ppp/3p1n2/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -" : [48,[21, 36, null], "book"],
  "rnbqkb1r/ppp2ppp/3p4/8/4n3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [50,[51, 35, null], "book"],
  "rnbqkb1r/ppp2ppp/3p4/8/4n3/3B1N2/PPPP1PPP/RNBQK2R b KQkq -" : [27,[36, 21, null], "book"],
  "rnbqkb1r/ppp2ppp/3p4/8/2P1n3/5N2/PP1P1PPP/RNBQKB1R b KQkq -" : [15,[5, 12, null], "book"],
  "rnbqkb1r/ppp2ppp/3p4/8/4n3/3P1N2/PPP2PPP/RNBQKB1R b KQkq -" : [22,[36, 21, null], "book"],
  "rnbqkb1r/ppp2ppp/3p4/8/3Pn3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [55,[19, 27, null], "book"],
  "rnbqkb1r/ppp2ppp/8/3p4/3Pn3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [52,[61, 43, null], "book"],
  "rnbqkb1r/ppp2ppp/8/3p4/3Pn3/3B1N2/PPP2PPP/RNBQK2R b KQkq -" : [46,[5, 19, null], "book"],
  "rnbqk2r/ppp2ppp/3b4/3p4/3Pn3/3B1N2/PPP2PPP/RNBQK2R w KQkq -" : [53,[60, 62, null], "book"],
  "rnbqk2r/ppp2ppp/3b4/3p4/3Pn3/3B1N2/PPP2PPP/RNBQ1RK1 b kq -" : [52,[4, 6, null], "book"],
  "rnbq1rk1/ppp2ppp/3b4/3p4/3Pn3/3B1N2/PPP2PPP/RNBQ1RK1 w - -" : [52,[50, 34, null], "book"],
  "rnbq1rk1/ppp2ppp/3b4/3p4/2PPn3/3B1N2/PP3PPP/RNBQ1RK1 b - -" : [56,[10, 18, null], "book"],
  "rn1q1rk1/ppp2ppp/3b4/3p4/2PPn1b1/3B1N2/PP3PPP/RNBQ1RK1 w - -" : [109,[34, 27, null], "book"],
  "rnbq1rk1/pp3ppp/2pb4/3p4/2PPn3/3B1N2/PP3PPP/RNBQ1RK1 w - -" : [44,[61, 60, null], "book"],
  "rnbqk2r/ppp1bppp/8/3p4/3Pn3/3B1N2/PPP2PPP/RNBQK2R w KQkq -" : [49,[60, 62, null], "book"],
  "rnbqk2r/ppp1bppp/8/3p4/3Pn3/3B1N2/PPP2PPP/RNBQ1RK1 b kq -" : [60,[2, 29, null], "book"],
  "r1bqk2r/ppp1bppp/2n5/3p4/3Pn3/3B1N2/PPP2PPP/RNBQ1RK1 w kq -" : [56,[50, 34, null], "book"],
  "r1bqk2r/ppp1bppp/2n5/3p4/2PPn3/3B1N2/PP3PPP/RNBQ1RK1 b kq -" : [41,[18, 33, null], "book"],
  "r1bqk2r/ppp1bppp/8/3p4/1nPPn3/3B1N2/PP3PPP/RNBQ1RK1 w kq -" : [55,[34, 27, null], "book"],
  "r1bqk2r/ppp1bppp/8/3P4/1n1Pn3/3B1N2/PP3PPP/RNBQ1RK1 b kq -" : [22,[33, 43, null], "book"],
  "r1bqk2r/ppp1bppp/2n5/3p4/3Pn3/3B1N2/PPP2PPP/RNBQR1K1 b kq -" : [39,[2, 38, null], "book"],
  "r2qk2r/ppp1bppp/2n5/3p4/3Pn1b1/3B1N2/PPP2PPP/RNBQR1K1 w kq -" : [27,[50, 42, null], "book"],
  "r2qk2r/ppp1bppp/2n5/3p4/3Pn1b1/2PB1N2/PP3PPP/RNBQR1K1 b kq -" : [24,[13, 29, null], "book"],
  "r2qk2r/ppp1b1pp/2n5/3p1p2/3Pn1b1/2PB1N2/PP3PPP/RNBQR1K1 w kq -" : [23,[57, 51, null], "book"],
  "r2qk2r/ppp1b1pp/2n5/3p1p2/3Pn1b1/2PB1N2/PP1N1PPP/R1BQR1K1 b kq -" : [16,[4, 6, null], "book"],
  "rnbq1rk1/ppp1bppp/8/3p4/3Pn3/3B1N2/PPP2PPP/RNBQ1RK1 w - -" : [60,[50, 34, null], "book"],
  "r1bqkb1r/ppp2ppp/2n5/3p4/3Pn3/3B1N2/PPP2PPP/RNBQK2R w KQkq -" : [55,[60, 62, null], "book"],
  "rnbqkb1r/ppp2ppp/3p4/8/4n3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq -" : [11,[36, 42, null], "book"],
  "rnbqkb1r/ppp2ppp/3p4/8/4n3/5N2/PPPPQPPP/RNB1KB1R b KQkq -" : [11,[3, 12, null], "book"],
  "rnbqkb1r/ppp2Npp/3p1n2/8/4P3/8/PPPP1PPP/RNBQKB1R b KQkq -" : [-89,[4, 13, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq -" : [159,[28, 18, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4N3/4n3/8/PPPP1PPP/RNBQKB1R w KQkq -" : [72,[59, 52, null], "book"],
  "rnbqkb1r/pppp1ppp/8/4N3/4n3/8/PPPPQPPP/RNB1KB1R b KQkq -" : [67,[3, 12, null], "book"],
  "rnb1kb1r/ppppqppp/8/4N3/4n3/8/PPPPQPPP/RNB1KB1R w KQkq -" : [62,[52, 36, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPPQPPP/RNB1KB1R b KQkq -" : [-33,[5, 26, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/5N2/PPPPQPPP/RNB1KB1R w KQkq -" : [-34,[54, 46, null], "book"],
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/5N2/PPP1QPPP/RNB1KB1R b KQkq -" : [-35,[18, 35, null], "book"],
  "rnb1kbnr/ppppqppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [92,[51, 35, null], "book"],
  "rnb1kbnr/ppppqppp/8/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [88,[11, 19, null], "book"],
  "rnb1kbnr/ppppq1pp/8/4pp2/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [180,[51, 35, null], "book"],
  "rnb1kbnr/pppp1ppp/5q2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [118,[57, 42, null], "book"],
  "rnb1kbnr/pppp1ppp/5q2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq -" : [96,[11, 19, null], "book"],
  "rnb1kbnr/pppp1ppp/6q1/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -" : [141,[51, 35, null], "book"],
  "rnb1kbnr/pppp1ppp/6q1/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq -" : [117,[11, 19, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/5Q2/PPPP1PPP/RNB1KBNR b KQkq -" : [-33,[6, 21, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq -" : [-23,[1, 18, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR w KQkq -" : [-9,[61, 34, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq -" : [-27,[14, 22, null], "book"],
  "r1bqkb1r/pppp1ppp/2n4n/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq -" : [24,[48, 32, null], "book"],
  "r1bqkb1r/pppp1ppp/2n4n/4p2Q/2B1P3/3P4/PPP2PPP/RNB1K1NR b KQkq -" : [9,[14, 22, null], "book"],
  "r1bqkb1r/pppp1p1p/2n3pn/4p2Q/2B1P3/3P4/PPP2PPP/RNB1K1NR w KQkq -" : [24,[31, 30, null], "book"],
  "r1bqkb1r/pppp1p1p/2n3pn/4p3/2B1P3/3P1Q2/PPP2PPP/RNB1K1NR b KQkq -" : [-27,[18, 35, null], "book"],
  "r1bqkb1r/pppp3p/2n2ppn/4p3/2B1P3/3P1Q2/PPP2PPP/RNB1K1NR w KQkq -" : [61,[62, 52, null], "book"],
  "r1bqkb1r/pppp3p/2n2ppn/4p3/2B1P3/3P1Q2/PPP1NPPP/RNB1K2R b KQkq -" : [36,[18, 24, null], "book"],
  "r1bqkb1r/ppp4p/2n2ppn/3pp3/2B1P3/3P1Q2/PPP1NPPP/RNB1K2R w KQkq -" : [147,[34, 27, null], "book"],
  "rnbqkb1r/pppp1ppp/5n2/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR w KQkq -" : [2,[31, 28, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [37,[51, 35, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/8/4P3/1P6/P1PP1PPP/RNBQKBNR b KQkq -" : [-14,[11, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/4P3/1P6/P1PP1PPP/RNBQKBNR w KQkq -" : [-18,[58, 49, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/4P3/1P6/PBPP1PPP/RN1QKBNR b KQkq -" : [-9,[1, 18, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/8/1P2P3/8/P1PP1PPP/RNBQKBNR b KQkq -" : [-95,[5, 33, null], "book"],
  "rnbqk1nr/pppp1ppp/4p3/8/1b2P3/8/P1PP1PPP/RNBQKBNR w KQkq -" : [-94,[58, 49, null], "book"],
  "rnbqk1nr/pppp1ppp/4p3/4P3/1b6/8/P1PP1PPP/RNBQKBNR b KQkq -" : [-126,[1, 18, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/1B6/4P3/8/PPPP1PPP/RNBQK1NR b KQkq -" : [-25,[8, 16, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/8/2P1P3/8/PP1P1PPP/RNBQKBNR b KQkq -" : [-14,[11, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/2P1P3/8/PP1P1PPP/RNBQKBNR w KQkq -" : [-9,[34, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3P4/4P3/8/PP1P1PPP/RNBQKBNR b KQkq -" : [0,[20, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3p4/4P3/8/PP1P1PPP/RNBQKBNR w KQkq -" : [-8,[36, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3p4/4P3/1Q6/PP1P1PPP/RNB1KBNR b KQkq -" : [-90,[27, 36, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/8/4P3/3P4/PPP2PPP/RNBQKBNR b KQkq -" : [-5,[11, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/4P3/3P4/PPP2PPP/RNBQKBNR w KQkq -" : [4,[62, 45, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/4P3/3P4/PPPN1PPP/R1BQKBNR b KQkq -" : [-1,[10, 26, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/4P3/3P4/PPPN1PPP/R1BQKBNR w KQkq -" : [-2,[36, 28, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/4P3/3P1N2/PPPN1PPP/R1BQKB1R b KQkq -" : [0,[10, 26, null], "book"],
  "r1bqkb1r/ppp2ppp/2n1pn2/3p4/4P3/3P1N2/PPPN1PPP/R1BQKB1R w KQkq -" : [21,[61, 52, null], "book"],
  "r1bqkb1r/ppp2ppp/2n1pn2/3p4/4P3/3P1N2/PPPNBPPP/R1BQK2R b KQkq -" : [0,[5, 19, null], "book"],
  "rnbqkbnr/pppp2pp/4p3/5p2/4P3/3P4/PPP2PPP/RNBQKBNR w KQkq -" : [79,[62, 45, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -" : [41,[11, 27, null], "book"],
  "rnbqkbnr/p1pp1ppp/4p3/1p6/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [175,[61, 25, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [34,[57, 42, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/3B4/PPP2PPP/RNBQK1NR b KQkq -" : [-11,[27, 36, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/4B3/PPP2PPP/RN1QKBNR b KQkq -" : [-46,[27, 36, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/8/3Pp3/4B3/PPP2PPP/RN1QKBNR w KQkq -" : [-49,[57, 51, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/8/3Pp3/4BP2/PPP3PP/RN1QKBNR b KQkq -" : [-72,[6, 23, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/2PPP3/8/PP3PPP/RNBQKBNR b KQkq -" : [-83,[27, 36, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq -" : [41,[10, 26, null], "book"],
  "rn1qkbnr/pppb1ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq -" : [44,[50, 42, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/2ppP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq -" : [40,[50, 42, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/2ppP3/1P1P4/8/P1P2PPP/RNBQKBNR b KQkq -" : [-94,[26, 35, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/2ppP3/3P4/2P5/PP3PPP/RNBQKBNR b KQkq -" : [42,[2, 11, null], "book"],
  "r1bqkbnr/pp3ppp/2n1p3/2ppP3/3P4/2P5/PP3PPP/RNBQKBNR w KQkq -" : [35,[62, 45, null], "book"],
  "r1bqkbnr/pp3ppp/2n1p3/2ppP3/3P4/2P2N2/PP3PPP/RNBQKB1R b KQkq -" : [44,[2, 11, null], "book"],
  "r2qkbnr/pp1b1ppp/2n1p3/2ppP3/3P4/2P2N2/PP3PPP/RNBQKB1R w KQkq -" : [40,[61, 52, null], "book"],
  "r1b1kbnr/pp3ppp/1qn1p3/2ppP3/3P4/2P2N2/PP3PPP/RNBQKB1R w KQkq -" : [43,[48, 40, null], "book"],
  "r1b1kbnr/pp3ppp/1qn1p3/2ppP3/3P4/P1P2N2/1P3PPP/RNBQKB1R b KQkq -" : [26,[26, 34, null], "book"],
  "r1b1kb1r/pp3ppp/1qn1p2n/2ppP3/3P4/P1P2N2/1P3PPP/RNBQKB1R w KQkq -" : [58,[61, 43, null], "book"],
  "r1b1kbnr/pp3ppp/1qn1p3/2ppP3/3P4/2PB1N2/PP3PPP/RNBQK2R b KQkq -" : [26,[26, 35, null], "book"],
  "rnb1kbnr/pp3ppp/1q2p3/2ppP3/3P4/2P5/PP3PPP/RNBQKBNR w KQkq -" : [57,[62, 45, null], "book"],
  "rnb1kbnr/pp3ppp/1q2p3/2ppP3/3P4/2P2N2/PP3PPP/RNBQKB1R b KQkq -" : [44,[1, 18, null], "book"],
  "rn2kbnr/pp1b1ppp/1q2p3/2ppP3/3P4/2P2N2/PP3PPP/RNBQKB1R w KQkq -" : [42,[48, 40, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/2ppP3/3P4/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [0,[26, 35, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/3pP3/3p4/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [4,[45, 35, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/3pP3/3p4/3B1N2/PPP2PPP/RNBQK2R b KQkq -" : [-13,[1, 18, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/2ppP3/3P2Q1/8/PPP2PPP/RNB1KBNR b KQkq -" : [-68,[26, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq -" : [23,[20, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3p4/3P4/8/PPP2PPP/RNBQKBNR w KQkq -" : [19,[62, 45, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3p4/2PP4/8/PP3PPP/RNBQKBNR b KQkq -" : [4,[5, 33, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3p4/3P4/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [8,[6, 21, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3p4/3P4/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [9,[62, 45, null], "book"],
  "rnbqkb1r/ppp2ppp/5n2/3p2B1/3P4/2N5/PPP2PPP/R2QKBNR b KQkq -" : [-3,[5, 12, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [37,[6, 21, null], "book"],
  "rnbqk1nr/ppp2ppp/4p3/3p4/1b1PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [55,[36, 28, null], "book"],
  "rnbqk1nr/ppp2ppp/4p3/3p4/1b1PP3/P1N5/1PP2PPP/R1BQKBNR b KQkq -" : [4,[33, 42, null], "book"],
  "rnbqk1nr/ppp2ppp/4p3/3p4/1b1PP3/2N5/PPPB1PPP/R2QKBNR b KQkq -" : [18,[27, 36, null], "book"],
  "rnbqk1nr/ppp2ppp/4p3/8/1b1Pp3/2N5/PPPB1PPP/R2QKBNR w KQkq -" : [0,[59, 38, null], "book"],
  "rnbqk1nr/ppp2ppp/4p3/8/1b1Pp1Q1/2N5/PPPB1PPP/R3KBNR b KQkq -" : [0,[6, 21, null], "book"],
  "rnb1k1nr/ppp2ppp/4p3/8/1b1qp1Q1/2N5/PPPB1PPP/R3KBNR w KQkq -" : [36,[62, 45, null], "book"],
  "rnbqk2r/ppp1nppp/4p3/3p4/1b1PP3/2N5/PPPB1PPP/R2QKBNR w KQkq -" : [48,[61, 43, null], "book"],
  "rnbqk2r/ppp1nppp/4p3/3p4/1b1PP3/8/PPPB1PPP/RN1QKBNR b KQkq -" : [-3,[33, 51, null], "book"],
  "rnbqk1nr/ppp2ppp/4p3/3p4/1b1PP3/2NB4/PPP2PPP/R1BQK1NR b KQkq -" : [7,[27, 36, null], "book"],
  "rnbqk1nr/pp3ppp/4p3/2pp4/1b1PP3/2NB4/PPP2PPP/R1BQK1NR w KQkq -" : [8,[36, 27, null], "book"],
  "rnbqk1nr/pp3ppp/4p3/2pP4/1b1P4/2NB4/PPP2PPP/R1BQK1NR b KQkq -" : [3,[3, 27, null], "book"],
  "rnb1k1nr/pp3ppp/4p3/2pq4/1b1P4/2NB4/PPP2PPP/R1BQK1NR w KQkq -" : [20,[58, 51, null], "book"],
  "rnb1k1nr/pp3ppp/4p3/2pq4/1b1P4/2NB4/PPPB1PPP/R2QK1NR b KQkq -" : [2,[33, 42, null], "book"],
  "rnbqk1nr/ppp2ppp/4p3/3pP3/1b1P4/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [45,[6, 12, null], "book"],
  "rnbqk1nr/pp3ppp/4p3/2ppP3/1b1P4/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [52,[48, 40, null], "book"],
  "rnbqk1nr/pp3ppp/4p3/2ppP3/1b1P4/P1N5/1PP2PPP/R1BQKBNR b KQkq -" : [68,[33, 42, null], "book"],
  "rnbqk1nr/pp3ppp/4p3/b1ppP3/3P4/P1N5/1PP2PPP/R1BQKBNR w KQkq -" : [91,[49, 33, null], "book"],
  "rnbqk1nr/pp3ppp/4p3/b1ppP3/1P1P4/P1N5/2P2PPP/R1BQKBNR b KQkq -" : [58,[26, 35, null], "book"],
  "rnbqk1nr/pp3ppp/4p3/b2pP3/1P1p4/P1N5/2P2PPP/R1BQKBNR w KQkq -" : [59,[59, 38, null], "book"],
  "rnbqk1nr/pp3ppp/4p3/2ppP3/3P4/P1b5/1PP2PPP/R1BQKBNR w KQkq -" : [57,[49, 42, null], "book"],
  "rnbqk1nr/pp3ppp/4p3/2ppP3/3P4/P1P5/2P2PPP/R1BQKBNR b KQkq -" : [54,[6, 12, null], "book"],
  "rnbqk2r/pp2nppp/4p3/2ppP3/3P4/P1P5/2P2PPP/R1BQKBNR w KQkq -" : [58,[59, 38, null], "book"],
  "rnbqk2r/pp2nppp/4p3/2ppP3/3P2Q1/P1P5/2P2PPP/R1B1KBNR b KQkq -" : [62,[4, 6, null], "book"],
  "rnbqk1nr/pp3ppp/4p3/3pP3/1b1p4/P1N5/1PP2PPP/R1BQKBNR w KQkq -" : [117,[40, 33, null], "book"],
  "rnbqk1nr/pp3ppp/4p3/3pP3/1P1p4/2N5/1PP2PPP/R1BQKBNR b KQkq -" : [97,[35, 42, null], "book"],
  "rnbqk1nr/pp3ppp/4p3/3pP3/1P6/2p5/1PP2PPP/R1BQKBNR w KQkq -" : [95,[59, 38, null], "book"],
  "rnbqk1nr/pp3ppp/4p3/2ppP3/1b1P4/2N5/PPPB1PPP/R2QKBNR b KQkq -" : [37,[6, 12, null], "book"],
  "rnbqk2r/pp2nppp/4p3/2ppP3/1b1P4/2N5/PPPB1PPP/R2QKBNR w KQkq -" : [34,[48, 40, null], "book"],
  "rnbqk2r/pp2nppp/4p3/2ppP3/1b1P1P2/2N5/PPPB2PP/R2QKBNR b KQkq -" : [-38,[26, 35, null], "book"],
  "rnbqk1nr/pp3ppp/4p3/2ppP3/1b1P2Q1/2N5/PPP2PPP/R1B1KBNR b KQkq -" : [8,[6, 12, null], "book"],
  "rnb1k1nr/pppq1ppp/4p3/3pP3/1b1P4/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [97,[55, 39, null], "book"],
  "rnbqk1nr/ppp2ppp/4p3/3P4/1b1P4/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [21,[20, 27, null], "book"],
  "rnbqk1nr/ppp2ppp/8/3p4/1b1P4/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [14,[61, 43, null], "book"],
  "rnbqk1nr/ppp2ppp/8/3p4/1b1P4/2NB4/PPP2PPP/R1BQK1NR b KQkq -" : [22,[6, 21, null], "book"],
  "rnbqk2r/ppp1nppp/8/3p4/1b1P4/2NB4/PPP2PPP/R1BQK1NR w KQkq -" : [34,[62, 45, null], "book"],
  "rnbqk2r/ppp1nppp/8/3p3Q/1b1P4/2NB4/PPP2PPP/R1B1K1NR b KQkq -" : [58,[14, 22, null], "book"],
  "rnbqk1nr/ppp2ppp/4p3/3p4/1b1PP3/2N5/PPP1NPPP/R1BQKB1R b KQkq -" : [25,[27, 36, null], "book"],
  "rnbqk1nr/ppp2ppp/4p3/8/1b1Pp3/2N5/PPP1NPPP/R1BQKB1R w KQkq -" : [24,[48, 40, null], "book"],
  "rnbqk1nr/ppp2ppp/4p3/8/1b1Pp3/P1N5/1PP1NPPP/R1BQKB1R b KQkq -" : [16,[33, 42, null], "book"],
  "rnbqk1nr/ppp2ppp/4p3/8/3Pp3/P1b5/1PP1NPPP/R1BQKB1R w KQkq -" : [18,[52, 42, null], "book"],
  "rnbqk1nr/ppp2ppp/4p3/8/3Pp3/P1N5/1PP2PPP/R1BQKB1R b KQkq -" : [10,[1, 18, null], "book"],
  "r1bqk1nr/ppp2ppp/2n1p3/8/3Pp3/P1N5/1PP2PPP/R1BQKB1R w KQkq -" : [23,[35, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/8/3PN3/8/PPP2PPP/R1BQKBNR b KQkq -" : [44,[1, 11, null], "book"],
  "rnbqkbnr/ppp2ppp/8/4p3/3PN3/8/PPP2PPP/R1BQKBNR w KQkq -" : [139,[62, 45, null], "book"],
  "r1bqkbnr/pppn1ppp/4p3/8/3PN3/8/PPP2PPP/R1BQKBNR w KQkq -" : [50,[62, 45, null], "book"],
  "r1bqkbnr/pppn1ppp/4p3/8/3PN3/5N2/PPP2PPP/R1BQKB1R b KQkq -" : [54,[6, 21, null], "book"],
  "r1bqkb1r/pppn1ppp/4pn2/8/3PN3/5N2/PPP2PPP/R1BQKB1R w KQkq -" : [48,[36, 21, null], "book"],
  "r1bqkb1r/pppn1ppp/4pN2/8/3P4/5N2/PPP2PPP/R1BQKB1R b KQkq -" : [48,[11, 21, null], "book"],
  "r1bqkb1r/ppp2ppp/4pn2/8/3P4/5N2/PPP2PPP/R1BQKB1R w KQkq -" : [46,[50, 42, null], "book"],
  "r1bqkb1r/ppp2ppp/4pn2/4N3/3P4/8/PPP2PPP/R1BQKB1R b KQkq -" : [39,[21, 11, null], "book"],
  "rnb1kbnr/ppp2ppp/4p3/3q4/3PN3/8/PPP2PPP/R1BQKBNR w KQkq -" : [103,[61, 43, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [38,[36, 28, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/3PP3/2NB4/PPP2PPP/R1BQK1NR b KQkq -" : [-14,[10, 26, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/3PP3/2N1B3/PPP2PPP/R2QKBNR b KQkq -" : [-73,[27, 36, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p2B1/3PP3/2N5/PPP2PPP/R2QKBNR b KQkq -" : [33,[27, 36, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/3p2B1/1b1PP3/2N5/PPP2PPP/R2QKBNR w KQkq -" : [54,[36, 28, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/3pP1B1/1b1P4/2N5/PPP2PPP/R2QKBNR b KQkq -" : [53,[15, 23, null], "book"],
  "rnbqk2r/ppp2pp1/4pn1p/3pP1B1/1b1P4/2N5/PPP2PPP/R2QKBNR w KQkq -" : [58,[30, 51, null], "book"],
  "rnbqk2r/ppp2pp1/4pn1p/3pP3/1b1P4/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [44,[21, 36, null], "book"],
  "rnbqk2r/ppp2pp1/4pn1p/3pP3/1b1P4/2N5/PPPB1PPP/R2QKBNR b KQkq -" : [52,[33, 42, null], "book"],
  "rnbqk2r/ppp2pp1/4pn1p/3pP3/3P4/2b5/PPPB1PPP/R2QKBNR w KQkq -" : [67,[49, 42, null], "book"],
  "rnbqk2r/ppp2pp1/4pn1p/3pP3/3P4/2P5/P1PB1PPP/R2QKBNR b KQkq -" : [73,[21, 36, null], "book"],
  "rnbqk2r/ppp2pp1/4p2p/3pP3/3Pn3/2P5/P1PB1PPP/R2QKBNR w KQkq -" : [62,[59, 38, null], "book"],
  "rnbqk2r/ppp2pp1/4p2p/3pP3/3Pn1Q1/2P5/P1PB1PPP/R3KBNR b KQkq -" : [60,[14, 22, null], "book"],
  "rnbq1k1r/ppp2pp1/4p2p/3pP3/3Pn1Q1/2P5/P1PB1PPP/R3KBNR w KQ -" : [60,[55, 39, null], "book"],
  "rnbq1k1r/ppp2pp1/4p2p/3pP3/3Pn1Q1/2P5/P1P2PPP/R1B1KBNR b KQ -" : [29,[10, 26, null], "book"],
  "rnbqk2r/pppn1pp1/4p2p/3pP3/1b1P4/2N5/PPPB1PPP/R2QKBNR w KQkq -" : [95,[61, 43, null], "book"],
  "rnbqk2r/ppp2pp1/4pn1p/3pP3/1b1P4/2N1B3/PPP2PPP/R2QKBNR b KQkq -" : [32,[21, 36, null], "book"],
  "rnbqk2r/ppp2pp1/4pn1p/3pP3/1b1P3B/2N5/PPP2PPP/R2QKBNR b KQkq -" : [13,[14, 30, null], "book"],
  "rnbqk2r/ppp2pp1/4pP1p/3p2B1/1b1P4/2N5/PPP2PPP/R2QKBNR b KQkq -" : [42,[23, 30, null], "book"],
  "rnbqk2r/ppp2pp1/4pP2/3p2p1/1b1P4/2N5/PPP2PPP/R2QKBNR w KQkq -" : [32,[21, 14, null], "book"],
  "rnbqk2r/ppp2pP1/4p3/3p2p1/1b1P4/2N5/PPP2PPP/R2QKBNR b KQkq -" : [40,[7, 6, null], "book"],
  "rnbqk1r1/ppp2pP1/4p3/3p2p1/1b1P4/2N5/PPP2PPP/R2QKBNR w KQq -" : [54,[48, 40, null], "book"],
  "rnbqk1r1/ppp2pP1/4p3/3p2p1/1b1P3P/2N5/PPP2PP1/R2QKBNR b KQq -" : [31,[30, 39, null], "book"],
  "rnbqk1r1/ppp2pP1/4p3/3p4/1b1P3p/2N5/PPP2PP1/R2QKBNR w KQq -" : [37,[48, 40, null], "book"],
  "rnbqk1r1/ppp2pP1/4p3/3p4/1b1P2Qp/2N5/PPP2PP1/R3KBNR b KQq -" : [15,[3, 21, null], "book"],
  "rnbqk2r/ppp2ppp/4pn2/3p2B1/1b1PP3/2N5/PPP1NPPP/R2QKB1R b KQkq -" : [-4,[27, 36, null], "book"],
  "rnbqk2r/ppp1bppp/4pn2/3p2B1/3PP3/2N5/PPP2PPP/R2QKBNR w KQkq -" : [50,[36, 28, null], "book"],
  "rnbqk2r/ppp1bppp/4pB2/3p4/3PP3/2N5/PPP2PPP/R2QKBNR b KQkq -" : [-22,[12, 21, null], "book"],
  "rnbqk2r/ppp1bppp/4pn2/3pP1B1/3P4/2N5/PPP2PPP/R2QKBNR b KQkq -" : [49,[21, 11, null], "book"],
  "rnbqk2r/ppp1bppp/4p3/3pP1B1/3Pn3/2N5/PPP2PPP/R2QKBNR w KQkq -" : [63,[42, 36, null], "book"],
  "rnbqk2r/pppnbppp/4p3/3pP1B1/3P4/2N5/PPP2PPP/R2QKBNR w KQkq -" : [61,[55, 39, null], "book"],
  "rnbqk2r/pppnBppp/4p3/3pP3/3P4/2N5/PPP2PPP/R2QKBNR b KQkq -" : [45,[3, 12, null], "book"],
  "rnb1k2r/pppnqppp/4p3/3pP3/3P4/2N5/PPP2PPP/R2QKBNR w KQkq -" : [63,[53, 37, null], "book"],
  "rnb1k2r/pppnqppp/4p3/3pP3/3P4/2NB4/PPP2PPP/R2QK1NR b KQkq -" : [23,[12, 33, null], "book"],
  "rnb1k2r/pppnqppp/4p3/3pP3/3P1P2/2N5/PPP3PP/R2QKBNR b KQkq -" : [37,[4, 6, null], "book"],
  "rnb1k2r/pppnqppp/4p3/1N1pP3/3P4/8/PPP2PPP/R2QKBNR b KQkq -" : [37,[11, 17, null], "book"],
  "rnb1k2r/pppnqppp/4p3/3pP3/3P4/2N5/PPPQ1PPP/R3KBNR b KQkq -" : [38,[8, 16, null], "book"],
  "rnb1k2r/pppnqppp/4p3/3pP3/3P2Q1/2N5/PPP2PPP/R3KBNR b KQkq -" : [-2,[4, 6, null], "book"],
  "rnbqk2r/pppnbppp/4p3/3pP1B1/3P3P/2N5/PPP2PP1/R2QKBNR b KQkq -" : [67,[12, 30, null], "book"],
  "rnbqk2r/1ppnbppp/p3p3/3pP1B1/3P3P/2N5/PPP2PP1/R2QKBNR w KQkq -" : [106,[59, 38, null], "book"],
  "rnbqk2r/pppn1ppp/4p3/3pP1b1/3P3P/2N5/PPP2PP1/R2QKBNR w KQkq -" : [51,[39, 30, null], "book"],
  "rnbqk2r/pppn1ppp/4p3/3pP1P1/3P4/2N5/PPP2PP1/R2QKBNR b KQkq -" : [56,[3, 30, null], "book"],
  "rnb1k2r/pppn1ppp/4p3/3pP1q1/3P4/2N5/PPP2PP1/R2QKBNR w KQkq -" : [71,[62, 47, null], "book"],
  "rnbqk2r/pp1nbppp/4p3/2ppP1B1/3P3P/2N5/PPP2PP1/R2QKBNR w KQkq -" : [74,[30, 12, null], "book"],
  "rnbqk2r/pppnb1pp/4pp2/3pP1B1/3P3P/2N5/PPP2PP1/R2QKBNR w KQkq -" : [115,[59, 31, null], "book"],
  "rnbq1rk1/pppnbppp/4p3/3pP1B1/3P3P/2N5/PPP2PP1/R2QKBNR w KQ -" : [107,[59, 38, null], "book"],
  "rnbqk1nr/ppp1bppp/4p3/3pP1B1/3P4/2N5/PPP2PPP/R2QKBNR w KQkq -" : [94,[30, 44, null], "book"],
  "rnbqk1nr/ppp1bppp/4p3/3pP3/3P4/2N1B3/PPP2PPP/R2QKBNR b KQkq -" : [92,[15, 31, null], "book"],
  "rnbqk1nr/p1p1bppp/1p2p3/3pP3/3P4/2N1B3/PPP2PPP/R2QKBNR w KQkq -" : [95,[42, 52, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/6B1/3Pp3/2N5/PPP2PPP/R2QKBNR w KQkq -" : [45,[42, 36, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3pP3/3P4/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [25,[21, 11, null], "book"],
  "rnbqkb1r/pppn1ppp/4p3/3pP3/3P4/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [43,[53, 37, null], "book"],
  "rnbqkb1r/pppn1ppp/4p3/3pP3/3P1P2/2N5/PPP3PP/R1BQKBNR b KQkq -" : [40,[10, 26, null], "book"],
  "rnbqkb1r/pp1n1ppp/4p3/2ppP3/3P1P2/2N5/PPP3PP/R1BQKBNR w KQkq -" : [47,[62, 45, null], "book"],
  "rnbqkb1r/pp1n1ppp/4p3/2PpP3/5P2/2N5/PPP3PP/R1BQKBNR b KQkq -" : [-3,[1, 18, null], "book"],
  "rnbqk2r/pp1n1ppp/4p3/2bpP3/5P2/2N5/PPP3PP/R1BQKBNR w KQkq -" : [27,[58, 51, null], "book"],
  "rnbqk2r/pp1n1ppp/4p3/2bpP3/5PQ1/2N5/PPP3PP/R1B1KBNR b KQkq -" : [19,[4, 6, null], "book"],
  "r1bqkb1r/pp1n1ppp/2n1p3/2PpP3/5P2/2N5/PPP3PP/R1BQKBNR w KQkq -" : [8,[58, 51, null], "book"],
  "r1bqkb1r/pp1n1ppp/2n1p3/2PpP3/5P2/P1N5/1PP3PP/R1BQKBNR b KQkq -" : [-20,[5, 26, null], "book"],
  "r1bqk2r/pp1n1ppp/2n1p3/2bpP3/5P2/P1N5/1PP3PP/R1BQKBNR w KQkq -" : [-14,[59, 31, null], "book"],
  "r1bqk2r/pp1n1ppp/2n1p3/2bpP3/5PQ1/P1N5/1PP3PP/R1B1KBNR b KQkq -" : [-33,[4, 6, null], "book"],
  "r1bq1rk1/pp1n1ppp/2n1p3/2bpP3/5PQ1/P1N5/1PP3PP/R1B1KBNR w KQ -" : [-33,[62, 45, null], "book"],
  "r1bq1rk1/pp1n1ppp/2n1p3/2bpP3/5PQ1/P1N2N2/1PP3PP/R1B1KB1R b KQ -" : [-49,[3, 17, null], "book"],
  "r1bq1rk1/pp1n2pp/2n1pp2/2bpP3/5PQ1/P1N2N2/1PP3PP/R1B1KB1R w KQ -" : [70,[38, 20, null], "book"],
  "rnbqkb1r/pp1n1ppp/4p3/2ppP3/3P1P2/2N2N2/PPP3PP/R1BQKB1R b KQkq -" : [41,[1, 18, null], "book"],
  "r1bqkb1r/pp1n1ppp/2n1p3/2ppP3/3P1P2/2N2N2/PPP3PP/R1BQKB1R w KQkq -" : [50,[58, 44, null], "book"],
  "r1bqkb1r/pp1n1ppp/2n1p3/2ppP3/3P1P2/2N1BN2/PPP3PP/R2QKB1R b KQkq -" : [46,[8, 16, null], "book"],
  "rnbqkb1r/pppn1ppp/4p3/3pP3/3P2Q1/2N5/PPP2PPP/R1B1KBNR b KQkq -" : [-11,[10, 26, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3P4/3P4/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [3,[20, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPPN1PPP/R1BQKBNR b KQkq -" : [30,[10, 26, null], "book"],
  "rnbqk1nr/ppp1bppp/4p3/3p4/3PP3/8/PPPN1PPP/R1BQKBNR w KQkq -" : [56,[62, 45, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/2pp4/3PP3/8/PPPN1PPP/R1BQKBNR w KQkq -" : [31,[36, 27, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/2pP4/3P4/8/PPPN1PPP/R1BQKBNR b KQkq -" : [21,[20, 27, null], "book"],
  "rnbqkbnr/pp3ppp/8/2pp4/3P4/8/PPPN1PPP/R1BQKBNR w KQkq -" : [25,[61, 25, null], "book"],
  "rnbqkbnr/pp3ppp/8/2pp4/3P4/5N2/PPPN1PPP/R1BQKB1R b KQkq -" : [19,[6, 21, null], "book"],
  "r1bqkbnr/pp3ppp/2n5/2pp4/3P4/5N2/PPPN1PPP/R1BQKB1R w KQkq -" : [31,[61, 25, null], "book"],
  "rnbqkb1r/pp3ppp/4pn2/2pP4/3P4/8/PPPN1PPP/R1BQKBNR w KQkq -" : [106,[61, 25, null], "book"],
  "rnb1kbnr/pp3ppp/4p3/2pq4/3P4/8/PPPN1PPP/R1BQKBNR w KQkq -" : [35,[62, 45, null], "book"],
  "rnbqkbnr/ppp3pp/4p3/3p1p2/3PP3/8/PPPN1PPP/R1BQKBNR w KQkq -" : [91,[36, 28, null], "book"],
  "r1bqkbnr/ppp2ppp/2n1p3/3p4/3PP3/8/PPPN1PPP/R1BQKBNR w KQkq -" : [102,[62, 45, null], "book"],
  "r1bqkbnr/ppp2ppp/2n1p3/3p4/3PP3/5N2/PPPN1PPP/R1BQKB1R b KQkq -" : [92,[27, 36, null], "book"],
  "r1bqkb1r/ppp2ppp/2n1pn2/3p4/3PP3/5N2/PPPN1PPP/R1BQKB1R w KQkq -" : [72,[36, 28, null], "book"],
  "r1bqkb1r/ppp2ppp/2n1pn2/3pP3/3P4/5N2/PPPN1PPP/R1BQKB1R b KQkq -" : [70,[21, 11, null], "book"],
  "r1bqkb1r/pppn1ppp/2n1p3/3pP3/3P4/5N2/PPPN1PPP/R1BQKB1R w KQkq -" : [62,[51, 41, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3p4/3PP3/8/PPPN1PPP/R1BQKBNR w KQkq -" : [73,[36, 28, null], "book"],
  "rnbqkb1r/ppp2ppp/4pn2/3pP3/3P4/8/PPPN1PPP/R1BQKBNR b KQkq -" : [64,[21, 11, null], "book"],
  "rnbqkb1r/pppn1ppp/4p3/3pP3/3P4/8/PPPN1PPP/R1BQKBNR w KQkq -" : [72,[61, 43, null], "book"],
  "rnbqkb1r/pppn1ppp/4p3/3pP3/3P4/3B4/PPPN1PPP/R1BQK1NR b KQkq -" : [60,[10, 26, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [-72,[27, 36, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/8/3Pp3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [-70,[45, 28, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/4N3/3Pp3/8/PPP2PPP/RNBQKB1R b KQkq -" : [-81,[6, 21, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/7N/PPP2PPP/RNBQKB1R b KQkq -" : [-69,[27, 36, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP1QPPP/RNB1KBNR b KQkq -" : [-3,[27, 36, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/3PP3/8/PPP1QPPP/RNB1KBNR w KQkq -" : [96,[35, 28, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/3PPP2/8/PPP1Q1PP/RNB1KBNR b KQkq -" : [-128,[28, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3p4/3PPp2/8/PPP1Q1PP/RNB1KBNR w KQkq -" : [85,[58, 37, null], "book"],
  "rnbqkbnr/pppp2pp/4p3/5p2/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [143,[36, 29, null], "book"],
  "rnbqkb1r/pppp1ppp/4pn2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [101,[36, 28, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq -" : [-22,[10, 26, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/8/4PP2/8/PPPP2PP/RNBQKBNR b KQkq -" : [-5,[11, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/4PP2/8/PPPP2PP/RNBQKBNR w KQkq -" : [-19,[57, 42, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/4PP2/5N2/PPPP2PP/RNBQKB1R b KQkq -" : [-111,[27, 36, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/8/4pP2/5N2/PPPP2PP/RNBQKB1R w KQkq -" : [-105,[45, 28, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/6N1/4pP2/8/PPPP2PP/RNBQKB1R b KQkq -" : [-136,[13, 29, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/8/4P3/6P1/PPPP1P1P/RNBQKBNR b KQkq -" : [19,[11, 27, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/8/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq -" : [37,[10, 26, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq -" : [35,[51, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/4PP2/2N5/PPPP2PP/R1BQKBNR b KQkq -" : [-4,[27, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq -" : [11,[27, 35, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -" : [16,[11, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3p4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [21,[36, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/4p3/3pP3/8/5N2/PPPP1PPP/RNBQKB1R b KQkq -" : [18,[10, 26, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/2ppP3/8/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [25,[50, 42, null], "book"],
  "rnbqkbnr/pp3ppp/4p3/2ppP3/1P6/5N2/P1PP1PPP/RNBQKB1R b KQkq -" : [-12,[26, 33, null], "book"],
  "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPPQPPP/RNB1KBNR b KQkq -" : [-13,[10, 26, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [141,[36, 29, null], "book"],
  "rnbqkbnr/ppppp1pp/5p2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [121,[51, 35, null], "book"],
  "rnbqkbnr/pppppp1p/8/6p1/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [183,[57, 42, null], "book"],
  "rnbqkbnr/pppppp1p/8/6p1/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -" : [173,[15, 23, null], "book"],
  "rnbqk1nr/ppppppbp/8/6p1/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [185,[57, 42, null], "book"],
  "rnbqkbnr/pppp1p1p/8/4p1p1/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [211,[62, 45, null], "book"],
  "rnbqkbnr/pppppp2/7p/6p1/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [173,[57, 42, null], "book"],
  "rnbqkbnr/pppppp2/7p/6p1/3PP2P/8/PPP2PP1/RNBQKBNR b KQkq -" : [172,[30, 38, null], "book"],
  "rnbqkbnr/pppppp2/7p/8/3PP1pP/8/PPP2PP1/RNBQKBNR w KQkq -" : [183,[57, 42, null], "book"],
  "rnbqkbnr/pppppp1p/6p1/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [67,[51, 35, null], "book"],
  "rnbqkbnr/pppppp1p/6p1/8/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq -" : [34,[10, 26, null], "book"],
  "rnbqk1nr/ppppppbp/6p1/8/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq -" : [57,[51, 35, null], "book"],
  "rnbqk1nr/ppppppbp/6p1/8/2B1P3/5Q2/PPPP1PPP/RNB1K1NR b KQkq -" : [-28,[12, 20, null], "book"],
  "rnbqk1nr/pppp1pbp/4p1p1/8/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq -" : [-19,[62, 52, null], "book"],
  "rnbqk1nr/pppp1pbp/4p1p1/8/2BPP3/5Q2/PPP2PPP/RNB1K1NR b KQkq -" : [-76,[14, 35, null], "book"],
  "rnbqkbnr/pppppp1p/6p1/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -" : [65,[11, 19, null], "book"],
  "rnbqk1nr/ppppppbp/6p1/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [71,[62, 45, null], "book"],
  "rnbqk1nr/ppppppbp/6p1/8/2BPP3/8/PPP2PPP/RNBQK1NR b KQkq -" : [29,[10, 26, null], "book"],
  "rnbqk1nr/p1ppppbp/6p1/1p6/2BPP3/8/PPP2PPP/RNBQK1NR w KQkq -" : [86,[34, 25, null], "book"],
  "rnbqk1nr/ppppppbp/6p1/8/3PP3/8/PPPB1PPP/RN1QKBNR b KQkq -" : [-44,[14, 35, null], "book"],
  "rnbqk1nr/ppppppbp/6p1/8/3PP3/3B4/PPP2PPP/RNBQK1NR b KQkq -" : [-65,[14, 35, null], "book"],
  "rnbqk1nr/pp1pppbp/6p1/2p5/2PPP3/8/PP3PPP/RNBQKBNR w KQkq -" : [83,[35, 27, null], "book"],
  "rnbqk1nr/pp1pppbp/6p1/2p5/2PPP3/5N2/PP3PPP/RNBQKB1R b KQkq -" : [58,[11, 19, null], "book"],
  "rnb1k1nr/pp1pppbp/1q4p1/2p5/2PPP3/5N2/PP3PPP/RNBQKB1R w KQkq -" : [69,[35, 26, null], "book"],
  "rnbqk1nr/ppp1ppbp/6p1/3p4/2PPP3/8/PP3PPP/RNBQKBNR w KQkq -" : [117,[34, 27, null], "book"],
  "rnbqk1nr/ppp1ppbp/6p1/3P4/2PP4/8/PP3PPP/RNBQKBNR b KQkq -" : [40,[10, 18, null], "book"],
  "rnbqk1nr/pp2ppbp/2p3p1/3P4/2PP4/8/PP3PPP/RNBQKBNR w KQkq -" : [65,[57, 42, null], "book"],
  "rnbqk1nr/pp2ppbp/2P3p1/8/2PP4/8/PP3PPP/RNBQKBNR b KQkq -" : [41,[14, 35, null], "book"],
  "rnbqk1nr/pp2pp1p/2P3p1/8/2Pb4/8/PP3PPP/RNBQKBNR w KQkq -" : [40,[18, 9, null], "book"],
  "rnbqk1nr/ppppppbp/6p1/8/3PPP2/8/PPP3PP/RNBQKBNR b KQkq -" : [64,[11, 27, null], "book"],
  "rnbqk1nr/ppppppbp/6p1/8/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [65,[11, 19, null], "book"],
  "rnbqk1nr/pp1pppbp/6p1/2p5/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [78,[35, 26, null], "book"],
  "rnbqk1nr/pp1pppbp/2p3p1/8/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [88,[53, 37, null], "book"],
  "rnbqk1nr/pp1pppbp/2p3p1/8/3PPP2/2N5/PPP3PP/R1BQKBNR b KQkq -" : [74,[15, 31, null], "book"],
  "rnbqk1nr/pp2ppbp/2p3p1/3p4/3PPP2/2N5/PPP3PP/R1BQKBNR w KQkq -" : [65,[36, 28, null], "book"],
  "rnbqk1nr/ppp1ppbp/6p1/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [71,[36, 27, null], "book"],
  "rnbqk1nr/ppp1ppbp/3p2p1/8/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [61,[62, 45, null], "book"],
  "rnbqk1nr/ppp1ppbp/3p2p1/8/2BPP3/2N5/PPP2PPP/R1BQK1NR b KQkq -" : [49,[6, 21, null], "book"],
  "rnbqk1nr/pp2ppbp/2pp2p1/8/2BPP3/2N5/PPP2PPP/R1BQK1NR w KQkq -" : [77,[34, 41, null], "book"],
  "rnbqk1nr/pp2ppbp/2pp2p1/8/2BPP3/2N5/PPP1QPPP/R1B1K1NR b KQkq -" : [46,[6, 21, null], "book"],
  "rnbqk1nr/ppp1ppbp/3p2p1/8/3PPP2/2N5/PPP3PP/R1BQKBNR b KQkq -" : [67,[6, 21, null], "book"],
  "rnbqk1nr/ppp1ppbp/3p2p1/8/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq -" : [68,[6, 21, null], "book"],
  "rnbqk1nr/pp2ppbp/2pp2p1/8/3PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq -" : [78,[61, 52, null], "book"],
  "rnbqk1nr/ppppppbp/6p1/8/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [63,[10, 26, null], "book"],
  "rnbqk1nr/p1ppppbp/1p4p1/8/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [101,[55, 39, null], "book"],
  "rnbqk1nr/ppp1ppbp/3p2p1/8/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [60,[57, 42, null], "book"],
  "rnbqk1nr/ppp1ppbp/3p2p1/8/3PP3/2P2N2/PP3PPP/RNBQKB1R b KQkq -" : [60,[6, 21, null], "book"],
  "rnbqk1nr/ppp2pbp/3pp1p1/8/3PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq -" : [85,[55, 39, null], "book"],
  "rnbqkbnr/ppppp2p/6p1/5p2/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [207,[36, 29, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [95,[36, 28, null], "book"],
  "rnbqkb1r/pppppp1p/6pn/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [141,[58, 37, null], "book"],
  "rnbqkb1r/pppppp1p/6pn/8/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [127,[5, 14, null], "book"],
  "rnbqkb1r/ppppp2p/6pn/5p2/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [141,[58, 23, null], "book"],
  "rnbqkb1r/ppppp2p/6pB/5p2/3PP3/2N5/PPP2PPP/R2QKBNR b KQkq -" : [136,[5, 23, null], "book"],
  "rnbqk2r/ppppp2p/6pb/5p2/3PP3/2N5/PPP2PPP/R2QKBNR w KQkq -" : [167,[36, 29, null], "book"],
  "rnbqk2r/ppppp2p/6pb/5P2/3P4/2N5/PPP2PPP/R2QKBNR b KQkq -" : [154,[11, 27, null], "book"],
  "rnbq1rk1/ppppp2p/6pb/5P2/3P4/2N5/PPP2PPP/R2QKBNR w KQ -" : [194,[29, 22, null], "book"],
  "rnbqkbnr/ppppppp1/8/7p/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [126,[51, 35, null], "book"],
  "rnbqkbnr/ppppppp1/8/7p/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -" : [124,[11, 19, null], "book"],
  "rnbqkb1r/ppppppp1/5n2/7p/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [159,[36, 28, null], "book"],
  "rnbqkbnr/ppppppp1/7p/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [73,[51, 35, null], "book"],
  "rnbqkbnr/ppppppp1/7p/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -" : [65,[12, 20, null], "book"],
  "rnbqkbnr/pppp1pp1/7p/4p3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [131,[35, 28, null], "book"],
  "r1bqkbnr/pppppppp/n7/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [103,[62, 45, null], "book"],
  "r1bqkbnr/pppppppp/2n5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [60,[51, 35, null], "book"],
  "r1bqkbnr/pppppppp/2n5/8/1P2P3/8/P1PP1PPP/RNBQKBNR b KQkq -" : [-57,[18, 33, null], "book"],
  "r1bqkbnr/pppppppp/8/8/1n2P3/8/P1PP1PPP/RNBQKBNR w KQkq -" : [-51,[51, 35, null], "book"],
  "r1bqkbnr/pppppppp/8/8/1n2P3/2P5/P2P1PPP/RNBQKBNR b KQkq -" : [-62,[33, 18, null], "book"],
  "r1bqkbnr/pppppppp/2n5/8/4P3/2P5/P2P1PPP/RNBQKBNR w KQkq -" : [-57,[51, 35, null], "book"],
  "r1bqkbnr/pppppppp/2n5/8/3PP3/2P5/P4PPP/RNBQKBNR b KQkq -" : [-57,[11, 19, null], "book"],
  "r1bqkbnr/pppppppp/2n5/1B6/4P3/8/PPPP1PPP/RNBQK1NR b KQkq -" : [8,[11, 27, null], "book"],
  "r1bqkbnr/pppppppp/2n5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -" : [48,[11, 27, null], "book"],
  "r1bqkbnr/ppp1pppp/2n5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [55,[36, 28, null], "book"],
  "r1bqkbnr/ppp1pppp/2n5/3p4/3PP3/4B3/PPP2PPP/RN1QKBNR b KQkq -" : [-32,[27, 36, null], "book"],
  "r1bqkbnr/ppp1pppp/2n5/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq -" : [10,[3, 27, null], "book"],
  "r1bqkbnr/ppp1pppp/8/3P4/1n1P4/8/PPP2PPP/RNBQKBNR w KQkq -" : [251,[50, 34, null], "book"],
  "r1b1kbnr/ppp1pppp/2n5/3q4/3P4/8/PPP2PPP/RNBQKBNR w KQkq -" : [14,[62, 45, null], "book"],
  "r1b1kbnr/ppp1pppp/2n5/3q4/3P4/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [-53,[27, 35, null], "book"],
  "r1bqkbnr/ppp1pppp/2n5/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [17,[27, 36, null], "book"],
  "r1bqkbnr/1pp1pppp/p1n5/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [95,[36, 27, null], "book"],
  "r1bqkbnr/ppp1pppp/2n5/3P4/4p3/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [21,[18, 1, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3P4/4p3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [30,[58, 30, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3P4/4p3/2N2P2/PPP3PP/R1BQKBNR b KQkq -" : [3,[36, 45, null], "book"],
  "r1bqkbnr/ppp1pppp/8/3Pn3/4p3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [36,[58, 37, null], "book"],
  "r1bqkbnr/ppp2ppp/2n5/3pp3/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [51,[35, 28, null], "book"],
  "r1bqkbnr/ppp1pp1p/2n3p1/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [141,[36, 27, null], "book"],
  "r1bqkb1r/ppp1pppp/2n2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -" : [108,[36, 28, null], "book"],
  "r1bqkbnr/ppp1pppp/2np4/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [83,[35, 27, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [55,[35, 28, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/3Pp3/4P3/8/PPP2PPP/RNBQKBNR b KQkq -" : [65,[18, 12, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/4P3/4P3/8/PPP2PPP/RNBQKBNR b KQkq -" : [55,[18, 28, null], "book"],
  "r1bqk1nr/pppp1ppp/2n5/2b1P3/4P3/8/PPP2PPP/RNBQKBNR w KQkq -" : [110,[62, 45, null], "book"],
  "r1bqkbnr/ppp2ppp/2np4/4P3/4P3/8/PPP2PPP/RNBQKBNR w KQkq -" : [92,[28, 19, null], "book"],
  "r1bqkbnr/pppp2pp/2n2p2/4P3/4P3/8/PPP2PPP/RNBQKBNR w KQkq -" : [168,[62, 45, null], "book"],
  "r1bqkbnr/pppp1ppp/8/4n3/4P3/8/PPP2PPP/RNBQKBNR w KQkq -" : [51,[62, 45, null], "book"],
  "r1bqkbnr/pppp1ppp/8/4n3/4PP2/8/PPP3PP/RNBQKBNR b KQkq -" : [49,[28, 18, null], "book"],
  "r1bqkbnr/pppp1ppp/2n5/8/4PP2/8/PPP3PP/RNBQKBNR w KQkq -" : [54,[57, 42, null], "book"],
  "r1bqkbnr/pppp1ppp/8/4n3/4P3/2N5/PPP2PPP/R1BQKBNR b KQkq -" : [56,[5, 26, null], "book"],
  "r1bqkbnr/pppp1ppp/8/4n3/4P3/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [44,[11, 19, null], "book"],
  "r1b1kbnr/pppp1ppp/2n5/4P3/4P2q/8/PPP2PPP/RNBQKBNR w KQkq -" : [154,[62, 45, null], "book"],
  "r1bqkbnr/pppp1ppp/2n1p3/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [81,[62, 45, null], "book"],
  "r1bqkbnr/ppppp1pp/2n2p2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [144,[62, 45, null], "book"],
  "r1bqkbnr/pppppp1p/2n3p1/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -" : [142,[35, 27, null], "book"],
  "r1bqkbnr/pppppppp/2n5/8/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq -" : [17,[12, 28, null], "book"],
  "r1bqkb1r/pppppppp/2n2n2/8/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq -" : [80,[51, 35, null], "book"],
  "r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -" : [47,[12, 28, null], "book"],
  "r1bqkbnr/ppp1pppp/2np4/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [56,[51, 35, null], "book"],
  "r1bqkbnr/pppp1ppp/2n1p3/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [72,[51, 35, null], "book"],
  "r1bqkbnr/ppppp1pp/2n5/5p2/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [119,[36, 29, null], "book"],
  "r1bqkbnr/ppppp1pp/2n5/5P2/8/5N2/PPPP1PPP/RNBQKB1R b KQkq -" : [96,[11, 27, null], "book"],
  "r1bqkb1r/pppppppp/2n2n2/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [104,[36, 28, null], "book"],
  "r1bqkb1r/pppppppp/2n2n2/4P3/8/5N2/PPPP1PPP/RNBQKB1R b KQkq -" : [86,[21, 27, null], "book"],
  "r1bqkb1r/pppppppp/2n5/4P3/6n1/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [151,[51, 35, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [74,[36, 28, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq -" : [-65,[21, 36, null], "book"],
  "rnbqkb1r/pppppppp/8/8/2B1n3/8/PPPP1PPP/RNBQK1NR w KQkq -" : [-93,[34, 13, null], "book"],
  "rnbqkb1r/pppppBpp/8/8/4n3/8/PPPP1PPP/RNBQK1NR b KQkq -" : [-88,[4, 13, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/4P3/3P4/PPP2PPP/RNBQKBNR b KQkq -" : [-3,[12, 28, null], "book"],
  "rnbqkb1r/pppppppp/5n2/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq -" : [81,[21, 27, null], "book"],
  "rnbqkb1r/pppppppp/8/3nP3/8/8/PPPP1PPP/RNBQKBNR w KQkq -" : [74,[50, 34, null], "book"],
  "rnbqkb1r/pppppppp/8/3nP3/8/1P6/P1PP1PPP/RNBQKBNR b KQkq -" : [-27,[11, 19, null], "book"],
  "rnbqkb1r/pppppppp/8/3nP3/2B5/8/PPPP1PPP/RNBQK1NR b KQkq -" : [19,[27, 17, null], "book"],
  "rnbqkb1r/pppppppp/1n6/4P3/2B5/8/PPPP1PPP/RNBQK1NR w KQkq -" : [26,[34, 41, null], "book"],
  "rnbqkb1r/pppppppp/1n6/4P3/8/1B6/PPPP1PPP/RNBQK1NR b KQkq -" : [31,[10, 26, null], "book"],
  "rnbqkb1r/pp1ppppp/1n6/2p1P3/8/1B6/PPPP1PPP/RNBQK1NR w KQkq -" : [30,[59, 52, null], "book"],
  "rnbqkb1r/pp1ppppp/1n6/2p1P3/8/1B1P4/PPP2PPP/RNBQK1NR b KQkq -" : [23,[1, 18, null], "book"],
  "rnbqkb1r/pppppppp/8/3nP3/2P5/8/PP1P1PPP/RNBQKBNR b KQkq -" : [63,[27, 17, null], "book"],
  "rnbqkb1r/pppppppp/1n6/4P3/2P5/8/PP1P1PPP/RNBQKBNR w KQkq -" : [78,[51, 35, null], "book"],
  "rnbqkb1r/pppppppp/1n6/4P3/2P5/1P6/P2P1PPP/RNBQKBNR b KQkq -" : [-6,[11, 19, null], "book"],
  "rnbqkb1r/pppppppp/1n6/2P1P3/8/8/PP1P1PPP/RNBQKBNR b KQkq -" : [39,[17, 27, null], "book"],
  "rnbqkb1r/pppppppp/8/2PnP3/8/8/PP1P1PPP/RNBQKBNR w KQkq -" : [39,[61, 34, null], "book"],
  "rnbqkb1r/pppppppp/8/2PnP3/2B5/8/PP1P1PPP/RNBQK1NR b KQkq -" : [46,[12, 20, null], "book"],
  "rnbqkb1r/pppp1ppp/4p3/2PnP3/2B5/8/PP1P1PPP/RNBQK1NR w KQkq -" : [21,[51, 35, null], "book"],
  "rnbqkb1r/pppp1ppp/4p3/2PnP3/2B5/2N5/PP1P1PPP/R1BQK1NR b KQkq -" : [8,[5, 26, null], "book"],
  "rnbqkb1r/ppp2ppp/3pp3/2PnP3/2B5/2N5/PP1P1PPP/R1BQK1NR w KQkq -" : [42,[42, 27, null], "book"],
  "rnbqkb1r/ppp2ppp/3pp3/2PNP3/2B5/8/PP1P1PPP/R1BQK1NR b KQkq -" : [33,[20, 27, null], "book"],
  "rnbqkb1r/ppp2ppp/3p4/2PpP3/2B5/8/PP1P1PPP/R1BQK1NR w KQkq -" : [30,[34, 27, null], "book"],
  "rnbqkb1r/ppp2ppp/3p4/2PBP3/8/8/PP1P1PPP/R1BQK1NR b KQkq -" : [24,[19, 28, null], "book"],
  "rnbqkb1r/pppppppp/8/2PnP3/8/2N5/PP1P1PPP/R1BQKBNR b KQkq -" : [28,[12, 20, null], "book"],
  "rnbqkb1r/pppppppp/8/2P1P3/8/2n5/PP1P1PPP/R1BQKBNR w KQkq -" : [50,[51, 42, null], "book"],
  "rnbqkb1r/pppppppp/8/2P1P3/8/2P5/PP3PPP/R1BQKBNR b KQkq -" : [49,[11, 27, null], "book"],
  "rnbqkb1r/ppp1pppp/3p4/2P1P3/8/2P5/PP3PPP/R1BQKBNR w KQkq -" : [80,[62, 45, null], "book"],
  "rnbqkb1r/ppp1pppp/3p4/2P1P1B1/8/2P5/PP3PPP/R2QKBNR b KQkq -" : [23,[15, 23, null], "book"],
  "rnbqkb1r/pppppppp/8/3nP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq -" : [76,[11, 19, null], "book"],
  "rnbqkb1r/pp1ppppp/8/2pnP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq -" : [112,[35, 26, null], "book"],
  "rnbqkb1r/ppp1pppp/3p4/3nP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq -" : [66,[50, 34, null], "book"],
  "rnbqkb1r/ppp1pppp/3p4/3nP3/2BP4/8/PPP2PPP/RNBQK1NR b KQkq -" : [53,[27, 17, null], "book"],
  "rnbqkb1r/ppp1pppp/3p4/3nP3/2PP4/8/PP3PPP/RNBQKBNR b KQkq -" : [56,[27, 17, null], "book"],
  "rnbqkb1r/ppp1pppp/1n1p4/4P3/2PP4/8/PP3PPP/RNBQKBNR w KQkq -" : [78,[53, 37, null], "book"],
  "rnbqkb1r/ppp1pppp/1n1p4/2P1P3/3P4/8/PP3PPP/RNBQKBNR b KQkq -" : [-92,[19, 26, null], "book"],
  "rnbqkb1r/ppp1pppp/1n1p4/4P3/2PP1P2/8/PP4PP/RNBQKBNR b KQkq -" : [74,[19, 28, null], "book"],
  "rn1qkb1r/ppp1pppp/1n1p4/4Pb2/2PP1P2/8/PP4PP/RNBQKBNR w KQkq -" : [86,[57, 42, null], "book"],
  "rnbqkb1r/ppp1pp1p/1n1p4/4P1p1/2PP1P2/8/PP4PP/RNBQKBNR w KQkq -" : [149,[57, 42, null], "book"],
  "rnbqkb1r/ppp1pppp/3p4/3nP3/3P4/5N2/PPP2PPP/RNBQKB1R b KQkq -" : [55,[19, 28, null], "book"],
  "rn1qkb1r/ppp1pppp/3p4/3nP3/3P2b1/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [76,[61, 52, null], "book"],
  "rn1qkb1r/ppp1pppp/3p4/3nP3/3P2b1/5N2/PPP1BPPP/RNBQK2R b KQkq -" : [88,[12, 20, null], "book"],
  "rn1qkb1r/pp2pppp/2pp4/3nP3/3P2b1/5N2/PPP1BPPP/RNBQK2R w KQkq -" : [79,[50, 34, null], "book"],
  "rn1qkb1r/ppp1pppp/3p4/3nP3/2PP2b1/5N2/PP3PPP/RNBQKB1R b KQkq -" : [67,[27, 17, null], "book"],
  "rn1qkb1r/ppp1pppp/3p4/3nP3/3P2b1/5N1P/PPP2PP1/RNBQKB1R b KQkq -" : [29,[38, 45, null], "book"],
  "rnbqkb1r/ppp1pppp/8/3np3/3P4/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [61,[45, 28, null], "book"],
  "rnbqkb1r/ppp1pp1p/3p2p1/3nP3/3P4/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [82,[61, 34, null], "book"],
  "rnbqkb1r/ppp1pp1p/3p2p1/3nP3/2BP4/5N2/PPP2PPP/RNBQK2R b KQkq -" : [72,[27, 17, null], "book"],
  "rnbqkb1r/ppp1pp1p/1n1p2p1/4P3/2BP4/5N2/PPP2PPP/RNBQK2R w KQkq -" : [94,[34, 41, null], "book"],
  "rnbqkb1r/ppp1pp1p/1n1p2p1/4P3/3P4/1B3N2/PPP2PPP/RNBQK2R b KQkq -" : [66,[5, 14, null], "book"],
  "rnbqk2r/ppp1ppbp/1n1p2p1/4P3/3P4/1B3N2/PPP2PPP/RNBQK2R w KQkq -" : [90,[48, 32, null], "book"],
  "rnbqk2r/ppp1ppbp/1n1p2p1/4P3/P2P4/1B3N2/1PP2PPP/RNBQK2R b KQkq -" : [89,[19, 28, null], "book"],
  "rnbqkb1r/ppp1pp1p/3p2p1/3nP3/2PP4/5N2/PP3PPP/RNBQKB1R b KQkq -" : [62,[27, 17, null], "book"],
  "rnbqkb1r/ppp1pp1p/1n1p2p1/4P3/2PP4/5N2/PP3PPP/RNBQKB1R w KQkq -" : [75,[28, 19, null], "book"],
  "rnbqkb1r/ppp1pp1p/1n1p2p1/4P3/2PP4/5N1P/PP3PP1/RNBQKB1R b KQkq -" : [34,[19, 28, null], "book"],
  "rnbqk2r/ppp1ppbp/1n1p2p1/4P3/2PP4/5N1P/PP3PP1/RNBQKB1R w KQkq -" : [80,[28, 19, null], "book"],
  "rnbqk2r/ppp1ppbp/1n1p2p1/4P3/2PP4/5N1P/PP2BPP1/RNBQK2R b KQkq -" : [-76,[19, 28, null], "book"],
  "rnbqkb1r/ppp1pppp/1n1p4/4P3/3P4/5N2/PPP2PPP/RNBQKB1R w KQkq -" : [99,[48, 32, null], "book"],
  "rnbqkb1r/pppppppp/4P3/3n4/8/8/PPPP1PPP/RNBQKBNR b KQkq -" : [-122,[11, 20, null], "book"],
  "rnbqkb1r/pppppppp/8/3nP3/8/N7/PPPP1PPP/R1BQKBNR b KQkq -" : [18,[11, 19, null], "book"],
  "rnbqkb1r/pppppppp/8/3nP3/8/2N5/PPPP1PPP/R1BQKBNR b KQkq -" : [31,[27, 42, null], "book"],
  "rnbqkb1r/pppppppp/8/4P3/4n3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [128,[51, 35, null], "book"],
  "rnbqkbnr/pppppppp/8/4P3/8/8/PPPP1PPP/RNBQKBNR w KQkq -" : [92,[51, 35, null], "book"],
  "rnbqkbnr/pppppppp/8/4P3/3P4/8/PPP2PPP/RNBQKBNR b KQkq -" : [83,[11, 19, null], "book"],
  "rnbqkbnr/ppppp1pp/8/4Pp2/3P4/8/PPP2PPP/RNBQKBNR w KQkq f6" : [175,[58, 30, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq -" : [14,[12, 28, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq -" : [39,[36, 28, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3p4/4P3/2NP4/PPP2PPP/R1BQKBNR b KQkq -" : [-26,[12, 28, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/8/4p3/2NP4/PPP2PPP/R1BQKBNR w KQkq -" : [-31,[43, 36, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/6B1/4p3/2NP4/PPP2PPP/R2QKBNR b KQkq -" : [-42,[2, 38, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3pP3/8/2N5/PPPP1PPP/R1BQKBNR b KQkq -" : [47,[21, 11, null], "book"],
  "rnbqkb1r/pppnpppp/8/3pP3/8/2N5/PPPP1PPP/R1BQKBNR w KQkq -" : [26,[51, 35, null], "book"],
  "rnbqkb1r/pppnpppp/4P3/3p4/8/2N5/PPPP1PPP/R1BQKBNR b KQkq -" : [0,[13, 20, null], "book"],
  "rnbqkb1r/ppp1pppp/5n2/3P4/8/2N5/PPPP1PPP/R1BQKBNR b KQkq -" : [23,[21, 27, null], "book"],
  "rnbqkb1r/pp2pppp/2p2n2/3P4/8/2N5/PPPP1PPP/R1BQKBNR w KQkq -" : [76,[27, 18, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -" : [-66,[21, 36, null], "book"],
  "rnbqkb1r/pppppppp/7n/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -" : [114,[51, 35, null], "book"],
  "rnbqkbnr/pppppppp/8/8/8/5P2/PPPPP1PP/RNBQKBNR b KQkq -" : [-78,[12, 28, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/5P2/PPPPP1PP/RNBQKBNR w KQkq -" : [-65,[52, 44, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/5P2/PPPPPKPP/RNBQ1BNR b kq -" : [-139,[1, 18, null], "book"],
  "rnbqkbnr/pppppppp/8/8/5P2/8/PPPPP1PP/RNBQKBNR b KQkq -" : [-34,[6, 21, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/5P2/8/PPPPP1PP/RNBQKBNR w KQkq -" : [-30,[62, 45, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/2P2P2/8/PP1PP1PP/RNBQKBNR b KQkq -" : [-71,[27, 35, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/4PP2/8/PPPP2PP/RNBQKBNR b KQkq -" : [-153,[27, 36, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/4pP2/8/PPPP2PP/RNBQKBNR w KQkq -" : [-144,[57, 42, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/4pP2/3P4/PPP3PP/RNBQKBNR b KQkq -" : [-152,[6, 21, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/4pP2/2N5/PPPP2PP/R1BQKBNR b KQkq -" : [-151,[6, 21, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/5P2/8/PPPPP1PP/RNBQKBNR w KQkq -" : [46,[37, 28, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/5P2/8/PPPPP1PP/RNBQKBNR w KQkq -" : [10,[54, 46, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/3P1P2/8/PPP1P1PP/RNBQKBNR b KQkq -" : [13,[6, 21, null], "book"],
  "rnbqkbnr/ppp1p1pp/8/3p1p2/3P1P2/8/PPP1P1PP/RNBQKBNR w KQkq -" : [16,[52, 44, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/4PP2/8/PPPP2PP/RNBQKBNR b KQkq -" : [-21,[29, 36, null], "book"],
  "rnbqkbnr/ppppp1pp/8/8/4pP2/8/PPPP2PP/RNBQKBNR w KQkq -" : [-29,[57, 42, null], "book"],
  "rnbqkbnr/ppppp1pp/8/8/4pP2/2N5/PPPP2PP/R1BQKBNR b KQkq -" : [-50,[6, 21, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/8/4pP2/2N5/PPPP2PP/R1BQKBNR w KQkq -" : [-31,[54, 38, null], "book"],
  "rnbqkb1r/ppppp1pp/5n2/8/4pPP1/2N5/PPPP3P/R1BQKBNR b KQkq -" : [-32,[14, 22, null], "book"],
  "rnbqkbnr/pppppp1p/8/6p1/5P2/8/PPPPP1PP/RNBQKBNR w KQkq -" : [77,[51, 35, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/5P2/8/PPPPP1PP/RNBQKBNR w KQkq -" : [-20,[50, 34, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/5P2/5N2/PPPPP1PP/RNBQKB1R b KQkq -" : [-34,[11, 27, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/5P2/5N2/PPPPP1PP/RNBQKB1R w KQkq -" : [-24,[50, 34, null], "book"],
  "rnbqkb1r/pppppp1p/5np1/8/1P3P2/5N2/P1PPP1PP/RNBQKB1R b KQkq -" : [-45,[5, 14, null], "book"],
  "rnbqkb1r/pppppppp/7n/8/5P2/8/PPPPP1PP/RNBQKBNR w KQkq -" : [6,[52, 36, null], "book"],
  "rnbqkbnr/pppppppp/8/8/8/6P1/PPPPPP1P/RNBQKBNR b KQkq -" : [21,[12, 28, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/8/6P1/PPPPPP1P/RNBQKBNR w KQkq -" : [21,[62, 45, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/8/6P1/PPPPPPBP/RNBQK1NR b KQkq -" : [-22,[12, 28, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/8/6P1/PPPPPPBP/RNBQK1NR w KQkq -" : [-18,[50, 34, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/1P6/6P1/P1PPPPBP/RNBQK1NR b KQkq -" : [-90,[5, 33, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/3P4/6P1/PPP1PPBP/RNBQK1NR b KQkq -" : [-40,[28, 35, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/6P1/PPPPPP1P/RNBQKBNR w KQkq -" : [22,[50, 34, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq -" : [-25,[28, 36, null], "book"],
  "rnbqkbnr/ppppppp1/8/7p/8/6P1/PPPPPP1P/RNBQKBNR w KQkq -" : [35,[62, 45, null], "book"],
  "rnbqkbnr/pppppppp/8/8/6P1/8/PPPPPP1P/RNBQKBNR b KQkq -" : [-111,[11, 27, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/6P1/8/PPPPPP1P/RNBQKBNR w KQkq -" : [-127,[55, 47, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/6P1/8/PPPPPPBP/RNBQK1NR b KQkq -" : [-123,[2, 38, null], "book"],
  "rn1qkbnr/ppp1pppp/8/3p4/6b1/8/PPPPPPBP/RNBQK1NR w KQkq -" : [-125,[50, 34, null], "book"],
  "rn1qkbnr/ppp1pppp/8/3p4/2P3b1/8/PP1PPPBP/RNBQK1NR b KQkq -" : [-125,[10, 18, null], "book"],
  "rn1qkbnr/ppp1pppp/8/8/2Pp2b1/8/PP1PPPBP/RNBQK1NR w KQkq -" : [-82,[54, 9, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/6P1/8/PPPPPPBP/RNBQK1NR w KQkq -" : [-98,[55, 47, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p2P1/8/8/PPPPPPBP/RNBQK1NR b KQkq -" : [-92,[15, 23, null], "book"],
  "rnbqkbnr/pp2pppp/2p5/3p4/6P1/7P/PPPPPPB1/RNBQK1NR b KQkq -" : [-105,[15, 31, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/4P1P1/8/PPPP1P1P/RNBQKBNR b KQkq -" : [-149,[12, 28, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/6P1/7P/PPPPPP2/RNBQKBNR b KQkq -" : [-122,[15, 31, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/6P1/7P/PPPPPP2/RNBQKBNR w KQkq -" : [-103,[51, 35, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/6P1/8/PPPPPP1P/RNBQKBNR w KQkq -" : [-85,[61, 54, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/6P1/8/PPPPPPBP/RNBQK1NR b KQkq -" : [-81,[1, 18, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/6P1/8/PPPPPPBP/RNBQK1NR w KQkq -" : [-69,[51, 35, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/2P3P1/8/PP1PPPBP/RNBQK1NR b KQkq -" : [-136,[27, 34, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/6P1/8/PPPPPP1P/RNBQKBNR w KQkq -" : [51,[38, 29, null], "book"],
  "rnbqkbnr/pppppp1p/8/6p1/6P1/8/PPPPPP1P/RNBQKBNR w KQkq -" : [36,[51, 35, null], "book"],
  "rnbqkbnr/pppppp1p/6p1/8/6P1/8/PPPPPP1P/RNBQKBNR w KQkq -" : [-42,[51, 35, null], "book"],
  "rnbqkb1r/pppppppp/7n/8/6P1/8/PPPPPP1P/RNBQKBNR w KQkq -" : [47,[55, 47, null], "book"],
  "rnbqkbnr/pppppppp/8/8/8/7P/PPPPPPP1/RNBQKBNR b KQkq -" : [-16,[12, 28, null], "book"],
  "rnbqkbnr/pppppppp/8/8/7P/8/PPPPPPP1/RNBQKBNR b KQkq -" : [-46,[11, 27, null], "book"],
  "rnbqkbnr/1ppppppp/8/p7/7P/8/PPPPPPP1/RNBQKBNR w KQkq -" : [24,[51, 35, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/7P/8/PPPPPPP1/RNBQKBNR w KQkq -" : [-49,[50, 34, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/3P3P/8/PPP1PPP1/RNBQKBNR b KQkq -" : [-56,[28, 35, null], "book"],
  "rnbqkbnr/pppppppp/8/8/8/N7/PPPPPPPP/R1BQKBNR b KQkq -" : [-66,[12, 28, null], "book"],
  "rnbqkbnr/pppppppp/8/8/8/2N5/PPPPPPPP/R1BQKBNR b KQkq -" : [-10,[11, 27, null], "book"],
  "rnbqkbnr/1ppppppp/p7/8/8/2N5/PPPPPPPP/R1BQKBNR w KQkq -" : [46,[51, 35, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/8/2N5/PPPPPPPP/R1BQKBNR w KQkq -" : [36,[52, 36, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/3P4/2N5/PPP1PPPP/R1BQKBNR b KQkq -" : [-1,[26, 35, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/3p4/2N5/PPP1PPPP/R1BQKBNR w KQkq -" : [3,[59, 35, null], "book"],
  "rnbqkbnr/pp1ppppp/8/8/3Q4/2N5/PPP1PPPP/R1B1KBNR b KQkq -" : [7,[1, 18, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/8/3Q4/2N5/PPP1PPPP/R1B1KBNR w KQkq -" : [14,[35, 43, null], "book"],
  "r1bqkbnr/pp1ppppp/2n5/8/7Q/2N5/PPP1PPPP/R1B1KBNR b KQkq -" : [-96,[11, 27, null], "book"],
  "rnbqkbnr/pp1ppppp/8/2p5/8/2N5/PPPPPPPP/1RBQKBNR b Kkq -" : [-57,[11, 27, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/8/2N5/PPPPPPPP/R1BQKBNR w KQkq -" : [-1,[51, 35, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/4p3/2N5/PPPP1PPP/R1BQKBNR w KQkq -" : [14,[42, 36, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/4p3/2NP4/PPP2PPP/R1BQKBNR b KQkq -" : [-36,[36, 43, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/4p3/2N2P2/PPPP2PP/R1BQKBNR b KQkq -" : [-62,[36, 45, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/8/2N2p2/PPPP2PP/R1BQKBNR w KQkq -" : [-48,[62, 45, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/8/2N2Q2/PPPP2PP/R1B1KBNR b KQkq -" : [-113,[6, 21, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/4N3/8/PPPP1PPP/R1BQKBNR b KQkq -" : [23,[1, 18, null], "book"],
  "rnb1kbnr/ppp1pppp/8/3q4/4N3/8/PPPP1PPP/R1BQKBNR w KQkq -" : [57,[36, 42, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/2N5/PPPPPPPP/R1BQKBNR w KQkq -" : [26,[51, 35, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/P1N5/1PPPPPPP/R1BQKBNR b KQkq -" : [-40,[11, 27, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/5P2/2N5/PPPPP1PP/R1BQKBNR b KQkq -" : [-53,[28, 37, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/2N2N2/PPPPPPPP/R1BQKB1R b KQkq -" : [19,[1, 18, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/8/2N5/PPPPPPPP/R1BQKBNR w KQkq -" : [57,[52, 36, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/6P1/2N5/PPPPPP1P/R1BQKBNR b KQkq -" : [-21,[11, 27, null], "book"],
  "rnbqkbnr/pppppp1p/6p1/8/8/2N5/PPPPPPPP/R1BQKBNR w KQkq -" : [43,[52, 36, null], "book"],
  "rnbqkbnr/pppppp1p/6p1/8/7P/2N5/PPPPPPP1/R1BQKBNR b KQkq -" : [11,[11, 27, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/8/2N5/PPPPPPPP/R1BQKBNR w KQkq -" : [16,[52, 36, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/6P1/2N5/PPPPPP1P/R1BQKBNR b KQkq -" : [-68,[21, 38, null], "book"],
  "rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq -" : [19,[11, 27, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/8/5N2/PPPPPPPP/RNBQKB1R w KQkq -" : [36,[51, 35, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/8/1P3N2/P1PPPPPP/RNBQKB1R b KQkq -" : [-17,[2, 29, null], "book"],
  "rnbqkbnr/pp2pppp/8/2pp4/8/1P3N2/P1PPPPPP/RNBQKB1R w KQkq -" : [9,[52, 44, null], "book"],
  "rnbqkbnr/pp2pppp/8/2pp4/4P3/1P3N2/P1PP1PPP/RNBQKB1R b KQkq -" : [-57,[27, 36, null], "book"],
  "rnbqkbnr/pp2pppp/8/2p5/4p3/1P3N2/P1PP1PPP/RNBQKB1R w KQkq -" : [-62,[45, 28, null], "book"],
  "rnbqkbnr/pp2pppp/8/2p1N3/4p3/1P6/P1PP1PPP/RNBQKB1R b KQkq -" : [-54,[1, 11, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/1P6/5N2/P1PPPPPP/RNBQKB1R b KQkq -" : [-2,[1, 11, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/2P5/5N2/PP1PPPPP/RNBQKB1R b KQkq -" : [14,[27, 35, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/2Pp4/5N2/PP1PPPPP/RNBQKB1R w KQkq -" : [17,[49, 33, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/1PPp4/5N2/P2PPPPP/RNBQKB1R b KQkq -" : [5,[10, 26, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/2Pp4/5N2/PP1PPPPP/RNBQKBR1 b Qkq -" : [-150,[1, 18, null], "book"],
  "rnbqkbnr/ppp1pppp/8/8/2p5/5N2/PP1PPPPP/RNBQKB1R w KQkq -" : [38,[52, 44, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/8/3P1N2/PPP1PPPP/RNBQKB1R b KQkq -" : [-15,[6, 21, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -" : [-73,[27, 36, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq -" : [24,[14, 22, null], "book"],
  "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPP1P/RNBQKB1R w KQkq -" : [23,[61, 54, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/8/2N2N2/PPPPPPPP/R1BQKB1R b KQkq -" : [-16,[27, 35, null], "book"],
  "rnbqkbnr/ppp1pppp/8/3p4/8/5N2/PPPPPPPP/RNBQKBR1 b Qkq -" : [-96,[10, 26, null], "book"],
  "rnbqkbnr/ppp1pppp/3p4/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq -" : [52,[51, 35, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/8/5N2/PPPPPPPP/RNBQKB1R w KQkq -" : [66,[51, 35, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/8/3P1N2/PPP1PPPP/RNBQKB1R b KQkq -" : [21,[11, 19, null], "book"],
  "rnbqkbnr/ppppp1pp/8/5p2/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -" : [0,[29, 36, null], "book"],
  "rnbqkbnr/ppppp1pp/8/8/4p3/5N2/PPPP1PPP/RNBQKB1R w KQkq -" : [4,[45, 30, null], "book"],
  "rnbqkbnr/ppppp1pp/8/6N1/4p3/8/PPPP1PPP/RNBQKB1R b KQkq -" : [-10,[6, 21, null], "book"],
  "rnbqkbnr/pppppp1p/8/6p1/8/5N2/PPPPPPPP/RNBQKB1R w KQkq -" : [129,[45, 30, null], "book"],
  "r1bqkbnr/pppppppp/2n5/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq -" : [62,[51, 35, null], "book"],
  "rnbqkb1r/pppppppp/5n2/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq -" : [40,[50, 34, null], "book"],
  "rnbqkbnr/pppppppp/8/8/8/7N/PPPPPPPP/RNBQKB1R b KQkq -" : [-55,[11, 27, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/7N/PPPPPPPP/RNBQKB1R w KQkq -" : [-55,[51, 35, null], "book"],
  "rnbqkbnr/pppp1ppp/8/4p3/8/5P1N/PPPPP1PP/RNBQKB1R b KQkq -" : [-91,[11, 27, null], "book"],
  "rnbqkbnr/ppp2ppp/8/3pp3/8/5P1N/PPPPP1PP/RNBQKB1R w KQkq -" : [-90,[47, 53, null], "book"],
  }