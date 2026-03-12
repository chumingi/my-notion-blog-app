'use client'

interface TagFilterProps {
  tags: string[]
  selected: string | null
  onSelect: (tag: string | null) => void
}

export default function TagFilter({ tags, selected, onSelect }: TagFilterProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
          selected === null
            ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
            : 'border-gray-300 text-gray-600 hover:border-gray-500 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-400'
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(selected === tag ? null : tag)}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            selected === tag
              ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
              : 'border-gray-300 text-gray-600 hover:border-gray-500 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-400'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
