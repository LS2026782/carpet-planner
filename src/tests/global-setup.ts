import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
    // Set up any global test dependencies
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Wait for dev server to be ready
    const maxRetries = 5;
    const retryInterval = 5000;
    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            await page.goto('http://localhost:3000');
            // Wait for critical elements that indicate app is ready
            await Promise.race([
                page.waitForSelector('.toolbar', { timeout: 10000 }),
                page.waitForSelector('.canvas', { timeout: 10000 })
            ]);
            console.log('Dev server is ready');
            break;
        } catch (error) {
            retries++;
            if (retries === maxRetries) {
                throw new Error('Dev server failed to start or app failed to initialize');
            }
            console.log(`Waiting for dev server... (attempt ${retries}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryInterval));
        }
    }

    // Set up axe-core for accessibility testing
    await page.addInitScript({
        path: require.resolve('axe-core/axe.min.js')
    });

    // Set up screen reader simulation
    await page.addInitScript(() => {
        window.speechSynthesis = window.speechSynthesis || {
            speak: (utterance: SpeechSynthesisUtterance) => {
                console.log('Screen Reader:', utterance.text);
            },
            cancel: () => {},
            pause: () => {},
            resume: () => {},
            getVoices: () => [],
            pending: false,
            speaking: false,
            paused: false,
        };
    });

    // Set up high contrast mode detection
    await page.addInitScript(() => {
        window.matchMedia = window.matchMedia || function(query: string) {
            return {
                matches: query === '(forced-colors: active)',
                media: query,
                onchange: null,
                addListener: () => {},
                removeListener: () => {},
                addEventListener: () => {},
                removeEventListener: () => {},
                dispatchEvent: () => true,
            };
        };
    });

    // Set up reduced motion preference detection
    await page.addInitScript(() => {
        window.matchMedia = window.matchMedia || function(query: string) {
            return {
                matches: query === '(prefers-reduced-motion: reduce)',
                media: query,
                onchange: null,
                addListener: () => {},
                removeListener: () => {},
                addEventListener: () => {},
                removeEventListener: () => {},
                dispatchEvent: () => true,
            };
        };
    });

    await browser.close();

    // Create test output directories
    const fs = require('fs');
    const path = require('path');
    const dirs = [
        'test-results',
        'test-results/screenshots',
        'test-results/videos',
        'test-results/traces',
        'test-results/reports'
    ];

    dirs.forEach(dir => {
        const dirPath = path.join(process.cwd(), dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    });
}

export default globalSetup;
