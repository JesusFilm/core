import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('video variant reconciliation migration', () => {
  const migration = readFileSync(
    resolve(
      process.cwd(),
      'libs/prisma/media/db/migrations/20260721154000_video_variant_processing_reconciliation/migration.sql'
    ),
    'utf8'
  )

  it('adds dedicated reconciliation state without recreating uploads', () => {
    expect(migration).not.toContain('CREATE TYPE "VideoVariantUploadStatus"')
    expect(migration).not.toContain('CREATE TABLE "VideoVariantUpload"')
    expect(migration).toContain('CREATE TABLE "VideoVariantReconciliation"')
  })
})
