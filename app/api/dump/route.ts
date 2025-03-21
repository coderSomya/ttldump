// src/app/api/dump/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { getExpirationTime, detectFileType } from '@/app/lib/utils';
import { v4 as uuidv4 } from 'uuid';

// GET handler to fetch all non-expired dumps
export async function GET() {
  try {
    const items = await prisma.dumpItem.findMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching dump items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dump items' },
      { status: 500 }
    );
  }
}

// POST handler to create a new dump
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = formData.get('type') as string;
    
    let content = '';
    let fileName = null;
    let mimeType = null;
    
    if (type === 'text') {
      content = formData.get('content') as string;
    } else {
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }
      
      fileName = file.name;
      mimeType = file.type;
      
      // Convert file to Base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Content = `data:${file.type};base64,${buffer.toString('base64')}`;
      
      content = base64Content;
    }
    
    // Create the dump item
    const item = await prisma.dumpItem.create({
      data: {
        type: type === 'text' ? 'text' : detectFileType(mimeType || ''),
        content,
        fileName,
        mimeType,
        expiresAt: getExpirationTime(),
      },
    });
    
    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error creating dump item:', error);
    return NextResponse.json(
      { error: 'Failed to create dump item' },
      { status: 500 }
    );
  }
}