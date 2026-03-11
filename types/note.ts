export type NoteStatus = 'draft' | 'published'

export interface Note {
  notionPageId: string
  slug: string
  title: string
  tags: string[]
  date: string
  status: NoteStatus
  lastSyncedAt: string
}
