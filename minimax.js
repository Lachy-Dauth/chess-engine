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