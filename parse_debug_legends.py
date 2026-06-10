import re

with open('public/munitorum_blocks.txt', 'r') as f:
    text = f.read()

lines = [L.strip() for L in text.split('\n')]

in_legends = False
legend_units_pts = []

for idx, line in enumerate(lines):
    if line == "LEGENDS FIELD MANUAL":
        in_legends = True
    
    if in_legends:
        pts_match = re.search(r'(\d+)\s*pts\s*$', line)
        if pts_match:
            # check if it has a model count
            model_match = re.search(r'^\d+\s+models?\b', line, re.IGNORECASE)
            if model_match:
                # the PREVIOUS line is the unit name!
                if idx > 0:
                    unit_name = lines[idx-1]
                    legend_units_pts.append(f"{unit_name}: {line}")

print(f"Total found in python debug: {len(legend_units_pts)}")
print("First 20:")
for x in legend_units_pts[:20]:
    print(x)

