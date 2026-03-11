export type PostStatus = 'draft' | 'published' | 'archived'

export interface Post {
  notionPageId: string
  slug: string
  title: string
  summary: string
  status: PostStatus
  tags: string[]
  category: string
  publishedAt: string
  notionUpdatedAt: string
  lastSyncedAt: string
}
