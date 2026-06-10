with open('public/munitorum_layout.txt') as f:
    lines = f.readlines()

for line in lines[50:100]:
    print(line.rstrip('\n'))
