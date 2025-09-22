const { chromium } = require('playwright');

async function testVideoPlayback() {
  console.log('🚀 Starting video playback test...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Set up console and network monitoring
  const consoleMessages = [];
  const requests = [];
  page.on('console', msg => consoleMessages.push(msg.text()));
  page.on('request', req => requests.push(req.url()));

  try {
    console.log('📺 Navigating to cropper app...');
    await page.goto('http://localhost:4600');

    console.log('✅ Page loaded, checking for videos...');

    // Wait for video list items to appear
    await page.waitForSelector('ul li', { timeout: 10000 });
    const videoItems = await page.$$('ul li');
    console.log(`📹 Found ${videoItems.length} video items`);

    if (videoItems.length === 0) {
      throw new Error('No videos found in the list');
    }

    // Click the first video's "Load" button using locator (more resilient)
    const firstVideoButton = page.locator('ul li').first().locator('button:has-text("Load")');

    console.log('🎬 Clicking Load button for first video...');
    await firstVideoButton.click();

    // Take a screenshot to see what the page looks like
    await page.screenshot({ path: 'after-click.png' });
    console.log('📸 Screenshot taken: after-click.png');

    // Wait a moment and check what happened
    await page.waitForTimeout(2000);

    // Check if button changed to "Selected" or if there are any errors
    const selectedButton = page.locator('button:has-text("Selected")');
    const hasSelectedButton = await selectedButton.isVisible();

    console.log(`📋 Recent console messages: ${consoleMessages.slice(-5).join(', ')}`);
    console.log(`🌐 Recent requests: ${requests.slice(-3).join(', ')}`);

    if (hasSelectedButton) {
      console.log('✅ Video loaded successfully (button changed to Selected)');
    } else {
      console.log('⚠️  Button did not change to Selected, checking for other indicators...');

      // Check if video element appeared
      const videoExists = await page.locator('video').isVisible();
      console.log(`🎥 Video element visible: ${videoExists}`);
    }

    // Check if video element exists immediately
    let videoElement = page.locator('video');
    const videoExistsImmediately = await videoElement.isVisible();
    console.log(`🎥 Video element visible immediately: ${videoExistsImmediately}`);

    if (!videoExistsImmediately) {
      // Wait for video element to appear
      try {
        await videoElement.waitFor({ timeout: 5000 });
        console.log('🎥 Video element found after waiting');
      } catch (e) {
        console.log('❌ Video element never appeared');

        // Check what's in the video container
        const videoContainer = page.locator('.aspect-video');
        const containerContent = await videoContainer.textContent();
        console.log(`📦 Video container content: "${containerContent}"`);

        // Check the container's HTML
        const containerHTML = await videoContainer.innerHTML();
        console.log(`📦 Video container HTML: ${containerHTML.substring(0, 200)}...`);

        // Check for any video-related elements
        const allVideoElements = await page.$$('video');
        console.log(`📹 Total video elements in DOM: ${allVideoElements.length}`);

        // Check if there are any hidden video elements
        const hiddenVideos = await page.$$('video[style*="display: none"], video.hidden');
        console.log(`👻 Hidden video elements: ${hiddenVideos.length}`);

        throw new Error('Video element not found');
      }
    }

    // Check video element properties
    const videoSrc = await videoElement.getAttribute('src');
    const videoClass = await videoElement.getAttribute('class');
    console.log(`📊 Video src: ${videoSrc}`);
    console.log(`📊 Video class: ${videoClass}`);

    // Wait a moment for video.js to initialize
    await page.waitForTimeout(3000);

    // Check if Video.js player is initialized by looking for vjs classes
    const videoContainer = page.locator('.video-js');
    const isVideoJsInitialized = await videoContainer.isVisible();
    console.log(`🎮 Video.js initialized: ${isVideoJsInitialized}`);

    // Check for Video.js error messages in console
    const errorMessages = consoleMessages.filter(msg =>
      msg.includes('VIDEOJS: ERROR') ||
      msg.includes('MediaError') ||
      msg.includes('not included in the DOM')
    );
    if (errorMessages.length > 0) {
      console.log(`🚨 Video.js errors: ${errorMessages.join(', ')}`);
    }

    // Try to play the video
    console.log('▶️  Attempting to play video...');
    const playButton = page.locator('button:has-text("Play")');
    const playButtonVisible = await playButton.isVisible();

    if (playButtonVisible) {
      await playButton.click();
      console.log('✅ Play button clicked');

      // Wait a moment and check if video is playing
      await page.waitForTimeout(1000);

      // Check if pause button is now available (indicating video started playing)
      const pauseButton = page.locator('button:has-text("Pause")');
      const isPlaying = await pauseButton.isVisible();
      console.log(`🎵 Video playing: ${isPlaying}`);

      if (isPlaying) {
        console.log('🎉 SUCCESS: Video is playing!');
      } else {
        console.log('❌ FAILURE: Video is not playing');
      }
    } else {
      console.log('❌ No Play button found');
    }

    console.log('📋 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testVideoPlayback().catch(console.error);
