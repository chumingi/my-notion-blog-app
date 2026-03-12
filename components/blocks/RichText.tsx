import type { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints'

interface Props {
  richText: RichTextItemResponse[]
}

export function RichText({ richText }: Props) {
  return (
    <>
      {richText.map((item, i) => {
        const { annotations, plain_text } = item
        const href = item.type === 'text' ? item.text.link?.url : undefined

        let node: React.ReactNode = plain_text

        if (annotations.code) {
          node = (
            <code className="bg-gray-100 text-rose-600 text-[0.85em] px-1 py-0.5 rounded font-mono">
              {node}
            </code>
          )
        } else {
          if (annotations.bold) node = <strong>{node}</strong>
          if (annotations.italic) node = <em>{node}</em>
          if (annotations.strikethrough) node = <s>{node}</s>
          if (annotations.underline) node = <u>{node}</u>
        }

        if (href) {
          node = (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              {node}
            </a>
          )
        }

        return <span key={i}>{node}</span>
      })}
    </>
  )
}
