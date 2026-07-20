import { Prisma, prisma } from '@core/prisma/languages/client'

import { builder } from '../builder'

function optionalInt(
  value: number | null | undefined
): number | null | undefined {
  return value === undefined ? undefined : value
}

const CountryLanguageCreateInput = builder.inputType(
  'CountryLanguageCreateInput',
  {
    fields: (t) => ({
      languageId: t.id({ required: true }),
      countryId: t.id({ required: true }),
      speakers: t.int({ required: true }),
      displaySpeakers: t.int({ required: false }),
      primary: t.boolean({ required: false }),
      suggested: t.boolean({ required: false }),
      order: t.int({ required: false })
    })
  }
)

const CountryLanguageUpdateInput = builder.inputType(
  'CountryLanguageUpdateInput',
  {
    fields: (t) => ({
      id: t.id({ required: true }),
      languageId: t.id({ required: false }),
      countryId: t.id({ required: false }),
      speakers: t.int({ required: false }),
      displaySpeakers: t.int({ required: false }),
      primary: t.boolean({ required: false }),
      suggested: t.boolean({ required: false }),
      order: t.int({ required: false })
    })
  }
)

builder.prismaObject('CountryLanguage', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    language: t.relation('language', { nullable: false }),
    country: t.relation('country', { nullable: false }),
    speakers: t.exposeInt('speakers', { nullable: false }),
    displaySpeakers: t.exposeInt('displaySpeakers'),
    primary: t.exposeBoolean('primary', { nullable: false }),
    suggested: t.exposeBoolean('suggested', { nullable: false }),
    order: t.exposeInt('order')
  })
})

builder.mutationFields((t) => ({
  countryLanguageCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'CountryLanguage',
    nullable: false,
    args: {
      input: t.arg({ type: CountryLanguageCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      if (input.speakers < 0) {
        throw new Error('Speakers must be greater than or equal to 0')
      }

      return await prisma.countryLanguage.create({
        ...query,
        data: {
          languageId: input.languageId,
          countryId: input.countryId,
          speakers: input.speakers,
          displaySpeakers: optionalInt(input.displaySpeakers),
          primary: input.primary ?? false,
          suggested: input.suggested ?? false,
          order: optionalInt(input.order)
        }
      })
    }
  }),
  countryLanguageUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'CountryLanguage',
    nullable: false,
    args: {
      input: t.arg({ type: CountryLanguageUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      const data: Prisma.CountryLanguageUncheckedUpdateInput = {}
      if (input.speakers !== undefined) {
        if (input.speakers == null) {
          throw new Error('Speakers is required')
        }
        if (input.speakers < 0) {
          throw new Error('Speakers must be greater than or equal to 0')
        }
        data.speakers = input.speakers
      }
      if (input.displaySpeakers !== undefined) {
        data.displaySpeakers = optionalInt(input.displaySpeakers)
      }
      if (input.languageId != null) data.languageId = input.languageId
      if (input.countryId != null) data.countryId = input.countryId
      if (input.primary != null) data.primary = input.primary
      if (input.suggested != null) data.suggested = input.suggested
      if (input.order !== undefined) data.order = optionalInt(input.order)

      if (Object.keys(data).length === 0) {
        throw new Error('No fields provided to update')
      }

      return await prisma.countryLanguage.update({
        ...query,
        where: { id: input.id },
        data
      })
    }
  }),
  countryLanguageDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'CountryLanguage',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) =>
      await prisma.countryLanguage.delete({
        ...query,
        where: { id }
      })
  })
}))
