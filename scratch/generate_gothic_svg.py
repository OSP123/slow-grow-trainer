import math

svg = []
svg.append('<?xml version="1.0" encoding="utf-8"?>')
svg.append('<svg width="90" height="90" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">')

# Background
# svg.append('<rect width="90" height="90" fill="transparent"/>')

# Dark metal base border
svg.append('<rect x="2" y="2" width="86" height="86" fill="none" stroke="#1c1c1c" stroke-width="4"/>')
svg.append('<rect x="5" y="5" width="80" height="80" fill="none" stroke="#3a3a3a" stroke-width="2"/>')

# Brass inner frame
svg.append('<rect x="12" y="12" width="66" height="66" fill="none" stroke="#a3883a" stroke-width="2"/>')
svg.append('<rect x="15" y="15" width="60" height="60" fill="none" stroke="#5a4918" stroke-width="1"/>')

# Corners (30x30)
def corner(x, y, rotation):
    return f"""
    <g transform="translate({x},{y}) rotate({rotation})">
        <!-- Structural corner block -->
        <path d="M 0 0 L 25 0 L 25 5 L 12 12 L 5 25 L 0 25 Z" fill="#252525" stroke="#444" stroke-width="1"/>
        <!-- Inner skull/rivet housing -->
        <circle cx="10" cy="10" r="5" fill="#111" stroke="#888" stroke-width="1"/>
        <circle cx="10" cy="10" r="2" fill="#5a4918"/>
        <!-- Diagonal support beam -->
        <path d="M 25 0 L 30 0 L 30 5 Z" fill="#444"/>
    </g>
    """

svg.append(corner(0, 0, 0)) # Top Left
svg.append(corner(90, 0, 90)) # Top Right
svg.append(corner(90, 90, 180)) # Bottom Right
svg.append(corner(0, 90, 270)) # Bottom Left

# Edges (repeating 30px segments)
# We draw one 30px segment in the middle (30 to 60) for each edge
# Top Edge Gothic Arch
svg.append('<path d="M 30 12 C 35 12 40 18 45 22 C 50 18 55 12 60 12" fill="none" stroke="#a3883a" stroke-width="1.5"/>')
svg.append('<path d="M 30 5 L 45 10 L 60 5" fill="none" stroke="#3a3a3a" stroke-width="2"/>')
svg.append('<circle cx="45" cy="15" r="1.5" fill="#1c1c1c"/>')

# Bottom Edge Gothic Arch
svg.append('<path d="M 30 78 C 35 78 40 72 45 68 C 50 72 55 78 60 78" fill="none" stroke="#a3883a" stroke-width="1.5"/>')
svg.append('<path d="M 30 85 L 45 80 L 60 85" fill="none" stroke="#3a3a3a" stroke-width="2"/>')
svg.append('<circle cx="45" cy="75" r="1.5" fill="#1c1c1c"/>')

# Left Edge Gothic Arch
svg.append('<path d="M 12 30 C 12 35 18 40 22 45 C 18 50 12 55 12 60" fill="none" stroke="#a3883a" stroke-width="1.5"/>')
svg.append('<path d="M 5 30 L 10 45 L 5 60" fill="none" stroke="#3a3a3a" stroke-width="2"/>')
svg.append('<circle cx="15" cy="45" r="1.5" fill="#1c1c1c"/>')

# Right Edge Gothic Arch
svg.append('<path d="M 78 30 C 78 35 72 40 68 45 C 72 50 78 55 78 60" fill="none" stroke="#a3883a" stroke-width="1.5"/>')
svg.append('<path d="M 85 30 L 80 45 L 85 60" fill="none" stroke="#3a3a3a" stroke-width="2"/>')
svg.append('<circle cx="75" cy="45" r="1.5" fill="#1c1c1c"/>')

svg.append('</svg>')

with open('public/gothic-border.svg', 'w') as f:
    f.write('\n'.join(svg))

print("Created public/gothic-border.svg")
