#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Configuration for cleanup operations
 */
const config = {
    // Directories to clean
    cleanDirs: [
        'test-results',
        'playwright-report',
        'test-artifacts',
        '.nyc_output',
        'coverage'
    ],
    
    // Files to clean
    cleanFiles: [
        'junit.xml',
        'coverage.json',
        'debug.log'
    ],
    
    // Cache directories
    cacheDirs: [
        '.cache',
        'node_modules/.cache',
        'playwright/.cache'
    ],
    
    // Browser data directories
    browserDirs: [
        'playwright/.browser-data',
        'playwright/.local-browsers'
    ],
    
    // Maximum age for test artifacts (7 days)
    maxAge: 7 * 24 * 60 * 60 * 1000
};

/**
 * Clean directories and files
 */
function cleanDirectories() {
    console.log('\nCleaning directories...');
    
    // Clean directories
    config.cleanDirs.forEach(dir => {
        const fullPath = path.join(process.cwd(), dir);
        if (fs.existsSync(fullPath)) {
            console.log(`Removing ${dir}...`);
            fs.rmSync(fullPath, { recursive: true, force: true });
        }
    });
    
    // Clean files
    config.cleanFiles.forEach(file => {
        const fullPath = path.join(process.cwd(), file);
        if (fs.existsSync(fullPath)) {
            console.log(`Removing ${file}...`);
            fs.unlinkSync(fullPath);
        }
    });
}

/**
 * Clean cache directories
 */
function cleanCache() {
    console.log('\nCleaning cache...');
    
    config.cacheDirs.forEach(dir => {
        const fullPath = path.join(process.cwd(), dir);
        if (fs.existsSync(fullPath)) {
            console.log(`Removing ${dir}...`);
            fs.rmSync(fullPath, { recursive: true, force: true });
        }
    });
}

/**
 * Clean browser data
 */
function cleanBrowserData() {
    console.log('\nCleaning browser data...');
    
    config.browserDirs.forEach(dir => {
        const fullPath = path.join(process.cwd(), dir);
        if (fs.existsSync(fullPath)) {
            console.log(`Removing ${dir}...`);
            fs.rmSync(fullPath, { recursive: true, force: true });
        }
    });
}

/**
 * Clean old test artifacts
 */
function cleanOldArtifacts() {
    console.log('\nCleaning old test artifacts...');
    
    const now = Date.now();
    
    function cleanOldFiles(dirPath) {
        if (!fs.existsSync(dirPath)) return;
        
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
            const fullPath = path.join(dirPath, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                cleanOldFiles(fullPath);
                // Remove empty directories
                if (fs.readdirSync(fullPath).length === 0) {
                    fs.rmdirSync(fullPath);
                }
            } else if (now - stats.mtime.getTime() > config.maxAge) {
                console.log(`Removing old file: ${fullPath}`);
                fs.unlinkSync(fullPath);
            }
        });
    }
    
    config.cleanDirs.forEach(dir => {
        const fullPath = path.join(process.cwd(), dir);
        cleanOldFiles(fullPath);
    });
}

/**
 * Reset test environment
 */
function resetEnvironment() {
    console.log('\nResetting test environment...');
    
    try {
        // Clear npm cache
        execSync('npm cache clean --force', { stdio: 'inherit' });
        
        // Clear Playwright browser cache
        execSync('npx playwright install', { stdio: 'inherit' });
        
        // Rebuild node modules
        execSync('npm ci', { stdio: 'inherit' });
        
    } catch (error) {
        console.error('Error resetting environment:', error);
        process.exit(1);
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        // Parse command line arguments
        const args = process.argv.slice(2);
        const clean = args.includes('--clean');
        const cache = args.includes('--cache');
        const browser = args.includes('--browser');
        const old = args.includes('--old');
        const reset = args.includes('--reset');
        const all = args.includes('--all') || args.length === 0;

        console.log('Starting cleanup...');

        if (clean || all) cleanDirectories();
        if (cache || all) cleanCache();
        if (browser || all) cleanBrowserData();
        if (old || all) cleanOldArtifacts();
        if (reset || all) resetEnvironment();

        console.log('\nCleanup completed successfully!');
    } catch (error) {
        console.error('\nCleanup failed:', error);
        process.exit(1);
    }
}

// Execute main function
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    cleanDirectories,
    cleanCache,
    cleanBrowserData,
    cleanOldArtifacts,
    resetEnvironment,
    config
};
