import Image from 'next/image'
import { codeToTokens, bundledLanguages } from 'shiki'
import type { BundledLanguage } from 'shiki'
import type { NotionBlock } from '@/lib/notion/blocks'
import { RichText } from './RichText'

interface Props {
  blocks: NotionBlock[]
}

export function NotionBlocks({ blocks }: Props) {
  const result: React.ReactNode[] = []
  let i = 0

  while (i < blocks.length) {
    const block = blocks[i]

    if (block.type === 'bulleted_list_item') {
      const listItems: NotionBlock[] = []
      while (i < blocks.length && blocks[i].type === 'bulleted_list_item') {
        listItems.push(blocks[i])
        i++
      }
      result.push(
        <ul key={`ul-${listItems[0].id}`} className="list-disc pl-6 my-3 space-y-1">
          {listItems.map((item) => (
            <NotionBlock key={item.id} block={item} />
          ))}
        </ul>
      )
      continue
    }

    if (block.type === 'numbered_list_item') {
      const listItems: NotionBlock[] = []
      while (i < blocks.length && blocks[i].type === 'numbered_list_item') {
        listItems.push(blocks[i])
        i++
      }
      result.push(
        <ol key={`ol-${listItems[0].id}`} className="list-decimal pl-6 my-3 space-y-1">
          {listItems.map((item) => (
            <NotionBlock key={item.id} block={item} />
          ))}
        </ol>
      )
      continue
    }

    result.push(<NotionBlock key={block.id} block={block} />)
    i++
  }

  return <>{result}</>
}

async function NotionBlock({ block }: { block: NotionBlock }) {
  switch (block.type) {
    case 'paragraph': {
      const { rich_text } = block.paragraph
      return (
        <p className="my-3 leading-7">
          <RichText richText={rich_text} />
        </p>
      )
    }

    case 'heading_1': {
      const { rich_text } = block.heading_1
      const id = block.id
      return (
        <h1 id={id} className="text-3xl font-bold mt-10 mb-4">
          <RichText richText={rich_text} />
        </h1>
      )
    }

    case 'heading_2': {
      const { rich_text } = block.heading_2
      const id = block.id
      return (
        <h2 id={id} className="text-2xl font-semibold mt-8 mb-3">
          <RichText richText={rich_text} />
        </h2>
      )
    }

    case 'heading_3': {
      const { rich_text } = block.heading_3
      const id = block.id
      return (
        <h3 id={id} className="text-xl font-semibold mt-6 mb-2">
          <RichText richText={rich_text} />
        </h3>
      )
    }

    case 'bulleted_list_item': {
      const { rich_text } = block.bulleted_list_item
      return (
        <li className="leading-7">
          <RichText richText={rich_text} />
          {block.children && block.children.length > 0 && (
            <ul className="list-disc pl-6 mt-1 space-y-1">
              {block.children
                .filter((c) => c.type === 'bulleted_list_item')
                .map((child) => (
                  <NotionBlock key={child.id} block={child} />
                ))}
            </ul>
          )}
        </li>
      )
    }

    case 'numbered_list_item': {
      const { rich_text } = block.numbered_list_item
      return (
        <li className="leading-7">
          <RichText richText={rich_text} />
          {block.children && block.children.length > 0 && (
            <ol className="list-decimal pl-6 mt-1 space-y-1">
              {block.children
                .filter((c) => c.type === 'numbered_list_item')
                .map((child) => (
                  <NotionBlock key={child.id} block={child} />
                ))}
            </ol>
          )}
        </li>
      )
    }

    case 'code': {
      const { rich_text, language } = block.code
      const code = rich_text.map((t) => t.plain_text).join('')
      const mapped = mapLanguage(language)
      const lang: BundledLanguage = (mapped in bundledLanguages ? mapped : 'text') as BundledLanguage
      const { tokens, fg, bg } = await codeToTokens(code, {
        lang,
        theme: 'github-light',
      })
      return (
        <pre
          className="my-4 rounded-lg overflow-auto text-sm p-4"
          style={{ color: fg, backgroundColor: bg }}
        >
          <code>
            {tokens.map((line, li) => (
              <span key={li} className="block">
                {line.map((token, ti) => (
                  <span key={ti} style={{ color: token.color }}>
                    {token.content}
                  </span>
                ))}
              </span>
            ))}
          </code>
        </pre>
      )
    }

    case 'image': {
      const src =
        block.image.type === 'external'
          ? block.image.external.url
          : block.image.file.url
      const caption =
        block.image.caption.length > 0
          ? block.image.caption.map((t) => t.plain_text).join('')
          : undefined
      return (
        <figure className="my-6">
          <div className="relative w-full min-h-48">
            <Image
              src={src}
              alt={caption ?? ''}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
          {caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {caption}
            </figcaption>
          )}
        </figure>
      )
    }

    case 'quote': {
      const { rich_text } = block.quote
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 my-4 text-gray-600 italic">
          <RichText richText={rich_text} />
        </blockquote>
      )
    }

    case 'callout': {
      const { rich_text, icon } = block.callout
      const emoji =
        icon?.type === 'emoji' ? icon.emoji : undefined
      return (
        <div className="flex gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
          {emoji && <span className="text-xl shrink-0">{emoji}</span>}
          <div className="leading-7">
            <RichText richText={rich_text} />
          </div>
        </div>
      )
    }

    case 'divider': {
      return <hr className="my-8 border-gray-200" />
    }

    case 'toggle': {
      const { rich_text } = block.toggle
      return (
        <details className="my-3 group">
          <summary className="cursor-pointer font-medium list-none flex items-center gap-2 select-none">
            <span className="text-gray-400 transition-transform group-open:rotate-90">▶</span>
            <RichText richText={rich_text} />
          </summary>
          {block.children && block.children.length > 0 && (
            <div className="pl-6 mt-2">
              <NotionBlocks blocks={block.children} />
            </div>
          )}
        </details>
      )
    }

    default: {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn(`[NotionBlock] Unsupported block type: ${block.type}`)
      }
      return null
    }
  }
}

function mapLanguage(lang: string): string {
  const map: Record<string, string> = {
    plain_text: 'text',
    abap: 'abap',
    arduino: 'arduino',
    bash: 'bash',
    basic: 'vb',
    c: 'c',
    clojure: 'clojure',
    coffeescript: 'coffeescript',
    'c++': 'cpp',
    'c#': 'csharp',
    css: 'css',
    dart: 'dart',
    diff: 'diff',
    docker: 'dockerfile',
    elixir: 'elixir',
    elm: 'elm',
    erlang: 'erlang',
    flow: 'javascript',
    fortran: 'fortran-fixed-form',
    'f#': 'fsharp',
    gherkin: 'gherkin',
    glsl: 'glsl',
    go: 'go',
    graphql: 'graphql',
    groovy: 'groovy',
    haskell: 'haskell',
    html: 'html',
    java: 'java',
    javascript: 'javascript',
    json: 'json',
    julia: 'julia',
    kotlin: 'kotlin',
    latex: 'latex',
    less: 'less',
    lisp: 'lisp',
    livescript: 'livescript',
    lua: 'lua',
    makefile: 'makefile',
    markdown: 'markdown',
    markup: 'html',
    matlab: 'matlab',
    mermaid: 'mermaid',
    nix: 'nix',
    'objective-c': 'objective-c',
    ocaml: 'ocaml',
    pascal: 'pascal',
    perl: 'perl',
    php: 'php',
    'plain text': 'text',
    powershell: 'powershell',
    prolog: 'prolog',
    protobuf: 'proto',
    python: 'python',
    r: 'r',
    reason: 'reason',
    ruby: 'ruby',
    rust: 'rust',
    sass: 'sass',
    scala: 'scala',
    scheme: 'scheme',
    scss: 'scss',
    shell: 'bash',
    sql: 'sql',
    swift: 'swift',
    typescript: 'typescript',
    'vb.net': 'vb',
    verilog: 'verilog',
    vhdl: 'vhdl',
    'visual basic': 'vb',
    webassembly: 'wasm',
    xml: 'xml',
    yaml: 'yaml',
    mxml: 'xml',
  }
  return map[lang.toLowerCase()] ?? 'text'
}
