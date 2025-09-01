// src/app/api/decode/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { decryptText } from '@/app/lib/utils';

// POST handler to decode hashed text
export async function POST(request: NextRequest) {
  try {
    const { hashKey, itemId } = await request.json();
    
    if (!hashKey) {
      return NextResponse.json(
        { error: 'Hash key is required' },
        { status: 400 }
      );
    }

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }
    
    // Find the specific hashed text item
    const item = await prisma.dumpItem.findFirst({
      where: {
        id: itemId,
        type: 'hashed_text',
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    
    if (!item) {
      // Let's check what went wrong
      const itemWithoutTypeCheck = await prisma.dumpItem.findFirst({
        where: {
          id: itemId,
        },
      });
      
      if (!itemWithoutTypeCheck) {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      } else if (itemWithoutTypeCheck.type !== 'hashed_text') {
        return NextResponse.json(
          { error: 'Item is not a hashed text item' },
          { status: 400 }
        );
      } else if (itemWithoutTypeCheck.expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Item has expired' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Hashed text item not found or has expired' },
        { status: 404 }
      );
    }
    
    // Try to decrypt the content using the hash key
    const decryptedText = decryptText(item.content, hashKey);
    
    if (!decryptedText) {
      return NextResponse.json(
        { error: 'Invalid hash key' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      decodedText: decryptedText,
      message: 'Text decoded successfully!'
    });
    
  } catch (error) {
    console.error('Error decoding hashed text:', error);
    return NextResponse.json(
      { error: 'Failed to decode hashed text' },
      { status: 500 }
    );
  }
}
