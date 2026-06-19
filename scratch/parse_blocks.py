import fitz

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

with open("public/munitorum_blocks.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))

print("Done generating blocks.")
