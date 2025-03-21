// src/app/api/dump/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { getExpirationTime, detectFileType } from '@/app/lib/utils';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
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
      
      // Process file upload server-side
      fileName = file.name;
      mimeType = file.type;
      
      // Process file upload server-side
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Ensure uploads directory exists
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }
      
      // Generate unique filename
      const uniqueFilename = `${uuidv4()}-${file.name}`;
      const filePath = join(uploadDir, uniqueFilename);
      
      // Write file
      await writeFile(filePath, buffer);
      
      // Store the relative path
      content = `/uploads/${uniqueFilename}`;
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