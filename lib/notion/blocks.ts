import type { BlockObjectResponse, PartialBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { createNotionClient } from './client'

export type NotionBlock = BlockObjectResponse & {
  children?: NotionBlock[]
}

export async function fetchBlocks(pageId: string): Promise<NotionBlock[]> {
  const notion = createNotionClient()
  const blocks: NotionBlock[] = []
  let cursor: string | undefined = undefined

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    })

    for (const block of response.results) {
      if (isFullBlock(block)) {
        const notionBlock: NotionBlock = { ...block }
        if (block.has_children) {
          notionBlock.children = await fetchBlocks(block.id)
        }
        blocks.push(notionBlock)
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  return blocks
}

function isFullBlock(
  block: BlockObjectResponse | PartialBlockObjectResponse
): block is BlockObjectResponse {
  return 'type' in block
}
