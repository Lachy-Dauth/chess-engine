function generateAllValidMoves(board, whitesTurn, enPassent, blackCastle, whiteCastle) {
  let allValidMoves = [];
  for (let i = 0; i < 64; i++) {
    if (isCapitalLetter(board[i]) == whitesTurn) {
      let validMoves = findValidMoves(board, i, enPassent, blackCastle, whiteCastle);
      allValidMoves.push(...validMoves.map(move => [i, ...move]))
    }
  }
  return allValidMoves
}
console.log(generateAllValidMoves(board, whitesTurn, enPassent, blackCastle, whiteCastle).length);



function movePieceAI(board, [startingPos, endingPos, promotionPiece], enPassent, blackCastle, whiteCastle, whitesTurn) {
  enPassent = null;
  if (board[startingPos] == "p" || board[startingPos] == "P") {
    if (startingPos%8 != endingPos%8 && board[endingPos] == null) {
      board[enPassent] = null;
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
  if (Math.floor(endingPos/8) == 0 || Math.floor(endingPos/8) == 7 && board[startingPos] == "p" || board[startingPos] == "P") {
    board[endingPos] = promotionPiece;
  }
  whitesTurn = !whitesTurn

  return [enPassent, blackCastle, whiteCastle, whitesTurn]
}