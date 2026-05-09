import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('requestfailed', request => console.log('BROWSER REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto('http://localhost:8081/');
  
  // Wait for menu
  await page.waitForSelector('canvas', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 4000));
  
  console.log('Clicking to enter level select...');
  // Click center of screen roughly to hit "JUGAR"
  await page.mouse.click(480, 270);
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking level 1...');
  await page.mouse.click(400, 250);
  await new Promise(r => setTimeout(r, 5000));

  await browser.close();
})();
