import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
 
export async function POST(request: Request) {
  const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

  if (!BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN not set' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const pathname = formData.get('pathname') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    if (!pathname) {
      return NextResponse.json(
        { error: 'Pathname is required' },
        { status: 400 }
      );
    }

    const blob = await put(pathname, file, {
      access: 'public',
      token: BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
