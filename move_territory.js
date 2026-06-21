const fs = require('fs');
let code = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

// Find the Territory Detail Panel
const startMarker = "      {/* Territory Detail Panel below Globe */}\n      {selectedTheatre && (";
const endMarker = "      )}\n    </div>\n  );\n}";

const startIndex = code.indexOf("      {/* Territory Detail Panel below Globe */}");
const endIndex = code.lastIndexOf("      )}\n    </div>\n  );\n}"); // wait, the panel ends at "      )}\n" right before "    </div>\n  );\n}"

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find markers", startIndex, endIndex);
  process.exit(1);
}

// The block to extract
const blockEndIndex = code.indexOf("      )}\n", startIndex) + "      )}\n".length;
const block = code.slice(startIndex, blockEndIndex);

// Remove the block from its original position
code = code.slice(0, startIndex) + code.slice(blockEndIndex);

// Find the insertion point, which is after:
//         )}
//       </div>
//
//       <div className="card">
//         <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--theme-border)', paddingBottom: '0.5rem', color: 'var(--theme-accent)' }}>Forces Deployed</h2>

const insertMarker = "        )}\n      </div>\n\n      <div className=\"card\">\n        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--theme-border)', paddingBottom: '0.5rem', color: 'var(--theme-accent)' }}>Forces Deployed</h2>";
const insertIndex = code.indexOf(insertMarker);

if (insertIndex === -1) {
  console.log("Could not find insert point");
  process.exit(1);
}

// Insert the block, with a newline before the next card
const newInsertMarker = "        )}\n      </div>\n\n" + block + "\n      <div className=\"card\">\n        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--theme-border)', paddingBottom: '0.5rem', color: 'var(--theme-accent)' }}>Forces Deployed</h2>";

code = code.replace(insertMarker, newInsertMarker);

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', code);
console.log("Moved successfully.");
