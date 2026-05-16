import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const BRAIN_DIR = 'C:\\Users\\basit\\.gemini\\antigravity\\brain';

export async function GET() {
  try {
    const directories = await fs.readdir(BRAIN_DIR, { withFileTypes: true });
    const conversations = await Promise.all(
      directories
        .filter((dirent) => dirent.isDirectory())
        .map(async (dirent) => {
          const id = dirent.name;
          const logPath = path.join(BRAIN_DIR, id, '.system_generated', 'logs', 'overview.txt');
          
          try {
            const stats = await fs.stat(logPath);
            const content = await fs.readFile(logPath, 'utf-8');
            const lines = content.split('\n').filter(Boolean);
            
            // Try to find the first USER_INPUT to use as a title
            let title = 'Untitled Conversation';
            for (const line of lines) {
              try {
                const entry = JSON.parse(line);
                if (entry.type === 'USER_INPUT') {
                  let text = entry.content || '';
                  text = text.replace(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/, '$1').trim();
                  text = text.replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/, '').trim();
                  title = text.slice(0, 100) + (text.length > 100 ? '...' : '');
                  break;
                }
              } catch (e) {}
            }

            return {
              id,
              title,
              updatedAt: stats.mtime,
              size: stats.size,
            };
          } catch (e) {
            return null; // Skip if no overview.txt
          }
        })
    );

    const filtered = conversations
      .filter(Boolean)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
