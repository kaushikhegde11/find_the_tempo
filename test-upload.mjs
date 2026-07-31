import { chromium } from 'playwright';
import path from 'path';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Capture console errors
const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', err => errors.push(err.message));

// Navigate to upload page
await page.goto('http://127.0.0.1:3000/upload', { waitUntil: 'networkidle', timeout: 15000 });
await page.screenshot({ path: '/tmp/upload-page.png', fullPage: true });
console.log('Upload page loaded');
console.log('URL:', page.url());

// Check if upload zone is visible
const uploadZone = await page.$('[class*="border-dashed"]');
console.log('Upload zone present:', !!uploadZone);

const fileInput = await page.$('input[type="file"]');
console.log('File input present:', !!fileInput);

if (fileInput) {
  const isVisible = await fileInput.isVisible();
  const isEnabled = await fileInput.isEnabled();
  console.log('File input visible:', isVisible);
  console.log('File input enabled:', isEnabled);

  // Check z-index and positioning
  const style = await page.evaluate(el => {
    const s = window.getComputedStyle(el);
    return {
      position: s.position,
      zIndex: s.zIndex,
      pointerEvents: s.pointerEvents,
      opacity: s.opacity,
      top: s.top,
      left: s.left,
      width: s.width,
      height: s.height,
    };
  }, fileInput);
  console.log('File input computed style:', JSON.stringify(style, null, 2));
}

const button = await page.$('button');
if (button) {
  const buttonText = await button.textContent();
  console.log('Button text:', buttonText?.trim());

  // Check if button is on top of file input
  const buttonStyle = await page.evaluate(el => {
    const s = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return { zIndex: s.zIndex, position: s.position, rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height } };
  }, button);
  console.log('Button style:', JSON.stringify(buttonStyle, null, 2));
}

// Try uploading the test file
if (fileInput) {
  console.log('\nAttempting file upload...');
  try {
    await fileInput.setInputFiles('/tmp/test_playlist.png');
    console.log('File set successfully');
    // Wait a moment for processing to start
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/upload-after-select.png', fullPage: true });
    console.log('Screenshot taken after file selection');
  } catch (e) {
    console.log('Error setting file:', e.message);
  }
}

if (errors.length) {
  console.log('\nConsole errors:', errors);
}

await browser.close();
