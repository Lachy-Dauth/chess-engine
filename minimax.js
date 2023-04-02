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
  'k': [-20, -30, -10, 0, 0, -10, -30, -20, -20, -20, 0, 0, 0, 0, -20, -20, 10, 20, 20, 20, 20, 20, 20, 10, 20, 30, 30, 40, 40, 30, 30, 20, 30, 40, 40, 50, 50, 40, 40, 30, 30, 40, 40, 50, 50, 40, 40, 30, 30, 40, 40, 50, 50, 40, 40, 30, 30, 40, 40, 50, 50, 40, 40, 30]
};

let transpositionTable = {

}


function evaluation(board, enPassent, blackCastle, whiteCastle, whitesTurn, depth, alpha, beta, transpositionTable) {
  if (depth <= 0) {
    return evaluationCaptures(board, enPassent, blackCastle, whiteCastle, whitesTurn, 100, alpha, beta, transpositionTable);
  }
  if (whitesTurn) {
    let max = -Infinity;
    let bestMove = 0;
    let allValidMoves = generateAllValidMoves(board, whitesTurn, enPassent, blackCastle, whiteCastle).sort((moveOne, moveTwo) => {
      return evaluationDepth0(...movePieceAI(moveTwo, board, enPassent, blackCastle, whiteCastle, whitesTurn)) - evaluationDepth0(...movePieceAI(moveOne, board, enPassent, blackCastle, whiteCastle, whitesTurn))
    });
    if (allValidMoves.length == 0){
      if (kingInCheck(board, whitesTurn)) {
        return [-Infinity, null]
      }
      return [0, null]
    }
    for (let i = 0; i < allValidMoves.length; i++) {
      const move = allValidMoves[i];
      let scoreTrans = transpositionTable[hashPosition(board, enPassent, whitesTurn, whiteCastle, blackCastle)]
      let score = scoreTrans == undefined ? evaluation(...movePieceAI(move, board, enPassent, blackCastle, whiteCastle, whitesTurn), depth - 1, alpha, beta, transpositionTable)[0] : scoreTrans;
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
    transpositionTable[hashPosition(board, enPassent, whitesTurn, whiteCastle, blackCastle)] = max;
    return [max, bestMove];
  }
  else {
    let min = Infinity;
    let bestMove = 0;
    let allValidMoves = generateAllValidMoves(board, whitesTurn, enPassent, blackCastle, whiteCastle).sort((moveOne, moveTwo) => {
      return evaluationDepth0(...movePieceAI(moveOne, board, enPassent, blackCastle, whiteCastle, whitesTurn)) - evaluationDepth0(...movePieceAI(moveTwo, board, enPassent, blackCastle, whiteCastle, whitesTurn))
    });
    if (allValidMoves.length == 0){
      if (allValidMoves.length == 0){
        if (kingInCheck(board, whitesTurn)) {
          return [Infinity, null]
        }
        return [0, null]
      }
    }
    for (let i = 0; i < allValidMoves.length; i++) {
      const move = allValidMoves[i];
      let scoreTrans = transpositionTable[hashPosition(board, enPassent, whitesTurn, whiteCastle, blackCastle)]
      let score = scoreTrans == undefined ? evaluation(...movePieceAI(move, board, enPassent, blackCastle, whiteCastle, whitesTurn), depth - 1, alpha, beta, transpositionTable)[0] : scoreTrans;
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
    transpositionTable[hashPosition(board, enPassent, whitesTurn, whiteCastle, blackCastle)] = min;
    return [min, bestMove];
  }
}

function evaluationCaptures(board, enPassent, blackCastle, whiteCastle, whitesTurn, depth, alpha, beta, transpositionTable) {
  if (depth <= 0) {
    return [evaluationDepth0(board, enPassent, blackCastle, whiteCastle, whitesTurn), null];
  }
  if (whitesTurn) {
    let max = evaluationDepth0(board, enPassent, blackCastle, whiteCastle, whitesTurn);
    let bestMove = 0;
    let allValidMoves = generateAllValidMoves(board, whitesTurn, enPassent, blackCastle, whiteCastle).sort((moveOne, moveTwo) => {
      return evaluationDepth0(...movePieceAI(moveTwo, board, enPassent, blackCastle, whiteCastle, whitesTurn)) - evaluationDepth0(...movePieceAI(moveOne, board, enPassent, blackCastle, whiteCastle, whitesTurn))
    });
    if (allValidMoves.length == 0){
      if (kingInCheck(board, whitesTurn)) {
        return [-Infinity, null]
      }
      return [0, null]
    }
    allValidMoves = allValidMoves.filter(move => isCapitalLetter(board[move[1]]) == !whitesTurn)
    for (let i = 0; i < allValidMoves.length; i++) {
      const move = allValidMoves[i];
      let scoreTrans = transpositionTable[hashPosition(board, enPassent, whitesTurn, whiteCastle, blackCastle)]
      let score = scoreTrans == undefined ? evaluationCaptures(...movePieceAI(move, board, enPassent, blackCastle, whiteCastle, whitesTurn), depth - 1, alpha, beta, transpositionTable)[0] : scoreTrans;
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
    transpositionTable[hashPosition(board, enPassent, whitesTurn, whiteCastle, blackCastle)] = max;
    return [max, bestMove];
  }
  else {
    let min = evaluationDepth0(board, enPassent, blackCastle, whiteCastle, whitesTurn);
    let bestMove = 0;
    let allValidMoves = generateAllValidMoves(board, whitesTurn, enPassent, blackCastle, whiteCastle).sort((moveOne, moveTwo) => {
      return evaluationDepth0(...movePieceAI(moveOne, board, enPassent, blackCastle, whiteCastle, whitesTurn)) - evaluationDepth0(...movePieceAI(moveTwo, board, enPassent, blackCastle, whiteCastle, whitesTurn))
    });
    if (allValidMoves.length == 0){
      if (allValidMoves.length == 0){
        if (kingInCheck(board, whitesTurn)) {
          return [Infinity, null]
        }
        return [0, null]
      }
    }
    allValidMoves = allValidMoves.filter(move => isCapitalLetter(board[move[1]]) == !whitesTurn)
    for (let i = 0; i < allValidMoves.length; i++) {
      const move = allValidMoves[i];
      let scoreTrans = transpositionTable[hashPosition(board, enPassent, whitesTurn, whiteCastle, blackCastle)]
      let score = scoreTrans == undefined ? evaluationCaptures(...movePieceAI(move, board, enPassent, blackCastle, whiteCastle, whitesTurn), depth - 1, alpha, beta, transpositionTable)[0] : scoreTrans;
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
    transpositionTable[hashPosition(board, enPassent, whitesTurn, whiteCastle, blackCastle)] = min;
    return [min, bestMove];
  }
}

function evaluationDepth0(board, enPassent, blackCastle, whiteCastle, whitesTurn) {
  let total = 0;
  for (let i = 0; i < 64; i++) {
    if (board[i] != null) {
      total += piecesValues[board[i]][i];
    }
  }
  return total;
}

function generateAllValidMoves(board, whitesTurn, enPassent, blackCastle, whiteCastle) {
  let allValidMoves = [];
  for (let i = 0; i < 64; i++) {
    if (isCapitalLetter(board[i]) == whitesTurn) {
      let validMoves = findValidMoves(board, i, enPassent, blackCastle, whiteCastle);
      allValidMoves.push(...validMoves)
    }
  }
  return allValidMoves
}

function numberOfGames(board, enPassent, blackCastle, whiteCastle, whitesTurn, depth, startingDepth) {
  if (depth == 0) {
    return 1
  }
  let total = 0
  let arr = []
  let allValidMoves = generateAllValidMoves(board, whitesTurn, enPassent, blackCastle, whiteCastle);
  for (let i = 0; i < allValidMoves.length; i++) {
    const move = allValidMoves[i];
    arr.push([board[move[0]], String.fromCharCode(97 + move[0]%8) + String(8 - Math.floor(move[0]/8)) + String.fromCharCode(97 + move[1]%8) + String(8 - Math.floor(move[1]/8)), numberOfGames(...movePieceAI(move, board, enPassent, blackCastle, whiteCastle, whitesTurn), depth - 1)])
    total += numberOfGames(...movePieceAI(move, board, enPassent, blackCastle, whiteCastle, whitesTurn), depth - 1, startingDepth);
  }
  if (depth == startingDepth){
    console.table(arr)
  }
  return total
}

console.log(numberOfGames(board, enPassent, blackCastle, whiteCastle, whitesTurn, 3, 3))

function movePieceAI([startingPos, endingPos, promotionPiece], old_board, old_enPassent, old_blackCastle, old_whiteCastle, old_whitesTurn) {
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
  if ((Math.floor(endingPos/8) == 0 || Math.floor(endingPos/8) == 7) && (board[startingPos] == "p" || board[startingPos] == "P")) {
    board[endingPos] = promotionPiece;
  }
  let whitesTurn = !old_whitesTurn
  return [board, enPassent, blackCastle, whiteCastle, whitesTurn]
}

function hashPosition(board, enPassent, whitesTurn, whiteCastle, blackCastle) {
  let string = [enPassent == null ? 'o' : enPassent, ...board.map(char => char == null ? "o" : char), whitesTurn ? "w" : "b", ...whiteCastle.map(value => value? "y" : "n"), ...blackCastle.map(value => value? "y" : "n")].join("");
  let array = CryptoJS.MD5(string).words;
  let hash = array[0] * array[1];
  return hash
}