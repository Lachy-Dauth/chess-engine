function findValidMoves(board, selected, enPassent, blackCastle, whiteCastle) {
  let file = selected%8;
  let rank = Math.floor(selected/8);
  let array = [];
  let colourSel = isCapitalLetter(board[selected]);
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
        if (whiteCastle[0] && board[57] == null && board[58] == null && board[59] == null) {
          array.push([56, null])
        }
        if (whiteCastle[1] && board[61] == null && board[62] == null) {
          array.push([63, null])
        }
      }
      else {
        if (blackCastle[0] && board[1] == null && board[2] == null && board[3] == null) {
          array.push([0, null])
        }
        if (blackCastle[1] && board[5] == null && board[6] == null) {
          array.push([7, null])
        }
      }
      break;
    case "p":
      let promotions = ["q", "n", "b", "c"]
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
      if (colourSel !== isCapitalLetter(board[selected + 9]) && (isCapitalLetter(board[selected + 9]) != null || selected - 1 == enPassent)) {
        if (rank == 6) {
          for (let i = 0; i < promotions.length; i++) {
            array.push([selected + 9, promotions[i]]);
          }
        }
        else {
          array.push([selected + 9, null]);
        }
      }
      if (colourSel !== isCapitalLetter(board[selected + 7]) && (isCapitalLetter(board[selected + 7]) != null || selected + 1 == enPassent)) {
        if (rank == 6) {
          for (let i = 0; i < promotions.length; i++) {
            array.push([selected + 7, promotions[i]]);
          }
        }
        else {
          array.push([selected + 7, null]);
        }
      }
      if (rank == 1 && isCapitalLetter(board[selected + 16]) == null) {
        array.push([selected + 16, null]);
      }
      break;
    case "P":
      let promotionsW = ["Q", "N", "B", "C"];
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
      if (colourSel !== isCapitalLetter(board[selected - 9]) && (isCapitalLetter(board[selected - 9]) != null || selected - 1 == enPassent)) {
        if (rank == 1) {
          for (let i = 0; i < promotionsW.length; i++) {
            array.push([selected - 9, promotionsW[i]]);
          }
        }
        else {
          array.push([selected - 9, null]);
        }
      }
      if (colourSel !== isCapitalLetter(board[selected - 7]) && (isCapitalLetter(board[selected - 7]) != null || selected + 1 == enPassent)) {
        if (rank == 1) {
          for (let i = 0; i < promotionsW.length; i++) {
            array.push([selected - 7, promotionsW[i]]);
          }
        }
        else {
          array.push([selected - 7, null]);
        }
      }
      if (rank == 6 && isCapitalLetter(board[selected - 16]) == null) {
        array.push([selected - 16, null]);
      }
      break;
  }
  return array.filter(move => move[0] >= 0 && move[0] < 64);
}