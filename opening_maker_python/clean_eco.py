move_lst = []

with open("./scid.eco", "r") as scid:
    scid_list = scid.read().replace("\n", "").split("*")
    scid_list = [scid.split('"')[-1] for scid in scid_list]
    for scid in scid_list:
        move_lst.append(scid)

print(move_lst[0:10])

with open("./eco2.csv", "w") as ecofile:
    for move in move_lst:
        ecofile.write(move + "\n")