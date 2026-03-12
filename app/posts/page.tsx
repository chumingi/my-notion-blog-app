import { readCacheFile } from '@/lib/cache/reader'
import type { Post } from '@/types/post'
import Link from 'next/link'

export default function PostsPage() {
  const cache = readCacheFile<Post>('posts.json')
  const posts = (cache?.items ?? []).filter((p) => p.status === 'published')

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Posts</h1>
      {posts.length === 0 ? (
        <p className="text-gray-500">No published posts yet.</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/posts/${post.slug}`} className="block group">
                <h2 className="text-xl font-semibold group-hover:underline">{post.title}</h2>
                {post.summary && (
                  <p className="text-gray-600 mt-1 text-sm">{post.summary}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  {post.publishedAt && <span>{post.publishedAt}</span>}
                  {post.category && <span>{post.category}</span>}
                  {post.tags.length > 0 && (
                    <span>{post.tags.join(', ')}</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
