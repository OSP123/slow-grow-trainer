import fitz

doc = fitz.open("public/munitorum_manual.pdf")
out_lines = []

for page_num, page in enumerate(doc):
    blocks = page.get_text("blocks")
    text_blocks = [b for b in blocks if b[6] == 0]
    
    left_blocks = [b for b in text_blocks if b[0] < 300]
    right_blocks = [b for b in text_blocks if b[0] >= 300]
    
    left_blocks.sort(key=lambda b: b[1])
    right_blocks.sort(key=lambda b: b[1])
    
    for b in left_blocks:
        out_lines.append(f"PG{page_num}_L: " + b[4].strip().replace('\n', ' || '))
    for b in right_blocks:
        out_lines.append(f"PG{page_num}_R: " + b[4].strip().replace('\n', ' || '))

with open("public/munitorum_blocks_debug.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))
