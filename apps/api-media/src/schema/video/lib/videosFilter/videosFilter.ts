import { Prisma } from '.prisma/api-media-client'

import { type VideosFilter } from '../../inputs/videosFilter'
import { parseFullTextSearch } from '../parseFullTextSearch'

export function videosFilter({
  title,
  availableVariantLanguageIds,
  labels,
  ids,
  subtitleLanguageIds
}: typeof VideosFilter.$inferInput): Prisma.VideoWhereInput {
  return {
    title:
      title != null
        ? { some: { value: { search: parseFullTextSearch(title) } } }
        : undefined,
    subtitles:
      subtitleLanguageIds != null
        ? {
            some: {
              languageId: { in: subtitleLanguageIds }
            }
          }
        : undefined,
    variants:
      availableVariantLanguageIds != null
        ? {
            some: {
              languageId: { in: availableVariantLanguageIds }
            }
          }
        : undefined,
    label: labels != null ? { in: labels } : undefined,
    id: ids != null ? { in: ids } : undefined
  }
}
