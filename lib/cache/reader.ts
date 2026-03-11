import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { CacheFile } from './writer'

const CACHE_DIR = process.env.VERCEL ? '/tmp/cache' : 'cache'

export function readCacheFile<T>(filename: string): CacheFile<T> | null {
  const filePath = join(CACHE_DIR, filename)
  if (!existsSync(filePath)) return null

  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as CacheFile<T>
  } catch {
    return null
  }
}
