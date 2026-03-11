import { NextRequest, NextResponse } from 'next/server'
import { importAllPosts } from '@/lib/notion/posts'
import { importAllNotes } from '@/lib/notion/notes'
import { writeCacheFile } from '@/lib/cache/writer'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [posts, notes] = await Promise.all([
      importAllPosts(),
      importAllNotes(),
    ])

    writeCacheFile('posts.json', posts)
    writeCacheFile('notes.json', notes)

    return NextResponse.json({
      success: true,
      postsCount: posts.length,
      notesCount: notes.length,
      importedAt: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
