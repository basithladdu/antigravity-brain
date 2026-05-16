import path from 'path';
import os from 'os';

/**
 * Configuration for the Antigravity Brain Explorer.
 * Change BRAIN_DIR to point to your conversation logs.
 * 
 * Default for Windows: C:\Users\<USER>\.gemini\antigravity\brain
 */

const DEFAULT_WINDOWS_PATH = path.join(os.homedir(), '.gemini', 'antigravity', 'brain');

export const config = {
  brainDir: process.env.BRAIN_DIR || DEFAULT_WINDOWS_PATH,
};
