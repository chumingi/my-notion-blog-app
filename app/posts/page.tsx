import { readCacheFile } from '@/lib/cache/reader'
import type { Post } from '@/types/post'
import PostsListClient from '@/components/posts/PostsListClient'

export default function PostsPage() {
  const cache = readCacheFile<Post>('posts.json')
  const posts = (cache?.items ?? []).filter((p) => p.status === 'published')

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Posts</h1>
      <PostsListClient posts={posts} />
    </main>
  )
}
