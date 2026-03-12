import { readCacheFile } from '@/lib/cache/reader'
import type { Note } from '@/types/note'
import NotesListClient from '@/components/notes/NotesListClient'

export default function NotesPage() {
  const cache = readCacheFile<Note>('notes.json')
  const notes = (cache?.items ?? []).filter((n) => n.status === 'published')

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Notes</h1>
      <NotesListClient notes={notes} />
    </main>
  )
}
