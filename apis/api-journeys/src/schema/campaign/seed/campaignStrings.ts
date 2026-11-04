import {
  CAMPAIGN_STRING_KEYS as REGISTRY_KEYS,
  campaignStringWording
} from '@core/journeys/ui/Campaign/libs/campaignStrings'
import { CampaignStringKey } from '@core/prisma/journeys/client'

/** The eighteen Campaign Strings in seed order, from the Campaign String registry. */
export const CAMPAIGN_STRING_KEYS: readonly CampaignStringKey[] = REGISTRY_KEYS

/** Final English wording of the Campaign Strings (GLOSSARY.md: Campaign String). */
export const CAMPAIGN_STRING_DEFAULTS: Record<CampaignStringKey, string> =
  campaignStringWording((english) => english)
