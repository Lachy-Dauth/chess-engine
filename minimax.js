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

let old_transpositionTable = {};
let transpositionTable = {};
let opening_table = {
"ornbqkbnrppppppppooooooooooooooooooooooooooooooooPPPPPPPPRNBQKBNRwyyyy":[20,[52,36,null],"Book Move"],
"28rnbqkbnrppppopppoooooooooooopoooooooPoooooooooooPPPPoPPPRNBQKBNRwyyyy":[30,[62,45,null],"Book Move"],
"ornbqkbnrppppopppoooooooooooopoooooooPooooooooNooPPPPoPPPRNBQKBoRbyyyy":[30,[1,18,null],"Book Move"],
"orobqkbnrppppopppoonooooooooopoooooooPooooooooNooPPPPoPPPRNBQKBoRwyyyy":[30,[61,34,null],"Book Move"],
"36rnbqkbnrppppppppooooooooooooooooooooPoooooooooooPPPPoPPPRNBQKBNRbyyyy":[20,[10,26,null],"Book Move"],
"26rnbqkbnrppopppppoooooooooopoooooooooPoooooooooooPPPPoPPPRNBQKBNRwyyyy":[30,[57,42,null],"Book Move"],
"ornbqkbnrppopppppoooooooooopoooooooooPoooooNoooooPPPPoPPPRoBQKBNRbyyyy":[40,[1,18,null],"Book Move"],
"orobqkbnrppopppppoonooooooopoooooooooPoooooNoooooPPPPoPPPRoBQKBNRwyyyy":[20,[62,45,null],"Book Move"],
"orobqkbnrppopppppoonooooooopoooooooooPoooooNooNooPPPPoPPPRoBQKBoRbyyyy":[0,[12,20,null],"Book Move"],
"orobqkbnrppopopppoonopooooopoooooooooPoooooNooNooPPPPoPPPRoBQKBoRwyyyy":[0,[61,52,null],"Book Move"],
"orobqkbnrppopopppoonopooooopoooooooooPoooooNooNooPPPPBPPPRoBQKooRbyyyy":[0,[18,35,null],"Book Move"],
"27rnbqkbnrpppoppppooooooooooopooooooooPoooooooooooPPPPoPPPRNBQKBNRwyyyy":[70,[36,27,null],"Book Move"],
"ornbqkbnrpppoppppoooooooooooPooooooooooooooooooooPPPPoPPPRNBQKBNRbyyyy":[70,[3,27,null],"Book Move"],
"ornbokbnrpppoppppoooooooooooqooooooooooooooooooooPPPPoPPPRNBQKBNRwyyyy":[70,[57,42,null],"Book Move"],
"ornbokbnrpppoppppoooooooooooqooooooooooooooNoooooPPPPoPPPRoBQKBNRbyyyy":[70,[27,3,null],"Book Move"],
"ornbqkbnrpppoppppooooooooooooooooooooooooooNoooooPPPPoPPPRoBQKBNRwyyyy":[70,[62,45,null],"Book Move"],
"ornbqkbnrpppoppppooooooooooooooooooooooooooNooNooPPPPoPPPRoBQKBoRbyyyy":[70,[6,21,null],"Book Move"],
"ornbqkborpppoppppooooonooooooooooooooooooooNooNooPPPPoPPPRoBQKBoRwyyyy":[70,[51,35,null],"Book Move"],
"ornbqkbnrppppppopoooooopoooooooooooooPoooooooooooPPPPoPPPRNBQKBNRwyyyy":[70,[51,35,null],"Book Move"],
"35rnbqkbnrppppppopoooooopooooooooooooPPoooooooooooPPPooPPPRNBQKBNRbyyyy":[70,[5,14,null],"Book Move"],
"ornbqkonrppppppbpoooooopooooooooooooPPoooooooooooPPPooPPPRNBQKBNRwyyyy":[70,[57,42,null],"Book Move"],
"35rnbqkbnrppopppppoooooooooopooooooooPPoooooooooooPPPooPPPRNBQKBNRbyyyy":[10,[26,35,null],"Book Move"],
"ornbqkbnrppopppppooooooooooooooooooopPoooooooooooPPPooPPPRNBQKBNRwyyyy":[10,[62,45,null],"Book Move"],
"ornbqkbnrppopppppooooooooooooooooooopPooooooooNooPPPooPPPRNBQKBoRbyyyy":[10,[12,28,null],"Book Move"],
"28rnbqkbnrppopopppoooooooooooopoooooopPooooooooNooPPPooPPPRNBQKBoRwyyyy":[10,[50,42,null],"Book Move"],
"ornbqkbnrppopopppoooooooooooopoooooopPoooooPooNooPPoooPPPRNBQKBoRbyyyy":[5,[1,18,null],"Book Move"],
"orobqkbnrppopopppoonooooooooopoooooopPoooooPooNooPPoooPPPRNBQKBoRwyyyy":[15,[42,35,null],"Book Move"],
"35rnbqkbnrppppppppoooooooooooooooooooPooooooooooooPPPoPPPPRNBQKBNRbyyyy":[10,[11,27,null],"Book Move"],
"27rnbqkbnrpppoppppooooooooooopoooooooPooooooooooooPPPoPPPPRNBQKBNRwyyyy":[10,[50,34,null],"Book Move"],
"34rnbqkbnrpppoppppooooooooooopooooooPPooooooooooooPPooPPPPRNBQKBNRbyyyy":[10,[10,18,null],"Book Move"],
"ornbqkbnrppooppppoopoooooooopooooooPPooooooooooooPPooPPPPRNBQKBNRwyyyy":[30,[57,42,null],"Book Move"],
"ornbqkbnrppooppppoopoooooooopooooooPPooooooNoooooPPooPPPPRoBQKBNRbyyyy":[30,[6,21,null],"Book Move"],
"ornbqkborppooppppoopoonooooopooooooPPooooooNoooooPPooPPPPRoBQKBNRwyyyy":[30,[52,44,null],"Book Move"],
"ornbqkborppooppppoopoonooooopooooooPPooooooNoPoooPPoooPPPRoBQKBNRbyyyy":[20,[2,29,null],"Book Move"],
"26rnbqkbnrppopppppoooooooooopoooooooooPoooooNoooooPPPPoPPPRoBQKBNRbyyyy":[40,[1,18,null],"Book Move"],
"27rnbqkbnrpppoppppooooooooooopoooooooPoBooooooooooPPPoPPPPRNoQKBNRbyyyy":[8,[10,26,null],"Book Move"],
"26rnbqkbnrppooppppooooooooooppoooooooPoBooooooooooPPPoPPPPRNoQKBNRwyyyy":[8,[52,44,null],"Book Move"],
"ornbqkbnrppooppppooooooooooppoooooooPoBooooooPoooPPPooPPPRNoQKBNRbyyyy":[8,[1,18,null],"Book Move"],
"orobqkbnrppooppppoonoooooooppoooooooPoBooooooPoooPPPooPPPRNoQKBNRwyyyy":[0,[62,45,null],"Book Move"],
"orobqkbnrppooppppoonoooooooppoooooooPoBooooooPNooPPPooPPPRNoQKBoRbyyyy":[0,[6,21,null],"Book Move"],
"orobqkborppooppppoonoonooooppoooooooPoBooooooPNooPPPooPPPRNoQKBoRwyyyy":[0,[35,26,null],"Book Move"],
"orobqkborppooppppoonoonooooPpoooooooooBooooooPNooPPPooPPPRNoQKBoRbyyyy":[0,[12,20,null],"Book Move"],
"ornbqkbnrppopppppoopoooooooooooooooooPoooooooooooPPPPoPPPRNBQKBNRwyyyy":[45,[51,35,null],"Book Move"],
"35rnbqkbnrppopppppoopooooooooooooooooPPoooooooooooPPPooPPPRNBQKBNRbyyyy":[30,[11,27,null],"Book Move"],
"27rnbqkbnrppooppppoopoooooooopoooooooPPoooooooooooPPPooPPPRNBQKBNRwyyyy":[0,[53,45,null],"Book Move"],
"ornbqkbnrppooppppoopooooooooooooooooPpooooooooPooPPPoooPPRNBQKBNRwyyyy":[40,[45,36,null],"Book Move"],
"ornbqkbnrppooppppoopooooooooooooooooPPoooooooooooPPPoooPPRNBQKBNRbyyyy":[30,[12,28,null],"Book Move"],
"28rnbqkbnrppooopppoopooooooooopooooooPPoooooooooooPPPoooPPRNBQKBNRwyyyy":[30,[62,45,null],"Book Move"],
"ornbqkbnrppooopppoopooooooooopooooooPPooooooooNooPPPoooPPRNBQKBoRbyyyy":[10,[2,38,null],"Book Move"],
"ornoqkbnrppooopppoopooooooooopooooooPPobooooooNooPPPoooPPRNBQKBoRwyyyy":[20,[50,42,null],"Book Move"],
"ornoqkbnrppooopppoopooooooooopooooooPPoboooPooNooPPooooPPRNBQKBoRbyyyy":[20,[6,21,null],"Book Move"],
"ornbqkbnrppppopppoooopoooooooooooooooPoooooooooooPPPPoPPPRNBQKBNRwyyyy":[10,[51,35,null],"Book Move"],
"35rnbqkbnrppppopppoooopooooooooooooooPPoooooooooooPPPooPPPRNBQKBNRbyyyy":[10,[11,27,null],"Book Move"],
"27rnbqkbnrpppoopppoooopoooooopoooooooPPoooooooooooPPPooPPPRNBQKBNRwyyyy":[30,[36,28,null],"Book Move"],
"ornbqkbnrpppoopppoooopoooooopPooooooPooooooooooooPPPooPPPRNBQKBNRbyyyy":[30,[10,26,null],"Book Move"],
"26rnbqkbnrppooopppoooopoooooppPooooooPooooooooooooPPPooPPPRNBQKBNRwyyyy":[30,[50,42,null],"Book Move"],
"ornbqkbnrppooopppoooopoooooppPooooooPooooooPoooooPPoooPPPRNBQKBNRbyyyy":[30,[1,18,null],"Book Move"],
"orobqkbnrppooopppoonopoooooppPooooooPooooooPoooooPPoooPPPRNBQKBNRwyyyy":[30,[62,45,null],"Book Move"],
"orobqkbnrppooopppoonopoooooppPooooooPooooooPooNooPPoooPPPRNBQKBoRbyyyy":[30,[3,17,null],"Book Move"],
"orobokbnrppooopppoqnopoooooppPooooooPooooooPooNooPPoooPPPRNBQKBoRwyyyy":[30,[61,43,null],"Book Move"],
"35rnbqkborppppppppooooonoooooooooooooPooooooooooooPPPoPPPPRNBQKBNRwyyyy":[30,[50,34,null],"Book Move"],
"34rnbqkborppppppppooooonooooooooooooPPooooooooooooPPooPPPPRNBQKBNRbyyyy":[30,[12,20,null],"Book Move"],
"ornbqkborppppopppoooopnooooooooooooPPooooooooooooPPooPPPPRNBQKBNRwyyyy":[30,[62,45,null],"Book Move"],
"34rnbqkbnrppppppppooooooooooooooooooPoooooooooooooPPoPPPPPRNBQKBNRbyyyy":[10,[12,28,null],"Book Move"],
"28rnbqkbnrppppopppoooooooooooopoooooPoooooooooooooPPoPPPPPRNBQKBNRwyyyy":[20,[57,42,null],"Book Move"],
"ornbqkbnrppppopppoooooooooooopoooooPoooooooNoooooPPoPPPPPRoBQKBNRbyyyy":[20,[6,21,null],"Book Move"],
"28rnbqkbnrppppopppoooooooooooopooQooooPoooooooooooPPPPoPPPRNBoKBNRbyyyy":[-30,[1,18,null],"Book Move"],
"28rnbqkbnrppppopppoooooooooooopoooooooPooooooooNooPPPPoPPPRNBQKBoRbyyyy":[30,[1,18,null],"Book Move"],
"ornbqkbnrpppoopppooopoooooooopoooooooPooooooooNooPPPPoPPPRNBQKBoRwyyyy":[60,[51,35,null],"Book Move"],
"35rnbqkbnrpppoopppooopoooooooopooooooPPooooooooNooPPPooPPPRNBQKBoRbyyyy":[80,[28,35,null],"Book Move"],
"ornbqkbnrpppoopppooopooooooooooooooopPooooooooNooPPPooPPPRNBQKBoRwyyyy":[60,[45,35,null],"Book Move"],
"ornbqkbnrpppoopppooopoooooooooooooooNPoooooooooooPPPooPPPRNBQKBoRbyyyy":[60,[6,21,null],"Book Move"],
"28robqkbnrppppopppoonooooooBoopoooooooPooooooooNooPPPPoPPPRNBQKooRbyyyy":[20,[6,21,null],"Book Move"],
"26rnbqkbnrppopppppoooooooooopoooooooBoPoooooooooooPPPPoPPPRNBQKoNRbyyyy":[0,[1,18,null],"Book Move"],
"orobqkbnrppopppppoonooooooopoooooooBoPooooooooQooPPPPoPPPRNBoKoNRbyyyy":[-80,[6,21,null],"Book Move"],
"orobqkborppopppppoonoonoooopoooooooBoPooooooooQooPPPPoPPPRNBoKoNRwyyyy":[-80,[51,43,null],"Book Move"],
"orobqkborppopppppoonoonoooopoooooooBoPooooooPoQooPPPooPPPRNBoKoNRbyyyy":[-80,[12,20,null],"Book Move"],
}

let count = 0;
function iterativeDeepeningMinimax(board, whitesTurn, enPassent, blackCastle, whiteCastle, timeLimit) {
  const startTime = Date.now();
  let bestValue, bestMove, depth = 1;
  old_transpositionTable = {}
  count = 0;

  if (opening_table[hashPosition(board, whitesTurn, enPassent, blackCastle, whiteCastle)] != undefined) {
    return opening_table[hashPosition(board, whitesTurn, enPassent, blackCastle, whiteCastle)]
  }

  while (true) {
    const [value, move] = evaluation(board, whitesTurn, enPassent, blackCastle, whiteCastle, depth, -Infinity, Infinity, depth, timeLimit - (Date.now() - startTime), []);
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

function evaluation(board, whitesTurn, enPassent, blackCastle, whiteCastle, depth, alpha, beta, originalDepth, timeLimit, previousPositionsMinimax) {
  count += 1
  const hashOfPos = hashPosition(board, whitesTurn, enPassent, blackCastle, whiteCastle);
  if (hashOfPos in transpositionTable) {
    return [transpositionTable[hashOfPos], null];
  }
  if (depth <= 0 && originalDepth != 0) {
    let score = evaluationCaptures(board, whitesTurn, enPassent, blackCastle, whiteCastle, depth, alpha, beta, originalDepth, timeLimit)[0]
    transpositionTable[hashOfPos] = score
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
      // if (hashPosition(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle)) in old_transpositionTable && hashPosition(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle)) in old_transpositionTable){
      //   return old_transpositionTable[hashPosition(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle))] - old_transpositionTable[hashPosition(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle))]
      // }
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
    transpositionTable[hashOfPos] = max;
    return [max, bestMove];
  }
  else {
    let min = Infinity;
    let bestMove = 0;
    let allValidMoves = generateAllValidMoves(board, whitesTurn, enPassent, blackCastle, whiteCastle).sort((moveOne, moveTwo) => {
      // if (hashPosition(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle)) in old_transpositionTable && hashPosition(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle)) in old_transpositionTable){
      //   return old_transpositionTable[hashPosition(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle))] - old_transpositionTable[hashPosition(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle))]
      // }
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
    transpositionTable[hashOfPos] = min;
    return [min, bestMove];
  }
}

function evaluationCaptures(board, whitesTurn, enPassent, blackCastle, whiteCastle, depth, alpha, beta, originalDepth, timeLimit) {
  count += 1
  const hashOfPos = hashPosition(board, whitesTurn, enPassent, blackCastle, whiteCastle);
  if (hashOfPos in transpositionTable) {
    return [transpositionTable[hashOfPos], null];
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
    transpositionTable[hashOfPos] = max;
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
    transpositionTable[hashOfPos] = min;
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
      totalWhite -= 15 * Math.round(Math.max(Math.abs(whiteKingPos%8 - blackKingPos%8), Math.abs(Math.round(whiteKingPos/8) - Math.round(blackKingPos/8))))
    }
    if (totalBlack < -100) {
      totalWhite -= Math.round(piecesValues["kend"][whiteKingPos] * 10 * (1 - (whiteEndGame / 2000)))
    }
  }
  if (blackEndGame < 0) {
    totalBlack += piecesValues["k"][blackKingPos]
  }
  else {
    if (blackEndGame > whiteEndGame) {
      totalBlack -= 80
      totalBlack += 15 * Math.round(Math.max(Math.abs(whiteKingPos%8 - blackKingPos%8), Math.abs(Math.round(whiteKingPos/8) - Math.round(blackKingPos/8))))
    }
    if (totalWhite > 100) {
      totalBlack += Math.round(piecesValues["kend"][blackKingPos] * 10 * (1 - (blackEndGame / 2000)))
    }
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