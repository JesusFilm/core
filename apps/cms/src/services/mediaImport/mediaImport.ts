import { Core } from '@strapi/types'
import { Input } from '@strapi/types/dist/modules/documents/params/data'

import { importLanguages } from './importers/languageImporter'
import { importVideoEditions } from './importers/videoEditionImporter'
import { importVideos } from './importers/videoImporter'
import { importVideoVariants } from './importers/videoVariantImporter'

export async function runMediaImport(strapi: Core.Strapi): Promise<void> {
  const importState = {
    ...(await strapi.documents('api::import-state.import-state').findFirst()),
    importStartedAt: new Date()
  }

  strapi.log.info('Starting media import...', importState)

  await importAndLogErrors(
    strapi,
    importLanguages,
    'LanguageImport',
    importState
  )
  await importAndLogErrors(strapi, importVideos, 'VideoImport', importState)
  await importAndLogErrors(
    strapi,
    importVideoEditions,
    'VideoEditionImport',
    importState
  )
  await importAndLogErrors(
    strapi,
    importVideoVariants,
    'VideoVariantImport',
    importState
  )
  strapi.log.info('Media import finished')
}

type ImportState = {
  importStartedAt: Date
  lastLanguageImportedAt?: Date | string | null
  lastVideoImportedAt?: Date | string | null
  lastVideoVariantImportedAt?: Date | string | null
  lastVideoEditionImportedAt?: Date | string | null
}
type ImportFn = (
  strapi: Core.Strapi,
  lastImportedAt: Date | undefined
) => Promise<{ imported: number; errors: string[] }>
type Typename =
  | 'LanguageImport'
  | 'VideoImport'
  | 'VideoVariantImport'
  | 'VideoEditionImport'

async function importAndLogErrors(
  strapi: Core.Strapi,
  importFunction: ImportFn,
  typename: Typename,
  importState: ImportState
) {
  const importStateKey = `last${typename}ImportedAt`
  const lastImportedAt = importState[importStateKey] as
    | Date
    | string
    | undefined
  const formattedLastImportedAt = lastImportedAt
    ? lastImportedAt instanceof Date
      ? lastImportedAt
      : new Date(lastImportedAt)
    : undefined
  if (formattedLastImportedAt) {
    strapi.log.info(
      `${typename}: Importing from ${formattedLastImportedAt.toISOString()}`
    )
  } else {
    strapi.log.info(`${typename}: Importing all records`)
  }
  const result = await importFunction(strapi, formattedLastImportedAt)
  if (result.errors.length > 0) {
    strapi.log.warn(
      `${typename}: ${result.imported} imported with ${result.errors.length} error(s)`
    )
  } else {
    strapi.log.info(`${typename}: ${result.imported} imported`)
    await upsertImportState(strapi, {
      [importStateKey]: importState.importStartedAt
    })
  }
  return result
}

async function upsertImportState(
  strapi: Core.Strapi,
  data: Partial<Input<'api::import-state.import-state'>>
) {
  const importState = await strapi
    .documents('api::import-state.import-state')
    .findFirst()
  if (importState) {
    await strapi.documents('api::import-state.import-state').update({
      documentId: importState.documentId,
      data
    })
  } else {
    await strapi.documents('api::import-state.import-state').create({
      data
    })
  }
}
