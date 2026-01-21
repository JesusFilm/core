import type { Core } from '@strapi/strapi'

const DEFAULT_LOCALE = 'en'

export async function activateLocales(strapi: Core.Strapi): Promise<void> {
  try {
    strapi.log.info('Deleting locales except default...')
    const localesToDelete = await strapi
      .documents('plugin::i18n.locale')
      .findMany({
        filters: {
          code: {
            $not: DEFAULT_LOCALE
          }
        },
        fields: ['documentId', 'code']
      })

    if (localesToDelete.length > 0) {
      for (const locale of localesToDelete) {
        try {
          await strapi
            .documents('plugin::i18n.locale')
            .delete({ documentId: locale.documentId })
        } catch (error) {
          strapi.log.error(
            `Failed to delete locale ${locale.code}:`,
            error
          )
        }
      }
      strapi.log.info(
        `Deleted ${localesToDelete.length} locale(s) except default (${DEFAULT_LOCALE})`
      )
    }

    strapi.log.info('Activating locales...')

    const languages = await strapi
      .documents('api::language.language')
      .findMany({
        filters: {
          bcp47: {
            $notNull: true,
            $not: 'en'
          },
          locale: {
            $eq: 'en'
          }
        },
        fields: ['bcp47', 'name']
      })

    strapi.log.info(`Found ${languages.length} languages to activate locales for`)

    let createdCount = 0
    const createdCodes: string[] = []

    for (const { bcp47, name }  of languages) {
      try {
        const existing = await strapi
          .documents('plugin::i18n.locale')
          .findFirst({
            filters: {
              code: {
                $eq: bcp47
              }
            }
          })

        if (!existing) {
          await strapi.documents('plugin::i18n.locale').create({
            data: {
              code: bcp47,
              name: `${name} (${bcp47})`
            }
          })
          createdCount++
          createdCodes.push(bcp47)
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        if (
          errorMessage.includes('duplicate key') ||
          errorMessage.includes('unique constraint')
        ) {
          strapi.log.debug(
            `Locale ${bcp47} already exists or is being created concurrently`
          )
        } else {
          strapi.log.error(`Failed to create locale ${bcp47}:`, error)
        }
      }
    }

    if (createdCount > 0) {
      strapi.log.info(
        `Activated ${createdCount} locale(s) in i18n plugin: ${createdCodes.join(', ')}`
      )
    }
  } catch (error) {
    strapi.log.error('Failed to activate locales in i18n plugin:', error)
  }
}
