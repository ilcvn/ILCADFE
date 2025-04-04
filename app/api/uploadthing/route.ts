import { createRouteHandler } from 'uploadthing/next';
import { UTApi } from 'uploadthing/server';
import { ourFileRouter } from './core';
import { NextResponse, type NextRequest } from 'next/server';

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data?.url) {
      return NextResponse.json({ message: 'Missing URL', status: 400 });
    }

    // Lấy tên file từ URL
    const fileKey = data.url.substring(data.url.lastIndexOf('/') + 1);

    const utapi = new UTApi();
    const result = await utapi.deleteFiles(fileKey);

    if (result.success) {
      return NextResponse.json({ message: 'Old file has been deleted', status: 200 });
    } else {
      return NextResponse.json({ message: 'Failed to delete file', status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting file', error: error?.message, status: 500 });
  }
}
