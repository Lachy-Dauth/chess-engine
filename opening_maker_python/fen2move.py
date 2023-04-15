
from stockfish import Stockfish
stockfish = Stockfish("/opt/homebrew/bin/stockfish", parameters={"Threads": 4})

fen_dict = {}

move = 'e2e4'
result = [ord(move[0]) - 97 + (8 - int(move[1]) * 8), ord(move[2]) - 97 + (8 - int(move[3]) * 8)]
print(ord(move[0]) - 97, ((8 - int(move[1])) * 8), ord(move[2]) - 97, ((8 - int(move[3])) * 8), result)

with open("./book.csv", "w") as bookfile:
  bookfile.write("{\n")
  with open("./fens2.csv", "r") as fenfile:
      fen_list = fenfile.readlines()
      fen_list = [fen[0:-1] for fen in fen_list]
      for fen in fen_list:
          stockfish.set_fen_position(fen)
          eval = stockfish.get_top_moves(1)[0]
          if eval["Centipawn"] != None:
              fen_dict[fen] = [eval["Move"], eval["Centipawn"], "book"]
              move = eval["Move"]
              result = [ord(move[0]) - 97 + ((8 - int(move[1])) * 8), ord(move[2]) - 97 + ((8 - int(move[3])) * 8)]
              bookfile.write('"' + fen + '" : [' + str(eval["Centipawn"]) + "," + str(result)[0:-1] + ', null], "book"],\n')
  bookfile.write("}")
