import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { config } from '@/lib/config';


export const dynamic = 'force-dynamic';

const BRAIN_DIR = config.brainDir;




export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const headersList = await headers();
  const customDir = headersList.get('x-brain-dir');
  const targetDir = customDir || BRAIN_DIR;

  const logPath = path.join(targetDir, id, '.system_generated', 'logs', 'overview.txt');


  try {
    const content = await fs.readFile(logPath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    const messages = lines.map((line) => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({ id, messages });
  } catch (error) {
    console.error(`Error fetching conversation ${id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 404 });
  }
}
