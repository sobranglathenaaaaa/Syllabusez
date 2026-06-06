import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';

// Path to the JSON data file that stores per‑user settings
const dataFilePath = path.join(process.cwd(), 'data', 'userSettings.json');

// Helper: load the JSON file (creates it if missing)
async function loadSettingsFile() {
  try {
    const content = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    // If file doesn't exist, start with empty object
    if (err.code === 'ENOENT') {
      await fs.writeFile(dataFilePath, JSON.stringify({}), 'utf8');
      return {};
    }
    throw err;
  }
}

// Helper: persist the JSON object back to disk
async function saveSettingsFile(data) {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET() {
  const cookieStore = cookies();
  const userId = cookieStore.get('session_user_id')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const allSettings = await loadSettingsFile();
  const userSettings = allSettings[userId] || {
    displayName: '',
    timeZone: 'UTC',
    language: 'en',
    // email is handled elsewhere; it is read‑only on the UI
  };

  return NextResponse.json(userSettings);
}

export async function PUT(request) {
  const cookieStore = cookies();
  const userId = cookieStore.get('session_user_id')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const updates = await request.json();
  const allSettings = await loadSettingsFile();
  const existing = allSettings[userId] || {};
  const merged = { ...existing, ...updates };
  allSettings[userId] = merged;
  await saveSettingsFile(allSettings);

  return NextResponse.json(merged);
}
