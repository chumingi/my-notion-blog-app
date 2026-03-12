import { readCacheFile } from '@/lib/cache/reader'
import { fetchBlocks } from '@/lib/notion/blocks'
import { NotionBlocks } from '@/components/blocks/NotionBlock'
import type { Post } from '@/types/post'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const cache = readCacheFile<Post>('posts.json')
  const posts = (cache?.items ?? []).filter((p) => p.status === 'published')
  return posts.map((p) => ({ slug: p.slug }))
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params

  const cache = readCacheFile<Post>('posts.json')
  const post = (cache?.items ?? []).find(
    (p) => p.slug === slug && p.status === 'published'
  )

  if (!post) notFound()

  const blocks = await fetchBlocks(post.notionPageId)

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
            {post.publishedAt && <span>{post.publishedAt}</span>}
            {post.category && <span>{post.category}</span>}
          </div>
          {post.tags.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {post.summary && (
            <p className="mt-4 text-gray-600">{post.summary}</p>
          )}
        </header>

        <div className="prose prose-gray max-w-none">
          <NotionBlocks blocks={blocks} />
        </div>
      </article>
    </main>
  )
}
