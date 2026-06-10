import fitz

doc = fitz.open("public/munitorum_manual.pdf")
out_lines = []

for page in doc:
    blocks = page.get_text("blocks")
    text_blocks = [b for b in blocks if b[6] == 0]
    
    left_blocks = [b for b in text_blocks if b[0] < 300]
    right_blocks = [b for b in text_blocks if b[0] >= 300]
    
    left_blocks.sort(key=lambda b: b[1])
    right_blocks.sort(key=lambda b: b[1])
    
    for b in left_blocks:
        out_lines.append(b[4].strip())
    for b in right_blocks:
        out_lines.append(b[4].strip())

lines = []
for block in out_lines:
    lines.extend([L.strip() for L in block.split('\n')])

in_legends = False
legend_units = []

for line in lines:
    if line == "LEGENDS FIELD MANUAL":
        in_legends = True
        
    if in_legends:
        if "pts" in line.lower() and not "model" in line.lower():
            # Check previous line to see what unit this is
            if len(legend_units) > 0:
                pass
        elif "models" in line.lower() or "model" in line.lower():
            pass
        else:
            if line and len(line) > 3 and not line.isupper():
                legend_units.append(line)

print(f"Total potential units in Legends section: {len(legend_units)}")
print("Sample legends units:")
print(legend_units[:20])

