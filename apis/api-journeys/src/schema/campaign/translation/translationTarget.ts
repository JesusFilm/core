import { Prisma } from '@core/prisma/journeys/client'

import { INCLUDE_CAMPAIGN_ACL } from '../campaign.acl'
import { TranslationsJson } from '../translatedValue'

import {
  CAMPAIGN_BLOCK_TEXT_FIELDS,
  CAMPAIGN_REGION_TEXT_FIELDS,
  CAMPAIGN_STRING_TEXT_FIELDS,
  CAMPAIGN_TITLE_TEXT_FIELDS,
  CampaignTextFieldCaps
} from './textFields'

/** The four rows a Translated Field lives on. */
export type TranslationTargetKind = 'block' | 'region' | 'string' | 'campaign'

export const INCLUDE_TARGET_CAMPAIGN = {
  ...INCLUDE_CAMPAIGN_ACL,
  languages: true
} satisfies Prisma.CampaignInclude

export type TranslationTargetCampaign = Prisma.CampaignGetPayload<{
  include: typeof INCLUDE_TARGET_CAMPAIGN
}>

type Row = Record<string, unknown>

interface TranslationTargetModel {
  /** The live target row with every column, or null. */
  find: (db: Prisma.TransactionClient, id: string) => Promise<Row | null>
  /** The live target row and its campaign (ACL and languages), or null. */
  findWithCampaign: (
    db: Prisma.TransactionClient,
    id: string
  ) => Promise<{ row: Row; campaign: TranslationTargetCampaign } | null>
  /** The `select`ed columns of the target row, read by id. */
  select: (
    db: Prisma.TransactionClient,
    id: string,
    select: Record<string, true>
  ) => Promise<Row | null>
  /** Write `<field>Translations` columns of the target row. */
  update: (
    db: Prisma.TransactionClient,
    id: string,
    data: Record<string, TranslationsJson>
  ) => Promise<void>
  /** The target's translatable fields and their caps; a block's follow its typename. */
  caps: (row: Row) => CampaignTextFieldCaps
}

/**
 * Each translation target kind's Prisma model, reads, write and text caps:
 * the one place `campaignTranslationSet` and the machine-translation sweep
 * turn a kind into a table.
 */
export const TRANSLATION_TARGETS: Record<
  TranslationTargetKind,
  TranslationTargetModel
> = {
  block: {
    find: async (db, id) =>
      await db.campaignBlock.findFirst({ where: { id, deletedAt: null } }),
    findWithCampaign: async (db, id) => {
      const block = await db.campaignBlock.findFirst({
        where: { id, deletedAt: null },
        include: { campaign: { include: INCLUDE_TARGET_CAMPAIGN } }
      })
      return block == null ? null : { row: block, campaign: block.campaign }
    },
    select: async (db, id, select) =>
      await db.campaignBlock.findUnique({ where: { id }, select }),
    update: async (db, id, data) => {
      await db.campaignBlock.update({ where: { id }, data })
    },
    caps: (row) => CAMPAIGN_BLOCK_TEXT_FIELDS[String(row.typename)] ?? {}
  },
  region: {
    find: async (db, id) =>
      await db.campaignRegion.findUnique({ where: { id } }),
    findWithCampaign: async (db, id) => {
      const region = await db.campaignRegion.findUnique({
        where: { id },
        include: { campaign: { include: INCLUDE_TARGET_CAMPAIGN } }
      })
      return region == null ? null : { row: region, campaign: region.campaign }
    },
    select: async (db, id, select) =>
      await db.campaignRegion.findUnique({ where: { id }, select }),
    update: async (db, id, data) => {
      await db.campaignRegion.update({ where: { id }, data })
    },
    caps: () => CAMPAIGN_REGION_TEXT_FIELDS
  },
  string: {
    find: async (db, id) =>
      await db.campaignString.findUnique({ where: { id } }),
    findWithCampaign: async (db, id) => {
      const string = await db.campaignString.findUnique({
        where: { id },
        include: { campaign: { include: INCLUDE_TARGET_CAMPAIGN } }
      })
      return string == null ? null : { row: string, campaign: string.campaign }
    },
    select: async (db, id, select) =>
      await db.campaignString.findUnique({ where: { id }, select }),
    update: async (db, id, data) => {
      await db.campaignString.update({ where: { id }, data })
    },
    caps: () => CAMPAIGN_STRING_TEXT_FIELDS
  },
  campaign: {
    find: async (db, id) => await db.campaign.findUnique({ where: { id } }),
    findWithCampaign: async (db, id) => {
      const campaign = await db.campaign.findUnique({
        where: { id },
        include: INCLUDE_TARGET_CAMPAIGN
      })
      return campaign == null ? null : { row: campaign, campaign }
    },
    select: async (db, id, select) =>
      await db.campaign.findUnique({ where: { id }, select }),
    update: async (db, id, data) => {
      await db.campaign.update({ where: { id }, data })
    },
    caps: () => CAMPAIGN_TITLE_TEXT_FIELDS
  }
}
