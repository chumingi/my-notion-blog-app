function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function resolveSlug(
  slugProp: string | null,
  pageId: string,
  seen: Set<string>
): string {
  const base = slugProp?.trim()
    ? sanitizeSlug(slugProp.trim())
    : pageId.replace(/-/g, '')

  if (!seen.has(base)) return base

  let i = 2
  while (seen.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}
