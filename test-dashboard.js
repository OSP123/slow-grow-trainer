import puppeteer from 'puppeteer';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // We can just inject the HTML and CSS into a blank page to see what happens
  const html = `
    <html>
      <head>
        <style>
          :root {
            --font-head: 'NecronCrypt', 'Cinzel Decorative', 'Outfit', sans-serif;
            --font-body: 'NecronCrypt', 'Inter', sans-serif;
          }
          body[data-theme="necrons"] {
            text-transform: lowercase !important;
          }
          .terminal-communique.xenos p {
            font-family: var(--font-head) !important;
          }
          @font-face {
            font-family: 'NecronCrypt';
            src: url('fonts/Necron-Crypt.otf') format('opentype');
          }
        </style>
      </head>
      <body data-theme="necrons">
        <div class="terminal-communique xenos" id="target">
          <p>This is a test of NecronCrypt</p>
        </div>
      </body>
    </html>
  `;
  
  await page.setContent(html);
  const fontFamily = await page.evaluate(() => {
    return window.getComputedStyle(document.querySelector('#target p')).fontFamily;
  });
  console.log('Computed font family:', fontFamily);
  
  await browser.close();
})();
