import { v4 as uuidv4 } from 'uuid'

import { CampaignStringKey, Prisma } from '@core/prisma/journeys/client'

import { assertPalette } from '../validation'

import { CAMPAIGN_STRING_KEYS } from './campaignStrings'
import { LIGHT_PRESET, presetColors } from './presets'
import {
  FOOTER_LINK_SEED,
  FOOTER_SEED,
  HEADER_NAV_SEED,
  HEADER_SEED,
  LANDING_HERO,
  LANDING_HERO_BUTTON_SEED,
  LANDING_REGION_SWITCHER,
  LANDING_SECTION_SEED,
  REGION_SECTION_SEED,
  SectionSeed,
  footerCopyrightSeed
} from './sections'

export interface SeedCampaignInput {
  teamId: string
  title: string
  slug: string
  defaultLanguageId: string
  /** The seventeen string values, already resolved for the default language. */
  strings: Record<CampaignStringKey, string>
  /** The creation year, printed in the footer copyright line. */
  year: number
  generateId?: () => string
}

/**
 * The Campaign Seed (PRD §14): everything a campaign is born with, written
 * inside the caller's transaction in a fixed order. Ids are generated up front
 * so ScrollToBlockAction targets exist in the same transaction. Returns the
 * new campaign id.
 */
export async function seedCampaign(
  tx: Prisma.TransactionClient,
  input: SeedCampaignInput
): Promise<string> {
  const generateId = input.generateId ?? uuidv4
  const campaignId = generateId()

  await tx.campaign.create({
    data: {
      id: campaignId,
      teamId: input.teamId,
      title: input.title,
      slug: input.slug,
      status: 'draft',
      defaultLanguageId: input.defaultLanguageId,
      palette: assertPalette(presetColors(LIGHT_PRESET)),
      publishedAt: null
    }
  })

  await tx.campaignLanguage.create({
    data: {
      id: generateId(),
      campaignId,
      languageId: input.defaultLanguageId,
      order: 0
    }
  })

  await tx.campaignTheme.create({
    data: {
      id: generateId(),
      campaignId,
      ...LIGHT_PRESET,
      headerFont: null,
      bodyFont: null,
      labelFont: null,
      radius: 'rounded',
      buttonRadius: 'pill'
    }
  })

  const landingPageId = generateId()
  await tx.campaignPage.create({
    data: { id: landingPageId, campaignId, kind: 'landing' }
  })
  const regionPageId = generateId()
  await tx.campaignPage.create({
    data: { id: regionPageId, campaignId, kind: 'regionTemplate' }
  })

  async function createBlock(
    seed: SectionSeed,
    scope: {
      pageId: string | null
      parentBlockId: string | null
      parentOrder: number
    }
  ): Promise<string> {
    const id = generateId()
    await tx.campaignBlock.create({
      data: {
        id,
        campaignId,
        pageId: scope.pageId,
        regionId: null,
        parentBlockId: scope.parentBlockId,
        parentOrder: scope.parentOrder,
        ...seed
      }
    })
    return id
  }

  const landingSectionIds: string[] = []
  for (const [parentOrder, seed] of LANDING_SECTION_SEED.entries()) {
    landingSectionIds.push(
      await createBlock(seed, {
        pageId: landingPageId,
        parentBlockId: null,
        parentOrder
      })
    )
  }

  const heroButtonId = await createBlock(LANDING_HERO_BUTTON_SEED, {
    pageId: landingPageId,
    parentBlockId: landingSectionIds[LANDING_HERO],
    parentOrder: 0
  })
  await tx.campaignAction.create({
    data: {
      campaignBlockId: heroButtonId,
      blockId: landingSectionIds[LANDING_REGION_SWITCHER]
    }
  })

  for (const [parentOrder, seed] of REGION_SECTION_SEED.entries()) {
    await createBlock(seed, {
      pageId: regionPageId,
      parentBlockId: null,
      parentOrder
    })
  }

  const headerId = await createBlock(HEADER_SEED, {
    pageId: null,
    parentBlockId: null,
    parentOrder: 0
  })
  for (const [parentOrder, nav] of HEADER_NAV_SEED.entries()) {
    const { scrollToLandingSection, ...seed } = nav
    const buttonId = await createBlock(seed, {
      pageId: null,
      parentBlockId: headerId,
      parentOrder
    })
    await tx.campaignAction.create({
      data: {
        campaignBlockId: buttonId,
        blockId: landingSectionIds[scrollToLandingSection]
      }
    })
  }

  const footerId = await createBlock(FOOTER_SEED, {
    pageId: null,
    parentBlockId: null,
    parentOrder: 1
  })
  await createBlock(footerCopyrightSeed(input.year), {
    pageId: null,
    parentBlockId: footerId,
    parentOrder: 0
  })
  for (const [index, link] of FOOTER_LINK_SEED.entries()) {
    const { url, ...seed } = link
    const buttonId = await createBlock(seed, {
      pageId: null,
      parentBlockId: footerId,
      parentOrder: index + 1
    })
    await tx.campaignAction.create({
      data: { campaignBlockId: buttonId, url }
    })
  }

  await tx.campaignString.createMany({
    data: CAMPAIGN_STRING_KEYS.map((key) => ({
      id: generateId(),
      campaignId,
      key,
      value: input.strings[key]
    }))
  })

  return campaignId
}
