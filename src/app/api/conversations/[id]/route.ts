import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const BRAIN_DIR = 'C:\\Users\\basit\\.gemini\\antigravity\\brain';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logPath = path.join(BRAIN_DIR, id, '.system_generated', 'logs', 'overview.txt');

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
