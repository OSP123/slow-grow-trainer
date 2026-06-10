import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    await page.type('input[type="email"]', 'e2e_test_user@example.com');
    await page.type('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    await new Promise(r => setTimeout(r, 2000));
    
    const errorText = await page.evaluate(() => {
        const el = document.querySelector('.card > div');
        return el ? el.textContent : null;
    });
    
    console.log("Error text:", errorText);
    await browser.close();
})();
