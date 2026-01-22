import { Prisma, prisma } from '@core/prisma/languages/client'

import { updateLanguageInAlgolia } from '../../../lib/algolia/algoliaLanguageUpdate/algoliaLanguageUpdate'
import { builder } from '../../builder'
import { logger } from '../../logger'

type LanguageNameWhereUniqueInput = {
  parentLanguageId: string
  languageId: string
}

function toWhereUnique({
  parentLanguageId,
  languageId
}: LanguageNameWhereUniqueInput): Prisma.LanguageNameWhereUniqueInput {
  return {
    parentLanguageId_languageId: {
      parentLanguageId,
      languageId
    }
  }
}

builder.mutationFields((t) => ({
  languageNameCreate: t.withAuth({ isPublisher: true }).prismaFieldWithInput({
    type: 'LanguageName',
    nullable: false,
    input: {
      parentLanguageId: t.input.id({ required: true }),
      languageId: t.input.id({ required: true }),
      value: t.input.string({ required: true }),
      primary: t.input.boolean({ required: true })
    },
    resolve: async (
      query,
      _parent,
      { input: { parentLanguageId, languageId, value, primary } }
    ) => {
      const created = await prisma.$transaction(async (tx) => {
        if (primary) {
          await tx.languageName.updateMany({
            where: { parentLanguageId, primary: true },
            data: { primary: false }
          })
        }

        return await tx.languageName.create({
          ...query,
          data: {
            parentLanguageId,
            languageId,
            value,
            primary
          }
        })
      })

      try {
        await updateLanguageInAlgolia(parentLanguageId, logger)
      } catch (err) {
        logger.error(
          { err, parentLanguageId, languageId },
          'Algolia update error after languageNameCreate'
        )
      }

      return created
    }
  }),
  languageNameUpdate: t.withAuth({ isPublisher: true }).prismaFieldWithInput({
    type: 'LanguageName',
    nullable: false,
    input: {
      parentLanguageId: t.input.id({ required: true }),
      languageId: t.input.id({ required: true }),
      value: t.input.string({ required: false }),
      primary: t.input.boolean({ required: false })
    },
    resolve: async (
      query,
      _parent,
      { input: { parentLanguageId, languageId, value, primary } }
    ) => {
      const data: Prisma.LanguageNameUpdateInput = {}
      if (value !== undefined) data.value = value
      if (primary !== undefined) data.primary = primary

      if (Object.keys(data).length === 0) {
        throw new Error('No fields provided to update')
      }

      const updated = await prisma.$transaction(async (tx) => {
        if (primary === true) {
          await tx.languageName.updateMany({
            where: { parentLanguageId, primary: true },
            data: { primary: false }
          })
        }

        return await tx.languageName.update({
          ...query,
          where: toWhereUnique({ parentLanguageId, languageId }),
          data
        })
      })

      try {
        await updateLanguageInAlgolia(parentLanguageId, logger)
      } catch (err) {
        logger.error(
          { err, parentLanguageId, languageId },
          'Algolia update error after languageNameUpdate'
        )
      }

      return updated
    }
  }),
  languageNameDelete: t.withAuth({ isPublisher: true }).prismaFieldWithInput({
    type: 'LanguageName',
    nullable: false,
    input: {
      parentLanguageId: t.input.id({ required: true }),
      languageId: t.input.id({ required: true })
    },
    resolve: async (query, _parent, { input: { parentLanguageId, languageId } }) => {
      const deleted = await prisma.languageName.delete({
        ...query,
        where: toWhereUnique({ parentLanguageId, languageId })
      })

      try {
        await updateLanguageInAlgolia(parentLanguageId, logger)
      } catch (err) {
        logger.error(
          { err, parentLanguageId, languageId },
          'Algolia update error after languageNameDelete'
        )
      }

      return deleted
    }
  })
}))

