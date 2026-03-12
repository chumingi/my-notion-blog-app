'use client'

import { useState } from 'react'
import Link from 'next/link'
import TagFilter from '@/components/ui/TagFilter'
import type { Note } from '@/types/note'

interface NotesListClientProps {
  notes: Note[]
}

export default function NotesListClient({ notes }: NotesListClientProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags))).sort()
  const filtered = selectedTag ? notes.filter((n) => n.tags.includes(selectedTag)) : notes

  if (notes.length === 0) {
    return <p className="text-gray-500">No published notes yet.</p>
  }

  return (
    <>
      <TagFilter tags={allTags} selected={selectedTag} onSelect={setSelectedTag} />
      <ul className="space-y-6">
        {filtered.map((note) => (
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
        {filtered.length === 0 && (
          <p className="text-gray-500">No notes with this tag.</p>
        )}
      </ul>
    </>
  )
}
