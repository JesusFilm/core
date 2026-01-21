import { Core } from '@strapi/types'
import { Input } from '@strapi/types/dist/modules/documents/params/data'

import { importLanguages } from './importers/languageImporter'
import { importVideos } from './importers/videoImporter'
import { importVideoVariants } from './importers/videoVariantImporter'
import type { ImportStats } from './types'

export async function runMediaImport(
  strapi: Core.Strapi
): Promise<ImportStats> {
  const startTime = Date.now()
  const errors: string[] = []
  let languagesImported = 0
  const videosImported = 0
  const videoVariantsImported = 0

  try {
    const importState = await strapi
      .documents('api::import-state.import-state')
      .findFirst()

    const state = {
      lastLanguageImport: importState?.lastLanguageImport
        ? new Date(importState.lastLanguageImport)
        : null,
      lastMediaImport: importState?.lastMediaImport
        ? new Date(importState.lastMediaImport)
        : null
    }

    strapi.log.info('Starting media import...', {
      lastLanguageImport: state.lastLanguageImport,
      lastMediaImport: state.lastMediaImport
    })
    const currentLastLanguageImport = new Date()

    const languageResult = await importLanguages(
      strapi,
      state.lastLanguageImport
    )
    languagesImported = languageResult.imported
    errors.push(...languageResult.errors)

    if (languageResult.errors.length === 0) {
      await upsertImportState(strapi, {
        lastLanguageImport: currentLastLanguageImport
      })
      strapi.log.info(
        `Language import completed: ${languagesImported} imported`
      )
    } else {
      strapi.log.warn(
        `Language import completed with errors: ${languagesImported} imported, ${languageResult.errors.length} errors`
      )
    }

    // const videoResult = await importVideos(strapi, state.lastMediaImport)
    // videosImported = videoResult.imported
    // errors.push(...videoResult.errors)

    // const currentLastMediaImport = new Date()

    // const variantResult = await importVideoVariants(
    //   strapi,
    //   state.lastMediaImport
    // )
    // videoVariantsImported = variantResult.imported
    // errors.push(...variantResult.errors)

    // if (videoResult.errors.length === 0 && variantResult.errors.length === 0) {
    //   await upsertImportState(strapi, {
    //     lastMediaImport: currentLastMediaImport
    //   })
    //   strapi.log.info(
    //     `Media import completed: ${videosImported} videos, ${videoVariantsImported} variants imported`
    //   )
    // } else {
    //   strapi.log.warn(
    //     `Media import completed with errors: ${videosImported} videos, ${videoVariantsImported} variants imported, ${videoResult.errors.length + variantResult.errors.length} errors`
    //   )
    // }
  } catch (error) {
    const errorMessage = `Media import failed: ${
      error instanceof Error ? error.message : String(error)
    }`
    errors.push(errorMessage)
    strapi.log.error(errorMessage, error)
  }

  const duration = Date.now() - startTime

  const stats: ImportStats = {
    languagesImported,
    videosImported,
    videoVariantsImported,
    errors,
    duration
  }

  strapi.log.info('Media import finished', stats)

  return stats
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
