import { NextRequest, NextResponse } from 'next/server';
import { getPocketBaseAdmin } from '@/lib/pocketbaseAdmin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = req.nextUrl.searchParams.get('userId');

    const pb = await getPocketBaseAdmin();
    const project = await pb.collection('projects').getOne(id);

    if (!project.archive_file) {
      return NextResponse.json({ error: 'No source archive file uploaded for this project.' }, { status: 404 });
    }

    const isFree = !project.is_for_sale || (typeof project.price === 'number' && project.price === 0);

    if (!isFree) {
      if (!userId) {
        return NextResponse.json(
          { error: 'Sign in and purchase this project to download the source archive.' },
          { status: 401 }
        );
      }

      const isAuthor = project.user === userId;

      if (!isAuthor) {
        const purchase = await pb.collection('purchases').getList(1, 1, {
          filter: `buyer = '${userId}' && project = '${id}'`,
        });

        if (purchase.totalItems === 0) {
          return NextResponse.json(
            { error: 'Purchase required to download source archive.' },
            { status: 403 }
          );
        }
      }
    }

    const fileUrl = `${pb.baseUrl}/api/files/${project.collectionId || 'projects'}/${project.id}/${project.archive_file}`;
    const fileRes = await fetch(fileUrl);

    if (!fileRes.ok) {
      return NextResponse.json({ error: 'Failed to retrieve archive from storage.' }, { status: 502 });
    }

    const blob = await fileRes.blob();
    const safeTitle = (project.title || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${safeTitle}-source.zip"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Download failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
