import { Client } from "@notionhq/client";

/**
 * Returns a Notion client authenticated with the stored access token.
 * Throws if NOTION_ACCESS_TOKEN is not set (OAuth not completed yet).
 * Call this only in server-side code.
 */
export function createNotionClient(): Client {
  const accessToken = process.env.NOTION_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error(
      "NOTION_ACCESS_TOKEN is not set. Complete OAuth at /notion/connect first."
    );
  }

  return new Client({ auth: accessToken });
}

export function isNotionConnected(): boolean {
  return Boolean(process.env.NOTION_ACCESS_TOKEN);
}
