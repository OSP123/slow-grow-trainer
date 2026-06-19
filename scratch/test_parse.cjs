const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('public/11th-munitorum-field-manual/Warhammer 40,000_ Munitorum Field Manual_Blood_Angels.html', 'utf8');
const $ = cheerio.load(html);

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

let unitsCards = [];
$('h3.text-4xl.font-header').each((i, el) => {
  if ($(el).text().trim() === 'UNITS') {
    const grid = $(el).nextAll('div').first().find('div.flex.flex-col.space-y-1.m-1');
    if (grid.length === 0) {
      $(el).parent().find('div.flex.flex-col.space-y-1.m-1').each((j, card) => unitsCards.push(card));
    } else {
      grid.each((j, card) => unitsCards.push(card));
    }
  }
});

if (unitsCards.length === 0) {
  $('div.flex.flex-col.space-y-1.m-1').each((i, el) => {
      if ($(el).find('div.bg-slate-500').length > 0) unitsCards.push(el);
  });
}

const units = [];
for (const card of unitsCards) {
  let unitName = $(card).find('div.bg-slate-500').first().text().trim();
  if (unitName) {
    let pts = $(card).find('span').last().text().trim();
    units.push({name: unitName, pts});
  }
}

console.log(`Found ${units.length} units in Blood Angels.`);
console.log(units.filter(u => u.name.toLowerCase().includes('assault')));
