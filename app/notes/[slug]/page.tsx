import { readCacheFile } from '@/lib/cache/reader'
import { fetchBlocks } from '@/lib/notion/blocks'
import type { Note } from '@/types/note'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const cache = readCacheFile<Note>('notes.json')
  const notes = (cache?.items ?? []).filter((n) => n.status === 'published')
  return notes.map((n) => ({ slug: n.slug }))
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params

  const cache = readCacheFile<Note>('notes.json')
  const note = (cache?.items ?? []).find(
    (n) => n.slug === slug && n.status === 'published'
  )

  if (!note) notFound()

  const blocks = await fetchBlocks(note.notionPageId)

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{note.title}</h1>
          <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
            {note.date && <span>{note.date}</span>}
          </div>
          {note.tags.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Block renderer placeholder — feature/block-renderer에서 구현 예정 */}
        <div className="text-gray-400 text-sm border border-dashed border-gray-200 rounded p-4">
          {blocks.length} block(s) loaded from Notion. Block renderer coming soon.
        </div>
      </article>
    </main>
  )
}
