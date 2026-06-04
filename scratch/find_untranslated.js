import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log('Navigating to http://localhost:5174...');
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
  
  // Set theme to tau in localStorage and reload
  await page.evaluate(() => {
    localStorage.setItem('theme', 'tau');
  });
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 1000));
  
  const result = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.nodeValue.trim() !== '') {
        textNodes.push(node);
      }
    }
    
    const issues = [];
    
    for (const textNode of textNodes) {
      const parent = textNode.parentElement;
      if (!parent) continue;
      if (parent.closest('style, script, noscript')) continue;
      
      const computed = window.getComputedStyle(parent);
      const isAlienFont = computed.fontFamily.includes('Tau40k');
      
      let afterContent = window.getComputedStyle(parent, '::after').content;
      if (afterContent === 'none') {
        const closest = parent.closest('[data-text]');
        if (closest) {
           afterContent = window.getComputedStyle(closest, '::after').content;
        }
      }

      if (isAlienFont && afterContent === 'none') {
        issues.push({
          text: textNode.nodeValue.trim(),
          parentTag: parent.tagName,
          parentClass: parent.className,
          closestDataText: parent.closest('[data-text]')?.getAttribute('data-text') || null
        });
      }
    }

    // Also check inputs and placeholders
    const inputs = Array.from(document.querySelectorAll('input, select, textarea, option'));
    for (const input of inputs) {
      const computed = window.getComputedStyle(input);
      const isAlienFont = computed.fontFamily.includes('Tau40k');
      if (isAlienFont) {
        issues.push({
          text: input.value || input.placeholder || input.textContent,
          parentTag: input.tagName,
          parentClass: input.className,
          issue: 'Input field uses alien font but cannot use ::after translation'
        });
      }
    }

    return { issues };
  });

  console.log(JSON.stringify(result, null, 2));
  
  await browser.close();
  process.exit(0);
})();
