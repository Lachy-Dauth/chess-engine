import chess
import chess.pgn
import io

fens = []

def pgn_to_fen(pgn_string):
    """
    Converts a PGN string to FEN format.

    Args:
        pgn (str): PGN string.

    Returns:
        str: FEN string.
    """

    # Create a chess board
    board = chess.Board()

    # Load the PGN string
    pgn = io.StringIO(pgn_string)
    game = chess.pgn.read_game(pgn)
    
    fen = board.fen()
    fen = " ".join(fen.split(" ")[:4])
    if fen not in fens:
        fens.append(fen)

    for move in game.mainline_moves():
        board.push(move)
        fen = board.fen()
        fen = " ".join(fen.split(" ")[:4])
        if fen not in fens:
            fens.append(fen)


    # Get the FEN representation
    fen = board.fen()
    fen = " ".join(fen.split(" ")[:4])

    return fen

with open("./eco2.csv", "r") as ecofile:
    eco_list = ecofile.readlines()
    eco_list = [eco[0:-1] for eco in eco_list]
    for eco in eco_list:
        pgn_to_fen(eco)

with open("./eco.csv", "r") as ecofile:
    eco_list = ecofile.readlines()
    eco_list = [eco[0:-1] for eco in eco_list]
    for eco in eco_list:
        pgn_to_fen(eco)

with open("./fens2.csv", "w") as fenfile:
    for fen in fens:
        fenfile.write(fen + "\n")