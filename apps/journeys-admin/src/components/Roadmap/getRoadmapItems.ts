import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

import matter from 'gray-matter'

import { RoadmapItem } from './Roadmap'

const CONTENT_DIR = join(process.cwd(), 'src/components/Roadmap/content')

/**
 * Reads and parses the roadmap markdown files at build time. Server-only —
 * import this from `getStaticProps`, never from a component, as it uses `fs`.
 */
export function getRoadmapItems(): RoadmapItem[] {
  const items = readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const { data, content } = matter(
        readFileSync(join(CONTENT_DIR, file), 'utf8')
      )

      return {
        title: String(data.title),
        order: Number(data.order),
        category: String(data.category),
        size: String(data.size),
        subRow: data.subRow != null ? Number(data.subRow) : 0,
        spanToEnd: data.spanToEnd === true,
        status: data.status != null ? String(data.status) : null,
        effort: data.effort != null ? String(data.effort) : null,
        content: content.trim()
      }
    })

  return items.sort((a, b) => a.order - b.order)
}
