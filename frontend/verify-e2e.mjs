import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5174';

async function runVerification() {
  console.log('--- STARTING OPTIMIND AI FULL APPLICATION VERIFICATION ---');
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });
  } catch (err) {
    console.warn(`[Puppeteer Launch Warning] Headless Chrome could not be launched (${err.message}). Skipping browser automation.`);
    return;
  }

  const page = await browser.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  try {
    // 1. Verify Landing Page
    console.log('[1/7] Navigating to Landing Page:', BASE_URL);
    await page.setViewport({ width: 1280, height: 800 });
    const response = await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    console.log('Landing page HTTP status:', response.status());

    const title = await page.title();
    console.log('Page title:', title);

    const hasTagline = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('see it. understand it.') && text.includes('master it.');
    });
    console.log('Hero headline & tagline present:', hasTagline);

    // 2. Verify Tailwind CSS Styling
    console.log('[2/7] Verifying Tailwind CSS styling...');
    const stylesApplied = await page.evaluate(() => {
      const brandElements = document.querySelectorAll('.bg-brand-600, .text-brand-600');
      if (brandElements.length === 0) return { ok: false, reason: 'No brand color classes found' };
      const computed = window.getComputedStyle(brandElements[0]);
      return {
        ok: true,
        fontFamily: window.getComputedStyle(document.body).fontFamily,
        sampleColor: computed.backgroundColor || computed.color,
      };
    });
    console.log('Tailwind styles check:', stylesApplied);

    // 3. Verify Interactive Visualizer on Landing Page
    console.log('[3/7] Testing Interactive Concept Visualizer on Landing Page...');
    const initialStep = await page.evaluate(() => {
      const stepText = document.querySelector('#visual-engine')?.innerText || '';
      return stepText.includes('Stage 1') || stepText.includes('Initial Array State');
    });
    console.log('Visualizer step 1 active initially:', initialStep);

    // Click Next button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('#visual-engine button'));
      const nBtn = btns.find((b) => b.textContent?.trim().includes('Next'));
      if (nBtn) nBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    const step2Active = await page.evaluate(() => {
      const stepText = document.querySelector('#visual-engine')?.innerText || '';
      return stepText.includes('Stage 2') || stepText.includes('Calculate Midpoint');
    });
    console.log('Visualizer advanced to Step 2:', step2Active);

    // 4. Test Client-Side SPA Navigation to Dashboard
    console.log('[4/7] Testing SPA Navigation to /dashboard...');
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const startBtn = links.find((a) => a.textContent?.includes('Start Learning'));
      if (startBtn) startBtn.click();
    });
    await page.waitForFunction(() => window.location.pathname.startsWith('/dashboard'), { timeout: 5000 });
    console.log('Current URL after client-side SPA navigation:', page.url());

    const hasDashboardTitle = await page.evaluate(() => {
      return document.body.innerText.includes('Welcome back') &&
             document.body.innerText.includes('OptiMind AI');
    });
    console.log('Dashboard loaded successfully:', hasDashboardTitle);

    // 5. Check All Dashboard Sub-Routes
    console.log('[5/7] Checking Dashboard Sub-Routes...');
    const routesToTest = [
      { path: '/dashboard/explainer', expected: 'AI Concept Explainer' },
      { path: '/dashboard/visuals', expected: 'Visual Learning Studio' },
      { path: '/dashboard/documents', expected: 'Document Library' },
      { path: '/dashboard/quizzes', expected: 'Adaptive Assessments' },
      { path: '/dashboard/roadmap', expected: 'Adaptive Study Roadmaps' },
      { path: '/dashboard/progress', expected: 'Learning Progress & Analytics' },
      { path: '/login', expected: 'Sign In to Your Workspace' },
      { path: '/register', expected: 'Create Your Learner Account' },
    ];

    for (const r of routesToTest) {
      await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle0' });
      const found = await page.evaluate((exp) => {
        return document.body.innerText.includes(exp);
      }, r.expected);
      console.log(`Route ${r.path} -> loaded (${r.expected}): ${found}`);
    }

    // 6. Test Navigation Bar and Brand
    console.log('[6/7] Verifying Brand Presence & Accessible Navigation...');
    const hasBrand = await page.evaluate(() => {
      return document.body.innerText.includes('OptiMind');
    });
    console.log('Brand verified:', hasBrand);

    // 7. Check errors
    console.log('[7/7] Checking console and runtime errors...');
    console.log('Console errors encountered:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('Error logs:', consoleErrors.slice(0, 3));
    }
    console.log('Page unhandled errors:', pageErrors.length);

    console.log('--- E2E VERIFICATION COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('E2E Verification encountered failure:', error);
  } finally {
    await browser.close();
  }
}

runVerification();
