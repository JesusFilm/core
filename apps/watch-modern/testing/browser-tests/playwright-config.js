const { firefox } = require('playwright');

/**
 * Playwright Browser Configuration for watch-modern testing
 *
 * This module provides browser setup utilities for testing the watch-modern application.
 * Optimized for ARM64 architecture and includes Firefox as the primary browser.
 */

// Browser configuration
const BROWSER_CONFIG = {
  firefox: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
};

// Test environment configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:4800',
  defaultTimeout: 30000,
  navigationTimeout: 10000,
  viewport: { width: 1280, height: 720 }
};

/**
 * Create a new browser instance with optimized settings
 * @param {string} browserType - Browser type ('firefox' or 'chromium')
 * @returns {Promise<Browser>} Browser instance
 */
async function createBrowser(browserType = 'firefox') {
  const config = BROWSER_CONFIG[browserType];

  if (!config) {
    throw new Error(`Unsupported browser type: ${browserType}. Supported: ${Object.keys(BROWSER_CONFIG).join(', ')}`);
  }

  return await firefox.launch(config);
  
}

/**
 * Create a new browser context with common settings
 * @param {Browser} browser - Browser instance
 * @returns {Promise<BrowserContext>} Browser context
 */
async function createContext(browser) {
  return await browser.newContext({
    viewport: TEST_CONFIG.viewport,
    userAgent: 'watch-modern-e2e-test/1.0'
  });
}

/**
 * Navigate to watch-modern app with error handling
 * @param {Page} page - Playwright page instance
 * @param {string} path - Path to navigate to (e.g., '/watch')
 * @returns {Promise<void>}
 */
async function navigateToApp(page, path = '/watch') {
  const url = `${TEST_CONFIG.baseUrl}${path}`;

  try {
    console.log(`🌐 Navigating to ${url}...`);
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: TEST_CONFIG.navigationTimeout
    });
    console.log('✅ Page loaded successfully');
  } catch (error) {
    console.error('❌ Navigation failed:', error.message);
    throw error;
  }
}

/**
 * Wait for search results to load
 * @param {Page} page - Playwright page instance
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<void>}
 */
async function waitForSearchResults(page, timeout = 5000) {
  try {
    await page.waitForFunction(
      () => {
        const results = document.querySelectorAll('.card, [class*="hit"], [data-testid*="hit"]');
        return results.length > 0;
      },
      { timeout }
    );
    console.log('✅ Search results loaded');
  } catch (error) {
    console.log('⚠️  No search results found within timeout');
  }
}

module.exports = {
  BROWSER_CONFIG,
  TEST_CONFIG,
  createBrowser,
  createContext,
  navigateToApp,
  waitForSearchResults
};

