import type { PrismaModelTypes } from '@pothos/plugin-prisma'

import type PrismaTypes from '@core/prisma/journeys/__generated__/pothos-types'

import { builder } from '../../builder'
import { TranslatedValueRef, toTranslatedValues } from '../translatedValue'

type BuilderTypes =
  typeof builder extends PothosSchemaTypes.SchemaBuilder<infer Types>
    ? Types
    : never

type CampaignBlockModel = PrismaModelTypes & PrismaTypes['CampaignBlock']

type CampaignBlockRow = CampaignBlockModel['Shape']

/**
 * The part of the `t` of `builder.prismaObject('CampaignBlock', { fields: (t) => … })`
 * this module uses. Narrowed to `field` because each object's `t` carries
 * its own parent shape, which the whole builder type cannot be widened past.
 */
export type CampaignBlockFieldBuilder = Pick<
  PothosSchemaTypes.PrismaObjectFieldBuilder<
    BuilderTypes,
    CampaignBlockModel,
    CampaignBlockRow
  >,
  'field'
>

/** A CampaignBlock text column with a `<column>Translations` JSON sibling. */
export type TranslatableColumn = {
  [Key in keyof CampaignBlockRow]: Key extends `${infer Column}Translations`
    ? Column
    : never
}[keyof CampaignBlockRow]

/**
 * The `<column>Translations` field of a CampaignBlock object: the non-null
 * TranslatedValue list read from that column's JSON sibling.
 */
export function translationsField(
  t: CampaignBlockFieldBuilder,
  column: TranslatableColumn
) {
  const translationsColumn = `${column}Translations` as const
  return t.field({
    type: [TranslatedValueRef],
    nullable: false,
    resolve: (block) => toTranslatedValues(block[translationsColumn])
  })
}
