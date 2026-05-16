import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { config } from '@/lib/config';


export const dynamic = 'force-dynamic';

const BRAIN_DIR = config.brainDir;




export async function GET() {
  try {
    const headersList = await headers();
    const customDir = headersList.get('x-brain-dir');
    const targetDir = customDir || BRAIN_DIR;

    console.log('Fetching conversations from:', targetDir);
    const directories = await fs.readdir(targetDir, { withFileTypes: true });
    
    console.log(`Found ${directories.length} total directories in brain.`);
    
    const conversations = await Promise.all(
      directories
        .filter((dirent) => dirent.isDirectory())
        .map(async (dirent) => {
          const id = dirent.name;
          const logPath = path.join(targetDir, id, '.system_generated', 'logs', 'overview.txt');


          try {
            const stats = await fs.stat(logPath);
            const content = await fs.readFile(logPath, 'utf-8');
            const lines = content.split('\n').filter(Boolean);
            
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
              updatedAt: stats.mtime.toISOString(),
              size: stats.size,
            };
          } catch (e) {
            // console.log(`Skipping ${id}: No overview.txt found`);
            return null;
          }
        })
    );

    const filtered = conversations
      .filter((c): c is any => c !== null)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    console.log(`Successfully indexed ${filtered.length} sessions.`);
    return NextResponse.json(filtered);

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
