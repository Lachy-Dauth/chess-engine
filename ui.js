const chessBoard = document.querySelector(".chess-board");
const promotionOptionsUI = document.querySelector(".promotion-options-container");
const evaluationNumberUI = document.querySelector(".evaluation");
const moveUI = document.querySelector(".move");
const dephtUI = document.querySelector(".depth");
const moveNowBtn = document.getElementById("move-now");
let worker = new Worker('./workerEvaluation.js');
// const cpValueIn = document.getElementById("cp-book-move-value");
// const bookMoveAddBtn = document.getElementById("add-book-move-value");
// const copyBook = document.getElementById("copy-book-moves");

let tempBook = {};

const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
// const fen = '8/8/N3Ppk1/PB1p4/3K1Q2/8/8/6n1';
let board = fenToBoard(fen);
const pieces = {
  'P': '\u2659',
  'R': '\u2656',
  'N': '\u2658',
  'B': '\u2657',
  'Q': '\u2655',
  'K': '\u2654',
  'p': '\u265F',
  'r': '\u265C',
  'n': '\u265E',
  'b': '\u265D',
  'q': '\u265B',
  'k': '\u265A'
};
let selected = null;
let validMoves = [];
let validMovesInfo = [];
let whitesTurn = true;
let enPassent = null;
let whiteCastle = [true, true];
let blackCastle = [true, true];
// let whiteCastle = [false, false];
// let blackCastle = [false, false];
let promotion = null;
let promotionOptions = ["q", "n", "b", "r"]
let moved = [];

let moveForBook = [];

let previousPositions = [hashPosition(board, whitesTurn, enPassent, blackCastle, whiteCastle)]

let aiEval = false;

console.log(board);

function makeGrid() {
  chessBoard.innerHTML = "";

  for (let i = 0; i < 64; i++) {
    const square = document.createElement("div");

    if (board[i] != null) {
      square.innerHTML = pieces[board[i]];
    }
  
    // add class for css styling
    square.classList.add("square");
    // add data tag for indexing the squares
    square.setAttribute('data-square-num', i);

    // Make square light or dark
    if ((i + Math.floor(i/8))%2 == 0){
      square.classList.add("light");
    }
    else {
      square.classList.add("dark");
    }

    if (selected == i) {
      square.classList.add("selected");
    }
    if (aiEval !== false && aiEval[1] != null && aiEval[1].includes(i)) {
      square.classList.add("aiMove");
    }
    else if (validMoves.includes(i)) {
      square.classList.add("valid");
    }
    else if (moved.includes(i)) {
      square.classList.add("moved");
    }

    // add function to check and respond to the square being clicked
    square.addEventListener("click", e => {
      if (promotion == null) {
        let squareNum = Number(e.target.getAttribute('data-square-num'));
        if (selected == squareNum) {
          selected = null;
        }
        else if (selected != null && validMoves.includes(squareNum)) {
          movePiece(selected, squareNum);
          selected = null;
        }
        else if (isCapitalLetter(board[squareNum]) === whitesTurn) {
          selected = squareNum;
        }
        validMovesInfo = findValidMoves(board, selected, whitesTurn, enPassent, blackCastle, whiteCastle);
        validMoves = validMovesInfo.map(move => move[1])
        makeGrid();
      }
    });

    square.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      let squareNum = Number(e.target.getAttribute('data-square-num'));
      if (selected != null && validMoves.includes(squareNum)) {
        moveForBook = [selected, squareNum, null]
        selected = null;
      }
      validMoves = validMovesInfo.map(move => move[1])
      makeGrid();
    });

    chessBoard.appendChild(square); // places the cell
  }
  
  promotionOptionsUI.innerHTML = "";
  for (let i = 0; i < promotionOptions.length; i++) {
    const square = document.createElement("div");

    square.innerHTML = pieces[promotionOptions[i]];

    // add class for css styling
    square.classList.add("square");

    square.setAttribute('data-piece', promotionOptions[i]);

    if (i%2 == 0){
      square.classList.add("light");
    }
    else {
      square.classList.add("dark");
    }

    if (promotion == null) {
      square.classList.add("unactive");
    }
    else {
      square.addEventListener("click", e => {
        if (board[promotion] == "p") {
          board[promotion] = e.target.getAttribute("data-piece");
        }
        else {
          board[promotion] = e.target.getAttribute("data-piece").toUpperCase();
        }
        whitesTurn = !whitesTurn;
        promotion = null;
        validMoves = []
        aiEval = false
        previousPositions.push(hashPosition(board, whitesTurn, enPassent, blackCastle, whiteCastle))
        makeGrid();
      })
    }

    promotionOptionsUI.appendChild(square);
  }
  moveNowBtn.disabled = aiEval === false;
  if (aiEval == false) {
    worker.terminate()
    worker = new Worker('./workerEvaluation.js');
    
    worker.addEventListener('message', (message) => {
      if (message.data[0] == "check-in") {
        console.log("check-in")
      }
      else if (message.data[0] == "final") {
        aiEval = message.data[1];
        moveNow();
      }
      else if (message.data[0] == "early") {
        aiEval = message.data[1];
        makeGrid();
      }
    });

    worker.postMessage({
      command: 'evaluate-early',
      board: board,
      whitesTurn: whitesTurn,
      enPassent: enPassent,
      blackCastle: blackCastle,
      whiteCastle: whiteCastle,
      timeLimit: Infinity,
      previousPositions: previousPositions,
    });
  }
  else {
    evaluationNumberUI.innerHTML = "Eval: "
    if (aiEval[0] == 1000000000) {
      aiEval[0] = "M" + String((aiEval[2]) / 2)
      evaluationNumberUI.innerHTML += aiEval[0]
    }
    else if (aiEval[0] == -1000000000) {
      aiEval[0] = "-M" + String((aiEval[2]) / 2)
      evaluationNumberUI.innerHTML += aiEval[0]
    }
    else {
      evaluationNumberUI.innerHTML += aiEval[0] / 100;
    }
    moveUI.innerHTML = "Move: " + String.fromCharCode(97 + aiEval[1][0]%8) + String(8 - Math.floor(aiEval[1][0]/8)) + String.fromCharCode(97 + aiEval[1][1]%8) + String(8 - Math.floor(aiEval[1][1]/8))
    dephtUI.innerHTML = "Depth: " + aiEval[2];
  }
  // bookMoveAddBtn.disabled = opening_table[hashPosition(board, whitesTurn, enPassent, blackCastle, whiteCastle)] != undefined
}
makeGrid();

function moveNow() {
  worker.terminate()
  worker = new Worker('./workerEvaluation.js');
  
  worker.addEventListener('message', (message) => {
    if (message.data[0] == "check-in") {
      console.log("check-in")
    }
    else if (message.data[0] == "final") {
      aiEval = message.data[1];
      moveNow();
    }
    else if (message.data[0] == "early") {
      aiEval = message.data[1];
      makeGrid();
    }
  });
  if (aiEval !== false) {
    let eval = aiEval;
    moved = [eval[1][0], eval[1][1]] 
    console.log(eval[2])
    let newPositionInfo = movePieceAI(eval[1], board, whitesTurn, enPassent, blackCastle, whiteCastle);
    board = newPositionInfo[0];
    whitesTurn = newPositionInfo[1];
    enPassent = newPositionInfo[2];
    blackCastle = newPositionInfo[3];
    whiteCastle = newPositionInfo[4];
    previousPositions.push(hashPosition(board, whitesTurn, enPassent, blackCastle, whiteCastle))
    aiEval = false;
    console.log(aiEval)
    makeGrid();
  }
}

worker.addEventListener('message', (message) => {
  if (message.data[0] == "check-in") {
    console.log("check-in")
  }
  else if (message.data[0] == "final") {
    aiEval = message.data[1];
    moveNow();
  }
  else if (message.data[0] == "early") {
    aiEval = message.data[1];
    makeGrid();
  }
});

function movePiece(startingPos, endingPos) {
  if (board[startingPos] == "p" || board[startingPos] == "P") {
    if (startingPos%8 != endingPos%8 && board[endingPos] == null) {
      board[enPassent] = null;
    }
    enPassent = null;
    if (Math.abs(Math.floor(startingPos/8) - Math.floor(endingPos/8)) == 2) {
      enPassent = endingPos;
    }
    if (Math.floor(endingPos/8) == 0 || Math.floor(endingPos/8) == 7) {
      promotion = endingPos;
    }
  }
  else if (board[startingPos] == "k") {
    blackCastle = [false, false];
    enPassent = null;
  }
  else if (board[startingPos] == "K") {
    whiteCastle = [false, false];
    enPassent = null;
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
  if (promotion == null) {
    whitesTurn = !whitesTurn;
    aiEval = false;
    previousPositions.push(hashPosition(board, whitesTurn, enPassent, blackCastle, whiteCastle))
  }
}

function fenToBoard(fen) {
  let board = [];
  let ranks = fen.split('/');

  // Loop through each rank in the fen string
  for (let i = 0; i < ranks.length; i++) {
    let rank = ranks[i];
    let row = [];

    // Loop through each character in the rank
    for (let j = 0; j < rank.length; j++) {
      let char = rank.charAt(j);

      // If the character is a number, add that many empty squares
      if (!isNaN(char)) {
        for (let k = 0; k < parseInt(char); k++) {
          row.push(null);
        }
      }
      // Otherwise, add the piece represented by the character
      else {
        row.push(char);
      }
    }

    board = [...board, ...row];
  }

  return board;
}

function isCapitalLetter(char) {
  return char == null ? null : char === char.toUpperCase();
}