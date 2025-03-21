// src/app/api/cron/cleanup/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import fs from 'fs/promises';
import path from 'path';

// This route should be called by a cron job to clean up expired items
export async function GET() {
  try {
    // Find all expired items
    const expiredItems = await prisma.dumpItem.findMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // Delete file uploads if they exist
    for (const item of expiredItems) {
      if (item.type !== 'text' && item.content.startsWith('/uploads/')) {
        try {
          const filePath = path.join(process.cwd(), 'public', item.content);
          await fs.unlink(filePath);
        } catch (error) {
          console.error(`Failed to delete file ${item.content}:`, error);
        }
      }
    }

    // Delete expired items from the database
    await prisma.dumpItem.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: expiredItems.length,
    });
  } catch (error) {
    console.error('Error cleaning up expired items:', error);
    return NextResponse.json(
      { error: 'Failed to clean up expired items' },
      { status: 500 }
    );
  }
}