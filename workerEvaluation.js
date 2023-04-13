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
let opening_table = {
"ornbqkbnrppppppppooooooooooooooooooooooooooooooooPPPPPPPPRNBQKBNRwyyyy":[20,[52,36,null],"book"],
"28rnbqkbnrppppopppoooooooooooopoooooooPoooooooooooPPPPoPPPRNBQKBNRwyyyy":[30,[62,45,null],"book"],
"ornbqkbnrppppopppoooooooooooopoooooooPooooooooNooPPPPoPPPRNBQKBoRbyyyy":[30,[1,18,null],"book"],
"orobqkbnrppppopppoonooooooooopoooooooPooooooooNooPPPPoPPPRNBQKBoRwyyyy":[30,[61,34,null],"book"],
"36rnbqkbnrppppppppooooooooooooooooooooPoooooooooooPPPPoPPPRNBQKBNRbyyyy":[20,[10,26,null],"book"],
"26rnbqkbnrppopppppoooooooooopoooooooooPoooooooooooPPPPoPPPRNBQKBNRwyyyy":[30,[57,42,null],"book"],
"ornbqkbnrppopppppoooooooooopoooooooooPoooooNoooooPPPPoPPPRoBQKBNRbyyyy":[40,[1,18,null],"book"],
"orobqkbnrppopppppoonooooooopoooooooooPoooooNoooooPPPPoPPPRoBQKBNRwyyyy":[20,[62,45,null],"book"],
"orobqkbnrppopppppoonooooooopoooooooooPoooooNooNooPPPPoPPPRoBQKBoRbyyyy":[0,[12,20,null],"book"],
"orobqkbnrppopopppoonopooooopoooooooooPoooooNooNooPPPPoPPPRoBQKBoRwyyyy":[0,[61,52,null],"book"],
"orobqkbnrppopopppoonopooooopoooooooooPoooooNooNooPPPPBPPPRoBQKooRbyyyy":[0,[18,35,null],"book"],
"27rnbqkbnrpppoppppooooooooooopooooooooPoooooooooooPPPPoPPPRNBQKBNRwyyyy":[70,[36,27,null],"book"],
"ornbqkbnrpppoppppoooooooooooPooooooooooooooooooooPPPPoPPPRNBQKBNRbyyyy":[70,[3,27,null],"book"],
"ornbokbnrpppoppppoooooooooooqooooooooooooooooooooPPPPoPPPRNBQKBNRwyyyy":[70,[57,42,null],"book"],
"ornbokbnrpppoppppoooooooooooqooooooooooooooNoooooPPPPoPPPRoBQKBNRbyyyy":[70,[27,3,null],"book"],
"ornbqkbnrpppoppppooooooooooooooooooooooooooNoooooPPPPoPPPRoBQKBNRwyyyy":[70,[62,45,null],"book"],
"ornbqkbnrpppoppppooooooooooooooooooooooooooNooNooPPPPoPPPRoBQKBoRbyyyy":[70,[6,21,null],"book"],
"ornbqkborpppoppppooooonooooooooooooooooooooNooNooPPPPoPPPRoBQKBoRwyyyy":[70,[51,35,null],"book"],
"ornbqkbnrppppppopoooooopoooooooooooooPoooooooooooPPPPoPPPRNBQKBNRwyyyy":[70,[51,35,null],"book"],
"35rnbqkbnrppppppopoooooopooooooooooooPPoooooooooooPPPooPPPRNBQKBNRbyyyy":[70,[5,14,null],"book"],
"ornbqkonrppppppbpoooooopooooooooooooPPoooooooooooPPPooPPPRNBQKBNRwyyyy":[70,[57,42,null],"book"],
"35rnbqkbnrppopppppoooooooooopooooooooPPoooooooooooPPPooPPPRNBQKBNRbyyyy":[10,[26,35,null],"book"],
"ornbqkbnrppopppppooooooooooooooooooopPoooooooooooPPPooPPPRNBQKBNRwyyyy":[10,[62,45,null],"book"],
"ornbqkbnrppopppppooooooooooooooooooopPooooooooNooPPPooPPPRNBQKBoRbyyyy":[10,[12,28,null],"book"],
"28rnbqkbnrppopopppoooooooooooopoooooopPooooooooNooPPPooPPPRNBQKBoRwyyyy":[10,[50,42,null],"book"],
"ornbqkbnrppopopppoooooooooooopoooooopPoooooPooNooPPoooPPPRNBQKBoRbyyyy":[5,[1,18,null],"book"],
"orobqkbnrppopopppoonooooooooopoooooopPoooooPooNooPPoooPPPRNBQKBoRwyyyy":[15,[42,35,null],"book"],
"35rnbqkbnrppppppppoooooooooooooooooooPooooooooooooPPPoPPPPRNBQKBNRbyyyy":[10,[11,27,null],"book"],
"27rnbqkbnrpppoppppooooooooooopoooooooPooooooooooooPPPoPPPPRNBQKBNRwyyyy":[10,[50,34,null],"book"],
"34rnbqkbnrpppoppppooooooooooopooooooPPooooooooooooPPooPPPPRNBQKBNRbyyyy":[10,[10,18,null],"book"],
"ornbqkbnrppooppppoopoooooooopooooooPPooooooooooooPPooPPPPRNBQKBNRwyyyy":[30,[57,42,null],"book"],
"ornbqkbnrppooppppoopoooooooopooooooPPooooooNoooooPPooPPPPRoBQKBNRbyyyy":[30,[6,21,null],"book"],
"ornbqkborppooppppoopoonooooopooooooPPooooooNoooooPPooPPPPRoBQKBNRwyyyy":[30,[52,44,null],"book"],
"ornbqkborppooppppoopoonooooopooooooPPooooooNoPoooPPoooPPPRoBQKBNRbyyyy":[20,[2,29,null],"book"],
"26rnbqkbnrppopppppoooooooooopoooooooooPoooooNoooooPPPPoPPPRoBQKBNRbyyyy":[40,[1,18,null],"book"],
"27rnbqkbnrpppoppppooooooooooopoooooooPoBooooooooooPPPoPPPPRNoQKBNRbyyyy":[8,[10,26,null],"book"],
"26rnbqkbnrppooppppooooooooooppoooooooPoBooooooooooPPPoPPPPRNoQKBNRwyyyy":[8,[52,44,null],"book"],
"ornbqkbnrppooppppooooooooooppoooooooPoBooooooPoooPPPooPPPRNoQKBNRbyyyy":[8,[1,18,null],"book"],
"orobqkbnrppooppppoonoooooooppoooooooPoBooooooPoooPPPooPPPRNoQKBNRwyyyy":[0,[62,45,null],"book"],
"orobqkbnrppooppppoonoooooooppoooooooPoBooooooPNooPPPooPPPRNoQKBoRbyyyy":[0,[6,21,null],"book"],
"orobqkborppooppppoonoonooooppoooooooPoBooooooPNooPPPooPPPRNoQKBoRwyyyy":[0,[35,26,null],"book"],
"orobqkborppooppppoonoonooooPpoooooooooBooooooPNooPPPooPPPRNoQKBoRbyyyy":[0,[12,20,null],"book"],
"ornbqkbnrppopppppoopoooooooooooooooooPoooooooooooPPPPoPPPRNBQKBNRwyyyy":[45,[51,35,null],"book"],
"35rnbqkbnrppopppppoopooooooooooooooooPPoooooooooooPPPooPPPRNBQKBNRbyyyy":[30,[11,27,null],"book"],
"27rnbqkbnrppooppppoopoooooooopoooooooPPoooooooooooPPPooPPPRNBQKBNRwyyyy":[0,[53,45,null],"book"],
"ornbqkbnrppooppppoopooooooooooooooooPpooooooooPooPPPoooPPRNBQKBNRwyyyy":[40,[45,36,null],"book"],
"ornbqkbnrppooppppoopooooooooooooooooPPoooooooooooPPPoooPPRNBQKBNRbyyyy":[30,[12,28,null],"book"],
"28rnbqkbnrppooopppoopooooooooopooooooPPoooooooooooPPPoooPPRNBQKBNRwyyyy":[30,[62,45,null],"book"],
"ornbqkbnrppooopppoopooooooooopooooooPPooooooooNooPPPoooPPRNBQKBoRbyyyy":[10,[2,38,null],"book"],
"ornoqkbnrppooopppoopooooooooopooooooPPobooooooNooPPPoooPPRNBQKBoRwyyyy":[20,[50,42,null],"book"],
"ornoqkbnrppooopppoopooooooooopooooooPPoboooPooNooPPooooPPRNBQKBoRbyyyy":[20,[6,21,null],"book"],
"ornbqkbnrppppopppoooopoooooooooooooooPoooooooooooPPPPoPPPRNBQKBNRwyyyy":[10,[51,35,null],"book"],
"35rnbqkbnrppppopppoooopooooooooooooooPPoooooooooooPPPooPPPRNBQKBNRbyyyy":[10,[11,27,null],"book"],
"27rnbqkbnrpppoopppoooopoooooopoooooooPPoooooooooooPPPooPPPRNBQKBNRwyyyy":[30,[36,28,null],"book"],
"ornbqkbnrpppoopppoooopoooooopPooooooPooooooooooooPPPooPPPRNBQKBNRbyyyy":[30,[10,26,null],"book"],
"26rnbqkbnrppooopppoooopoooooppPooooooPooooooooooooPPPooPPPRNBQKBNRwyyyy":[30,[50,42,null],"book"],
"ornbqkbnrppooopppoooopoooooppPooooooPooooooPoooooPPoooPPPRNBQKBNRbyyyy":[30,[1,18,null],"book"],
"orobqkbnrppooopppoonopoooooppPooooooPooooooPoooooPPoooPPPRNBQKBNRwyyyy":[30,[62,45,null],"book"],
"orobqkbnrppooopppoonopoooooppPooooooPooooooPooNooPPoooPPPRNBQKBoRbyyyy":[30,[3,17,null],"book"],
"orobokbnrppooopppoqnopoooooppPooooooPooooooPooNooPPoooPPPRNBQKBoRwyyyy":[30,[61,43,null],"book"],
"35rnbqkborppppppppooooonoooooooooooooPooooooooooooPPPoPPPPRNBQKBNRwyyyy":[30,[50,34,null],"book"],
"34rnbqkborppppppppooooonooooooooooooPPooooooooooooPPooPPPPRNBQKBNRbyyyy":[30,[12,20,null],"book"],
"ornbqkborppppopppoooopnooooooooooooPPooooooooooooPPooPPPPRNBQKBNRwyyyy":[30,[62,45,null],"book"],
"34rnbqkbnrppppppppooooooooooooooooooPoooooooooooooPPoPPPPPRNBQKBNRbyyyy":[10,[12,28,null],"book"],
"28rnbqkbnrppppopppoooooooooooopoooooPoooooooooooooPPoPPPPPRNBQKBNRwyyyy":[20,[57,42,null],"book"],
"ornbqkbnrppppopppoooooooooooopoooooPoooooooNoooooPPoPPPPPRoBQKBNRbyyyy":[20,[6,21,null],"book"],
"28rnbqkbnrppppopppoooooooooooopooQooooPoooooooooooPPPPoPPPRNBoKBNRbyyyy":[-30,[1,18,null],"book"],
"28rnbqkbnrppppopppoooooooooooopoooooooPooooooooNooPPPPoPPPRNBQKBoRbyyyy":[30,[1,18,null],"book"],
"ornbqkbnrpppoopppooopoooooooopoooooooPooooooooNooPPPPoPPPRNBQKBoRwyyyy":[60,[51,35,null],"book"],
"35rnbqkbnrpppoopppooopoooooooopooooooPPooooooooNooPPPooPPPRNBQKBoRbyyyy":[80,[28,35,null],"book"],
"ornbqkbnrpppoopppooopooooooooooooooopPooooooooNooPPPooPPPRNBQKBoRwyyyy":[60,[45,35,null],"book"],
"ornbqkbnrpppoopppooopoooooooooooooooNPoooooooooooPPPooPPPRNBQKBoRbyyyy":[60,[6,21,null],"book"],
"28robqkbnrppppopppoonooooooBoopoooooooPooooooooNooPPPPoPPPRNBQKooRbyyyy":[20,[6,21,null],"book"],
"26rnbqkbnrppopppppoooooooooopoooooooBoPoooooooooooPPPPoPPPRNBQKoNRbyyyy":[0,[1,18,null],"book"],
"orobqkbnrppopppppoonooooooopoooooooBoPooooooooQooPPPPoPPPRNBoKoNRbyyyy":[-80,[6,21,null],"book"],
"orobqkborppopppppoonoonoooopoooooooBoPooooooooQooPPPPoPPPRNBoKoNRwyyyy":[-80,[51,43,null],"book"],
"orobqkborppopppppoonoonoooopoooooooBoPooooooPoQooPPPooPPPRNBoKoNRbyyyy":[-80,[12,20,null],"book"],
}

let count = 0;
function iterativeDeepeningMinimax(board, whitesTurn, enPassent, blackCastle, whiteCastle, timeLimit, early=false) {
  const startTime = Date.now();
  let bestValue, bestMove, depth = 0;
  old_transpositionTable = {}
  count = 0;
  if (opening_table[hashPosition(board, whitesTurn, enPassent, blackCastle, whiteCastle)] != undefined) {
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
  if (hashOfPos in transpositionTable) {
    return [transpositionTable[hashOfPos], null];
  }
  if (depth <= 0 && originalDepth != 0) {
    let score = evaluationDepth0(board, whitesTurn, enPassent, blackCastle, whiteCastle)
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
      scoreTwo = hashPosition(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle)) in old_transpositionTable ? old_transpositionTable[hashPosition(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle))] : evaluationDepth0(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle))
      scoreOne = hashPosition(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle)) in old_transpositionTable ? old_transpositionTable[hashPosition(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle))] : evaluationDepth0(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle))
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
    transpositionTable[hashOfPos] = max;
    old_transpositionTable[hashOfPos] = max;
    return [max, bestMove];
  }
  else {
    let min = Infinity;
    let bestMove = 0;
    let allValidMoves = generateAllValidMoves(board, whitesTurn, enPassent, blackCastle, whiteCastle).sort((moveOne, moveTwo) => {
      scoreTwo = hashPosition(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle)) in old_transpositionTable ? old_transpositionTable[hashPosition(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle))] : evaluationDepth0(...movePieceAI(moveTwo, board, whitesTurn, enPassent, blackCastle, whiteCastle))
      scoreOne = hashPosition(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle)) in old_transpositionTable ? old_transpositionTable[hashPosition(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle))] : evaluationDepth0(...movePieceAI(moveOne, board, whitesTurn, enPassent, blackCastle, whiteCastle))
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
    old_transpositionTable[hashOfPos] = min;
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
    old_transpositionTable[hashOfPos] = max;
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
    old_transpositionTable[hashOfPos] = min;
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
        if (whiteCastle[0] && board[57] == null && board[58] == null && board[59] == null && !isKingInCheck) {
          array.push([56, null])
        }
        if (whiteCastle[1] && board[61] == null && board[62] == null && !isKingInCheck) {
          array.push([63, null])
        }
      }
      else {
        if (blackCastle[0] && board[1] == null && board[2] == null && board[3] == null && !isKingInCheck) {
          array.push([0, null])
        }
        if (blackCastle[1] && board[5] == null && board[6] == null && !isKingInCheck) {
          array.push([7, null])
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