with open('public/munitorum_layout.txt') as f:
    text = f.read()

pages = text.split('\x0c')
linear_lines = []

for page in pages:
    lines = page.split('\n')
    left_col = []
    right_col = []
    for line in lines:
        left = line[:80].rstrip()
        right = line[80:].rstrip()
        
        # Keep empty lines to preserve spacing
        left_col.append(left)
        if right:
            right_col.append(right)
        elif left.strip() == '':
            right_col.append('')
            
    linear_lines.extend(left_col)
    linear_lines.extend(right_col)

with open('public/munitorum_perfect_linear.txt', 'w') as f:
    f.write('\n'.join(linear_lines))
    
print("Done. Wrote perfect linear file.")
