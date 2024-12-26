import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global setup for theme testing
 */
async function globalSetup(config: FullConfig) {
    // Create test output directories
    const dirs = [
        'test-results/theme-tests',
        'test-results/theme-tests/screenshots',
        'test-results/theme-tests/videos',
        'test-results/theme-tests/traces',
        'test-results/theme-tests/reports',
        'test-results/theme-tests/html-report',
        'test-results/theme-tests/snapshots'
    ];

    dirs.forEach(dir => {
        const dirPath = path.join(process.cwd(), dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    });

    // Create test metadata
    const metadata = {
        startTime: new Date().toISOString(),
        config: {
            // Include only serializable config properties
            projectNames: config.projects?.map(p => p.name),
            workers: config.workers,
            metadata: config.metadata
        },
        environment: {
            node: process.version,
            os: process.platform,
            ci: !!process.env.CI,
            projects: config.projects?.map(project => ({
                name: project.name,
                repeatEach: project.repeatEach,
                retries: project.retries,
                metadata: project.metadata
            }))
        }
    };

    fs.writeFileSync(
        path.join(process.cwd(), 'test-results/theme-tests/metadata.json'),
        JSON.stringify(metadata, null, 2)
    );

    // Set up test environment
    process.env.THEME_TEST = 'true';
    process.env.NODE_ENV = 'test';

    // Log test start
    console.log('\nStarting theme and accessibility tests');
    console.log('=====================================');
    console.log('Projects:', config.projects?.map(p => p.name).join(', '));
    console.log('Workers:', config.workers);
    console.log('CI mode:', !!process.env.CI);
    
    // Log project-specific configurations
    if (config.projects?.length) {
        console.log('\nProject Configurations:');
        config.projects.forEach(project => {
            console.log(`\n${project.name}:`);
            console.log(`  Retries: ${project.retries}`);
            console.log(`  Repeat Each: ${project.repeatEach}`);
            if (project.metadata) {
                console.log('  Metadata:', JSON.stringify(project.metadata, null, 2));
            }
        });
    }
    
    console.log('=====================================\n');
}

export default globalSetup;
