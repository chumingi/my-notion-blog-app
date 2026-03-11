import { isFullPage } from '@notionhq/client'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { createNotionClient } from './client'
import type { Post, PostStatus } from '@/types/post'
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

export async function importAllPosts(): Promise<Post[]> {
  const dbId = process.env.NOTION_POSTS_DB_ID
  if (!dbId) throw new Error('NOTION_POSTS_DB_ID is not set')

  const notion = createNotionClient()
  const posts: Post[] = []
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
      const validStatuses: PostStatus[] = ['draft', 'published', 'archived']
      const status: PostStatus = validStatuses.includes(statusRaw as PostStatus)
        ? (statusRaw as PostStatus)
        : 'draft'

      posts.push({
        notionPageId: page.id,
        slug,
        title: getTitle(page, 'Title'),
        summary: getRichText(page, 'Summary'),
        status,
        tags: getMultiSelect(page, 'Tags'),
        category: getSelect(page, 'Category'),
        publishedAt: getDate(page, 'PublishedAt'),
        notionUpdatedAt: page.last_edited_time,
        lastSyncedAt: new Date().toISOString(),
      })
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  return posts
}
