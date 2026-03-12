import { readCacheFile } from '@/lib/cache/reader'
import type { Note } from '@/types/note'
import Link from 'next/link'

export default function NotesPage() {
  const cache = readCacheFile<Note>('notes.json')
  const notes = (cache?.items ?? []).filter((n) => n.status === 'published')

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Notes</h1>
      {notes.length === 0 ? (
        <p className="text-gray-500">No published notes yet.</p>
      ) : (
        <ul className="space-y-6">
          {notes.map((note) => (
            <li key={note.slug}>
              <Link href={`/notes/${note.slug}`} className="block group">
                <h2 className="text-xl font-semibold group-hover:underline">{note.title}</h2>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  {note.date && <span>{note.date}</span>}
                  {note.tags.length > 0 && <span>{note.tags.join(', ')}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
