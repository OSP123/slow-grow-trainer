const fs = require('fs');

// 1. Fix index.css
let indexCss = fs.readFileSync('src/index.css', 'utf8');
indexCss = indexCss.replace(
  "--font-body: 'Inter', sans-serif;\n}",
  "--font-body: 'Inter', sans-serif;\n  --font-title: var(--font-head);\n}"
);
fs.writeFileSync('src/index.css', indexCss);

// 2. Fix App.css
let appCss = fs.readFileSync('src/App.css', 'utf8');
appCss = appCss.replace(
  ".faction-header h1 {\n  font-size: 2.5rem;",
  ".faction-header h1 {\n  font-family: var(--font-title);\n  font-size: 2.5rem;"
);
fs.writeFileSync('src/App.css', appCss);

// 3. Fix themes.css
let themesCss = fs.readFileSync('src/styles/themes.css', 'utf8');
themesCss = themesCss.replace(
  /--font-head:\s*'ZeusBorne',\s*'Creepster',\s*'Outfit',\s*sans-serif;/g,
  "--font-head: 'ZarathustraBleeds', 'Inter', sans-serif;\n  --font-title: 'ZeusBorne', 'Creepster', 'Outfit', sans-serif;"
);
themesCss = themesCss.replace(
  /--font-head:\s*'ZeusBorne',\s*'Cinzel Decorative',\s*'Outfit',\s*sans-serif;/g,
  "--font-head: 'ZarathustraBleeds', 'Inter', sans-serif;\n  --font-title: 'ZeusBorne', 'Cinzel Decorative', 'Outfit', sans-serif;"
);
themesCss = themesCss.replace(
  /--font-head:\s*'ZeusBorne',\s*'Black Ops One',\s*'Outfit',\s*sans-serif;/g,
  "--font-head: 'ZarathustraBleeds', 'Inter', sans-serif;\n  --font-title: 'ZeusBorne', 'Black Ops One', 'Outfit', sans-serif;"
);

// Remove the block I added previously
const blockToRemove = `/* Chaos sub-header font overrides for legibility */
[data-theme="chaos"] :is(h2, h3, h4, h5, h6),
[data-theme="chaos_space_marines"] :is(h2, h3, h4, h5, h6),
[data-theme="death_guard"] :is(h2, h3, h4, h5, h6),
[data-theme="thousand_sons"] :is(h2, h3, h4, h5, h6),
[data-theme="world_eaters"] :is(h2, h3, h4, h5, h6),
[data-theme="chaos_daemons"] :is(h2, h3, h4, h5, h6),
[data-theme="chaos_knights"] :is(h2, h3, h4, h5, h6) {
  font-family: var(--font-body);
}

`;
themesCss = themesCss.replace(blockToRemove, "");

fs.writeFileSync('src/styles/themes.css', themesCss);
