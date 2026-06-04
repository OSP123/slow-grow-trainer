import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log('Navigating to http://localhost:5174...');
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
  
  // Set theme to tau by selecting from the dropdown
  await page.select('#theme-select', 'tau');
  
  // Give mutation observer a moment
  await new Promise(r => setTimeout(r, 1000));
  
  // Dump text elements
  const result = await page.evaluate(() => {
    const navItems = Array.from(document.querySelectorAll('.nav-item'));
    const texts = Array.from(document.querySelectorAll('h1, p, .nav-item'));
    return texts.map(el => {
      const computed = window.getComputedStyle(el);
      const afterComputed = window.getComputedStyle(el, '::after');
      return {
        className: el.className,
        text: el.textContent.trim(),
        dataText: el.getAttribute('data-text'),
        fontFamily: computed.fontFamily,
        afterContent: afterComputed.content,
        afterDisplay: afterComputed.display,
        afterFontFamily: afterComputed.fontFamily,
      };
    }).filter(x => x.text && x.text.length > 0);
  });

  console.log(JSON.stringify(result, null, 2));
  
  await browser.close();
  process.exit(0);
})();
