const fs = require('fs/promises');
const path = require('path');
const os = require('os');

const BRAIN_DIR = path.join(os.homedir(), '.gemini', 'antigravity', 'brain');

async function test() {
    try {
        console.log('Testing brain dir:', BRAIN_DIR);
        const directories = await fs.readdir(BRAIN_DIR, { withFileTypes: true });
        console.log('Found directories:', directories.length);
        
        for (const dirent of directories.slice(0, 3)) {
            if (dirent.isDirectory()) {
                const id = dirent.name;
                const logPath = path.join(BRAIN_DIR, id, '.system_generated', 'logs', 'overview.txt');
                try {
                    const stats = await fs.stat(logPath);
                    console.log(`- ${id}: ${stats.size} bytes`);
                } catch (e) {
                    console.log(`- ${id}: No overview.txt`);
                }
            }
        }
    } catch (e) {
        console.error('Test failed:', e);
    }
}

test();
