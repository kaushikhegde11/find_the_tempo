import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(30000);

const errors = [];
const networkReqs = [];
page.on('console', msg => {
  if (msg.type() === 'error' && !msg.text().includes('webpack-hmr')) {
    errors.push(msg.text());
  }
  if (msg.type() === 'log' || msg.type() === 'warn') {
    console.log('[browser]', msg.text());
  }
});
page.on('request', req => {
  if (req.url().includes('/api/')) networkReqs.push({ url: req.url(), method: req.method() });
});
page.on('response', res => {
  if (res.url().includes('/api/')) {
    console.log(`[network] ${res.status()} ${res.url()}`);
  }
});

await page.goto('http://127.0.0.1:3000/upload', { waitUntil: 'domcontentloaded', timeout: 15000 });
await page.waitForSelector('input[type="file"]', { state: 'attached' });
console.log('Page loaded, file input found');

// Use setInputFiles and wait for state change (ProcessingState or navigation)
const [fileChooser] = await Promise.all([
  page.waitForFileChooser({ timeout: 5000 }).catch(() => null),
  page.click('[class*="border-dashed"]'),
]);

if (fileChooser) {
  console.log('File chooser opened via click!');
  await fileChooser.setFiles('/tmp/test_playlist.png');
} else {
  console.log('File chooser did not open via click — using setInputFiles directly');
  const fileInput = await page.$('input[type="file"]');
  await fileInput.setInputFiles('/tmp/test_playlist.png');
}

console.log('Waiting for processing state or navigation...');

// Wait for either: processing indicator, error message, or navigation away
try {
  await Promise.race([
    page.waitForURL('**/review', { timeout: 60000 }),
    page.waitForSelector('[class*="ProcessingState"], [class*="processing"], text=Processing', { timeout: 60000 }),
    page.waitForSelector('[class*="text-red"]', { timeout: 60000 }),
  ]);
  await page.screenshot({ path: '/tmp/upload-processing.png', fullPage: true });
  console.log('State changed! URL:', page.url());
} catch (e) {
  console.log('No state change detected in 60s:', e.message);
  await page.screenshot({ path: '/tmp/upload-stuck.png', fullPage: true });
}

if (errors.length) console.log('Console errors:', errors);
if (networkReqs.length) console.log('API requests made:', networkReqs);

await browser.close();
