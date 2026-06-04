import { PrismaPg } from '@prisma/adapter-pg'

import {
  runCloudfrontAudit,
  type ServiceConfig
} from './lib/arclightCloudfrontAudit'
import { PrismaClient as LanguagesPrismaClient } from '../../libs/prisma/languages/src/__generated__/client/client'
import { PrismaClient as MediaPrismaClient } from '../../libs/prisma/media/src/__generated__/client/client'

/*
 * Full read-only audit for legacy Arclight CloudFront references.
 *
 * Provide both stage and prod URLs when available:
 *   PG_DATABASE_URL_MEDIA_PROD="postgresql://..." \
 *   PG_DATABASE_URL_MEDIA_STAGE="postgresql://..." \
 *   PG_DATABASE_URL_LANGUAGES_PROD="postgresql://..." \
 *   PG_DATABASE_URL_LANGUAGES_STAGE="postgresql://..." \
 *   pnpm exec tsx --tsconfig tsconfig.base.json tools/scripts/audit-arclight-cloudfront-refs.ts
 *
 * The script also accepts PG_DATABASE_URL_MEDIA and PG_DATABASE_URL_LANGUAGES
 * for a single current-environment audit. It only runs SELECT queries.
 */

const mediaService: ServiceConfig = {
  name: 'api-media',
  databaseUrlEnv: 'PG_DATABASE_URL_MEDIA',
  outputDir: '.cache/api-media',
  flaggedColumns: [
    { table: 'VideoVariantDownload', column: 'url' },
    { table: 'VideoSubtitle', column: 'srtSrc' },
    { table: 'VideoSubtitle', column: 'vttSrc' }
  ],
  createPrismaClient: (connectionString) =>
    new MediaPrismaClient({
      adapter: new PrismaPg({
        connectionString,
        connectionTimeoutMillis: 5_000,
        idleTimeoutMillis: 10_000
      })
    }),
  typedCount: async (prisma, table, column, hostname) => {
    if (table === 'VideoVariantDownload' && column === 'url') {
      return prisma.videoVariantDownload.count({
        where: { url: { contains: hostname } }
      })
    }

    if (table === 'VideoSubtitle' && column === 'srtSrc') {
      return prisma.videoSubtitle.count({
        where: { srtSrc: { contains: hostname } }
      })
    }

    if (table === 'VideoSubtitle' && column === 'vttSrc') {
      return prisma.videoSubtitle.count({
        where: { vttSrc: { contains: hostname } }
      })
    }

    return undefined
  }
}

const languagesService: ServiceConfig = {
  name: 'api-languages',
  databaseUrlEnv: 'PG_DATABASE_URL_LANGUAGES',
  outputDir: '.cache/api-languages',
  flaggedColumns: [{ table: 'AudioPreview', column: 'value' }],
  createPrismaClient: (connectionString) =>
    new LanguagesPrismaClient({
      adapter: new PrismaPg({
        connectionString,
        connectionTimeoutMillis: 5_000,
        idleTimeoutMillis: 10_000
      })
    }),
  typedCount: async (prisma, table, column, hostname) => {
    if (table === 'AudioPreview' && column === 'value') {
      return prisma.audioPreview.count({
        where: { value: { contains: hostname } }
      })
    }

    return undefined
  }
}

runCloudfrontAudit([mediaService, languagesService]).catch((error) => {
  console.error(error)
  process.exit(1)
})
