'use client'

import { useState } from 'react'
import Link from 'next/link'
import TagFilter from '@/components/ui/TagFilter'
import type { Post } from '@/types/post'

interface PostsListClientProps {
  posts: Post[]
}

export default function PostsListClient({ posts }: PostsListClientProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort()
  const filtered = selectedTag ? posts.filter((p) => p.tags.includes(selectedTag)) : posts

  if (posts.length === 0) {
    return <p className="text-gray-500">No published posts yet.</p>
  }

  return (
    <>
      <TagFilter tags={allTags} selected={selectedTag} onSelect={setSelectedTag} />
      <ul className="space-y-6">
        {filtered.map((post) => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`} className="block group">
              <h2 className="text-xl font-semibold group-hover:underline">{post.title}</h2>
              {post.summary && (
                <p className="text-gray-600 mt-1 text-sm">{post.summary}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                {post.publishedAt && <span>{post.publishedAt}</span>}
                {post.category && <span>{post.category}</span>}
                {post.tags.length > 0 && <span>{post.tags.join(', ')}</span>}
              </div>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-500">No posts with this tag.</p>
        )}
      </ul>
    </>
  )
}
