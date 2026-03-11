import { writeFileSync, mkdirSync, renameSync } from 'fs'
import { join } from 'path'

const CACHE_DIR = process.env.VERCEL ? '/tmp/cache' : 'cache'

export interface CacheFile<T> {
  importedAt: string
  items: T[]
}

export function writeCacheFile<T>(filename: string, items: T[]): void {
  mkdirSync(CACHE_DIR, { recursive: true })

  const data: CacheFile<T> = {
    importedAt: new Date().toISOString(),
    items,
  }

  const target = join(CACHE_DIR, filename)
  const temp = `${target}.tmp`

  writeFileSync(temp, JSON.stringify(data, null, 2), 'utf-8')
  renameSync(temp, target)
}
