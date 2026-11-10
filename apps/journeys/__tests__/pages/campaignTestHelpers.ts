import { GetStaticPropsContext } from 'next'

import { campaignPublic } from '@core/journeys/ui/Campaign/testData'
import type { CampaignPublic } from '@core/journeys/ui/Campaign/types'

import { inMemoryCampaignReader } from '../../src/libs/resolveCampaignPage/inMemoryCampaignReader'
import type {
  CampaignReader,
  CampaignTarget
} from '../../src/libs/resolveCampaignPage/resolveCampaignPage'

/** The fixture campaign read in French, one of its two languages. */
export const french: CampaignPublic = {
  ...campaignPublic,
  languageId: '496',
  language: { __typename: 'Language', id: '496', bcp47: 'fr' },
  title: 'Campagne 2026'
}

/** The static props context of a route with these params. */
export function routeContext(
  params: Record<string, string>
): GetStaticPropsContext {
  return { locale: 'en', params }
}

/** The fixture campaign published at `target`, in its default and in French. */
export function publishedAt(target: CampaignTarget): CampaignReader {
  return inMemoryCampaignReader([
    { target, inDefault: campaignPublic, inLanguage: { '496': french } }
  ])
}

/** A reader with no published campaign anywhere. */
export const nothingPublished: CampaignReader = inMemoryCampaignReader([])
