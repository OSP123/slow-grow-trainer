import fitz
import re

doc = fitz.open("public/munitorum_manual.pdf")
out_lines = []

for page in doc:
    blocks = page.get_text("blocks")
    text_blocks = [b for b in blocks if b[6] == 0]
    
    # Check average width to find midpoint if needed, but 300 is usually fine for A4
    left_blocks = [b for b in text_blocks if b[0] < 300]
    right_blocks = [b for b in text_blocks if b[0] >= 300]
    
    left_blocks.sort(key=lambda b: b[1])
    right_blocks.sort(key=lambda b: b[1])
    
    for b in left_blocks:
        out_lines.append(b[4].strip())
    for b in right_blocks:
        out_lines.append(b[4].strip())

# Look for the Legends field manual start
lines = []
for block in out_lines:
    lines.extend([L.strip() for L in block.split('\n')])

in_legends = False
factions = set()

for line in lines:
    if line == "LEGENDS FIELD MANUAL":
        in_legends = True
        
    if in_legends and line == line.upper() and len(line) > 3 and not "PTS" in line.upper() and not "MODELS" in line.upper() and not "MODEL" in line.upper():
        factions.add(line)

print("Possible legends factions found:")
for f in sorted(factions):
    print(" - " + f)
