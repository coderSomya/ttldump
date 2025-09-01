// src/app/api/dump/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { getExpirationTime, detectFileType, encryptText } from '@/app/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Function to clean up expired items
async function cleanupExpiredItems() {
  try {
    // Delete expired items from the database
    await prisma.dumpItem.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Error cleaning up expired items:', error);
  }
}

// GET handler to fetch all non-expired dumps
export async function GET() {
  try {
    // Clean up expired items first
    await cleanupExpiredItems();
    
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
    // Clean up expired items first
    await cleanupExpiredItems();
    
    const formData = await request.formData();
    const type = formData.get('type') as string;
    
    let content = '';
    let fileName = null;
    let mimeType = null;
    let hashKey = null;
    
    if (type === 'text') {
      content = formData.get('content') as string;
    } else if (type === 'hashed_text') {
      const textContent = formData.get('content') as string;
      const secretKey = formData.get('secretKey') as string;
      
      if (!secretKey) {
        return NextResponse.json(
          { error: 'Secret key is required for hashed text' },
          { status: 400 }
        );
      }
      
      // Encrypt the text content with the user's secret key directly
      content = encryptText(textContent, secretKey);
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
        type: type === 'text' ? 'text' : type === 'hashed_text' ? 'hashed_text' : detectFileType(mimeType || ''),
        content,
        fileName,
        mimeType,
        expiresAt: getExpirationTime(),
      },
    });
    
    // Return the item
    return NextResponse.json({ 
      item,
      message: type === 'hashed_text' 
        ? 'Text encrypted successfully! Use your secret key to decrypt it later.'
        : 'Item added successfully!'
    });
  } catch (error) {
    console.error('Error creating dump item:', error);
    return NextResponse.json(
      { error: 'Failed to create dump item' },
      { status: 500 }
    );
  }
}