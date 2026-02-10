#!/usr/bin/env node

/**
 * Manual Data Upload Script for Render
 * 
 * This script reads your local data files and uploads them directly to the Render backend.
 * Use this as a backup method if the automatic sync is failing.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RENDER_API_URL = 'https://phepis-scraper.onrender.com';
const DATA_DIR = path.join(__dirname, 'scraper-server', 'data');

const collections = ['products', 'settings', 'suppliers', 'sourcingCart'];

async function uploadCollection(collectionName) {
    const filePath = path.join(DATA_DIR, `${collectionName}.json`);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  No data file found for ${collectionName}, skipping...`);
        return;
    }

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (!data || (Array.isArray(data) && data.length === 0)) {
            console.log(`⚠️  ${collectionName} is empty, skipping...`);
            return;
        }

        console.log(`📤 Uploading ${collectionName}...`);

        const response = await fetch(`${RENDER_API_URL}/api/data/${collectionName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            console.log(`✅ Successfully uploaded ${collectionName}`);
        } else {
            console.error(`❌ Failed to upload ${collectionName}: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error(`❌ Error uploading ${collectionName}:`, error.message);
    }
}

async function main() {
    console.log('🚀 Starting manual data upload to Render...\n');
    console.log(`Target: ${RENDER_API_URL}\n`);

    // First, check if the server is awake
    console.log('⏳ Checking if Render server is awake...');
    try {
        const healthResponse = await fetch(`${RENDER_API_URL}/health`, {
            signal: AbortSignal.timeout(60000) // 60 second timeout
        });

        if (healthResponse.ok) {
            console.log('✅ Server is awake!\n');
        } else {
            console.log('⚠️  Server responded but with an error. Continuing anyway...\n');
        }
    } catch (error) {
        console.error('❌ Server is not responding. Please wait a few minutes and try again.');
        console.error('   You can manually wake it up by visiting: https://phepis-scraper.onrender.com/health\n');
        process.exit(1);
    }

    // Upload each collection
    for (const collection of collections) {
        await uploadCollection(collection);
    }

    console.log('\n✨ Upload complete! Check your Render dashboard to verify.');
}

main().catch(console.error);
