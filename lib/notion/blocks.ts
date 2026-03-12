import type { BlockObjectResponse, PartialBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { createNotionClient } from './client'

export type NotionBlock = BlockObjectResponse

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
        blocks.push(block)
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
