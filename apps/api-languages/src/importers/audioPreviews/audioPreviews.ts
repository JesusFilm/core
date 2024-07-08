import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { getRowsFromTable } from '../bigquery'

const audioPreviewSchema = z.object({})

type AudioPreview = z.infer<typeof audioPreviewSchema>

export async function importAudioPreview(
  existingLanguageIds: string[]
): Promise<void> {
  const bigQueryTableName = ''
  const importTime = await prisma.importTimes.findUnique({
    where: { modelName: bigQueryTableName }
  })
  for await (const row of getRowsFromTable(
    bigQueryTableName,
    importTime?.lastImport,
    true
  )) {
    try {
      await service.import(row)
    } catch (error) {
      errors.push({
        bigQueryTableName,
        id: get(row, 'id') ?? get(row, 'videoId'),
        message: error.message
      })
    }
  }
  return Promise.resolve()
}
