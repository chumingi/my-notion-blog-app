import { isFullPage } from '@notionhq/client'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { createNotionClient } from './client'
import type { Note, NoteStatus } from '@/types/note'
import { resolveSlug } from '@/lib/utils/slug'

function getTitle(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop]
  if (p?.type === 'title') return p.title[0]?.plain_text ?? ''
  return ''
}

function getRichText(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop]
  if (p?.type === 'rich_text') return p.rich_text[0]?.plain_text ?? ''
  return ''
}

function getSelect(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop]
  if (p?.type === 'select') return p.select?.name ?? ''
  return ''
}

function getMultiSelect(page: PageObjectResponse, prop: string): string[] {
  const p = page.properties[prop]
  if (p?.type === 'multi_select') return p.multi_select.map((t) => t.name)
  return []
}

function getDate(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop]
  if (p?.type === 'date') return p.date?.start ?? ''
  return ''
}

export async function importAllNotes(): Promise<Note[]> {
  const dbId = process.env.NOTION_NOTES_DB_ID
  if (!dbId) throw new Error('NOTION_NOTES_DB_ID is not set')

  const notion = createNotionClient()
  const notes: Note[] = []
  const slugsSeen = new Set<string>()
  let cursor: string | undefined = undefined

  do {
    const response = await notion.dataSources.query({
      data_source_id: dbId,
      start_cursor: cursor,
    })

    for (const page of response.results) {
      if (!isFullPage(page)) continue

      const slugProp = getRichText(page, 'Slug') || null
      const slug = resolveSlug(slugProp, page.id, slugsSeen)
      slugsSeen.add(slug)

      const statusRaw = getSelect(page, 'Status')
      const validStatuses: NoteStatus[] = ['draft', 'published']
      const status: NoteStatus = validStatuses.includes(statusRaw as NoteStatus)
        ? (statusRaw as NoteStatus)
        : 'draft'

      notes.push({
        notionPageId: page.id,
        slug,
        title: getTitle(page, 'Title'),
        tags: getMultiSelect(page, 'Tags'),
        date: getDate(page, 'Date'),
        status,
        lastSyncedAt: new Date().toISOString(),
      })
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  return notes
}
