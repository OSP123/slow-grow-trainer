const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('public/11th-munitorum-field-manual/Warhammer 40,000_ Munitorum Field Manual_Astra_Militarum.html', 'utf8');
const $ = cheerio.load(html);

// Step 1: Resolve all React Suspense templates
$('script').each((i, el) => {
  const scriptContent = $(el).html();
  if (scriptContent && scriptContent.includes('$RS(')) {
    const match = scriptContent.match(/\$RS\("([^"]+)","([^"]+)"\)/);
    if (match) {
      const sourceId = match[1];
      const targetId = match[2];
      const sourceContent = $(`[id="${sourceId}"]`).html();
      const targetElement = $(`[id="${targetId}"]`);
      if (sourceContent && targetElement.length > 0) {
        targetElement.replaceWith(sourceContent);
      }
    }
  }
});

// Let's test finding a unit: Tempestus Scions
const unitDiv = $('div.bg-slate-500:contains("TEMPESTUS SCIONS")').closest('.flex-col');
console.log("Found Tempestus Scions div:", unitDiv.length);
if (unitDiv.length > 0) {
  unitDiv.find('.space-y-1').each((i, el) => {
    const header = $(el).find('div.bg-slate-200').text().trim();
    if (header) {
      console.log("Tier:", header);
      $(el).find('ul.leaders li').each((j, li) => {
        console.log("  -", $(li).text().trim());
      });
    }
  });
}
