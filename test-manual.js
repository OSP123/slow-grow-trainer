import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

(async () => {
    // 1. Start server
    const server = spawn('npm', ['run', 'dev'], { detached: true, stdio: 'ignore' });
    await new Promise(r => setTimeout(r, 5000));

    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        
        // 2. Mock Supabase Auth network requests
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (req.url().includes('/auth/v1/token')) {
                req.respond({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        access_token: 'mock-token',
                        token_type: 'bearer',
                        expires_in: 3600,
                        refresh_token: 'mock-refresh',
                        user: { id: 'mock-user-id', email: 'test@example.com' }
                    })
                });
            } else if (req.url().includes('/auth/v1/user')) {
                 req.respond({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ id: 'mock-user-id', email: 'test@example.com' })
                });
            } else {
                req.continue();
            }
        });

        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
        
        // Try login
        await page.type('input[type="email"]', 'test@example.com');
        await page.type('input[type="password"]', 'password');
        await page.click('button[type="submit"]');

        await new Promise(r => setTimeout(r, 2000));
        
        // If login failed, it will show an error. Let's log it.
        const errorText = await page.evaluate(() => {
            const el = document.querySelector('.card > div');
            return el ? el.textContent : null;
        });
        if (errorText) console.log("Login Error:", errorText);

        const url = page.url();
        console.log("Current URL:", url);

        await browser.close();
    } finally {
        process.kill(-server.pid);
    }
})();
