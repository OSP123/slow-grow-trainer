import puppeteer from 'puppeteer';
import { createServer } from 'http';

const html = `
<!DOCTYPE html>
<html>
<head>
<style>
  :root { --my-font: 'Arial', sans-serif; }
  .test { font-family: var(--my-font); }
</style>
</head>
<body>
  <div id="test1" class="test">Hello CSS</div>
  <div id="test2" style="font-family: var(--my-font);">Hello Inline</div>
</body>
</html>
`;

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

server.listen(3000, async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  
  const font1 = await page.evaluate(() => window.getComputedStyle(document.getElementById('test1')).fontFamily);
  const font2 = await page.evaluate(() => window.getComputedStyle(document.getElementById('test2')).fontFamily);
  
  console.log('CSS class font:', font1);
  console.log('Inline style font:', font2);
  
  await browser.close();
  server.close();
});
