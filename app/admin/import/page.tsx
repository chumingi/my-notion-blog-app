import { notFound } from 'next/navigation'
import { readCacheFile } from '@/lib/cache/reader'
import type { Post } from '@/types/post'
import type { Note } from '@/types/note'
import ImportButton from '@/components/admin/ImportButton'

type Props = {
  searchParams: Promise<{ secret?: string }>
}

export default async function AdminImportPage({ searchParams }: Props) {
  const { secret } = await searchParams

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    notFound()
  }

  const postsCache = readCacheFile<Post>('posts.json')
  const notesCache = readCacheFile<Note>('notes.json')

  const lastImport = postsCache?.importedAt ?? null

  return (
    <main className="max-w-lg mx-auto mt-20 px-6">
      <h1 className="text-2xl font-semibold mb-2">Import from Notion</h1>
      <p className="text-gray-500 mb-8 text-sm">
        Notion 데이터를 가져와 캐시를 갱신합니다.
      </p>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 mb-6 space-y-2 text-sm">
        <p>
          <span className="text-gray-500">Last import:</span>{' '}
          <span className="font-medium">
            {lastImport ? new Date(lastImport).toLocaleString('ko-KR') : '없음'}
          </span>
        </p>
        <p>
          <span className="text-gray-500">Posts:</span>{' '}
          <span className="font-medium">{postsCache?.items.length ?? 0}개</span>
        </p>
        <p>
          <span className="text-gray-500">Notes:</span>{' '}
          <span className="font-medium">{notesCache?.items.length ?? 0}개</span>
        </p>
      </div>

      <ImportButton secret={secret} />
    </main>
  )
}
