import type { NextSeoProps } from 'next-seo'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { campaignImageSource } from '../libs/campaignImageSource'
import type { CampaignImageSource } from '../libs/campaignImageSource'
import { hasText } from '../types'
import type { CampaignBlockOf, CampaignPublic, CampaignRegion } from '../types'

export interface CampaignSeoOptions {
  /** The canonical origin: the root domain, or the Campaign Root's domain. */
  origin: string
  /** Where the landing page is served under it: `/campaign/<slug>`, or `` on a Campaign Root. */
  basePath: string
}

function heroOf(
  campaign: CampaignPublic,
  pageKind: CampaignPageKind
): CampaignBlockOf<'CampaignHeroBlock'> | null {
  const page = campaign.pages.find((candidate) => candidate.kind === pageKind)
  const hero = page?.blocks.find(
    (block) => block.__typename === 'CampaignHeroBlock'
  )
  return hero?.__typename === 'CampaignHeroBlock' ? hero : null
}

function heroDescription(
  campaign: CampaignPublic,
  pageKind: CampaignPageKind
): string | undefined {
  const hero = heroOf(campaign, pageKind)
  if (hero == null) return undefined
  if (hasText(hero.lede)) return hero.lede
  if (hasText(hero.title)) return hero.title
  return undefined
}

function heroPoster(
  campaign: CampaignPublic,
  pageKind: CampaignPageKind
): CampaignImageSource | null {
  const hero = heroOf(campaign, pageKind)
  if (hero?.mediaBlockId == null) return null
  const page = campaign.pages.find((candidate) => candidate.kind === pageKind)
  return campaignImageSource(
    page?.blocks.find((block) => block.id === hero.mediaBlockId)
  )
}

function headerLogo(campaign: CampaignPublic): CampaignImageSource | null {
  if (campaign.header.logoBlockId == null) return null
  return campaignImageSource(
    campaign.chrome.find((block) => block.id === campaign.header.logoBlockId)
  )
}

/**
 * The social image chain (PRD §11): the page's hero media poster (a video's
 * image or an image's `src`), a Region Page inheriting the landing hero's
 * when its own has none, else the header logo, else none.
 */
export function campaignSocialImage(
  campaign: CampaignPublic,
  pageKind: CampaignPageKind
): CampaignImageSource | null {
  return (
    heroPoster(campaign, pageKind) ??
    (pageKind === CampaignPageKind.regionTemplate
      ? heroPoster(campaign, CampaignPageKind.landing)
      : null) ??
    headerLogo(campaign)
  )
}

/** The page's path under the origin: `/` on a Campaign Root landing page. */
export function campaignPagePath(
  basePath: string,
  region: CampaignRegion | null
): string {
  if (region != null) return `${basePath}/${region.slug}`
  return basePath === '' ? '/' : basePath
}

/**
 * The `NextSeo` props for a public campaign page (PRD §11): title from the
 * translated campaign title ("<region> · <title>" on a Region Page);
 * description from the page's hero lede, else its title, else none;
 * canonical in the preferred form; never `noindex`. Open Graph and Twitter
 * as a `website` with the social image chain and `site_name` = the campaign
 * title.
 *
 * No `hreflang` alternates yet: the pages are ISR (`getStaticProps`) and
 * never read the `lang` query param, and no mutation can add a second
 * campaign language, so every alternate would point at an unserved
 * `<canonical>?lang=<bcp47>` URL that conflicts with the canonical tag. The
 * languages ticket serves `?lang` and adds languages; restore `hreflang`
 * (one per language plus `x-default`) at that point.
 */
export function campaignSeoProps(
  campaign: CampaignPublic,
  pageKind: CampaignPageKind,
  region: CampaignRegion | null,
  { origin, basePath }: CampaignSeoOptions
): NextSeoProps {
  const title =
    region == null ? campaign.title : `${region.name} · ${campaign.title}`
  const description = heroDescription(campaign, pageKind)
  const canonical = `${origin}${campaignPagePath(basePath, region)}`
  const image = campaignSocialImage(campaign, pageKind)

  return {
    title,
    description,
    canonical,
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonical,
      site_name: campaign.title,
      images:
        image == null
          ? []
          : [
              {
                url: image.src,
                width: image.width ?? undefined,
                height: image.height ?? undefined,
                alt: image.alt ?? title
              }
            ]
    },
    twitter: { site: '@YourNextStepIs', cardType: 'summary_large_image' }
  }
}
