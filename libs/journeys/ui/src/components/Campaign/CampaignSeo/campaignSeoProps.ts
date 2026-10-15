import type { NextSeoProps } from 'next-seo'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { campaignBasePath } from '../CampaignProvider'
import { campaignImageSource } from '../libs/campaignImageSource'
import type { CampaignImageSource } from '../libs/campaignImageSource'
import { CAMPAIGN_LANGUAGE_PARAM } from '../libs/resolvePageLanguage'
import { hasText } from '../types'
import type { CampaignBlockOf, CampaignPublic, CampaignRegion } from '../types'

export interface CampaignSeoOptions {
  /** The canonical origin: the root domain, or the Campaign Root's domain. */
  origin: string
  /** Where the landing page is served under it: `/campaign/<slug>`, or `` on a Campaign Root. */
  basePath: string
}

interface CampaignPreferredLocationOptions {
  campaign: Pick<CampaignPublic, 'slug' | 'customDomainNames'>
  rootDomain: string
}

/**
 * Where a campaign's preferred public address lives: the domain root of an
 * attached Custom Domain when one names the campaign as its Campaign Root,
 * else the root-domain `/campaign/<slug>` path. Both forms stay served;
 * nothing redirects between them and this is the one the canonical names.
 */
export function campaignPreferredLocation({
  campaign,
  rootDomain
}: CampaignPreferredLocationOptions): CampaignSeoOptions {
  const customDomain = campaign.customDomainNames[0]
  if (customDomain != null)
    return { origin: `https://${customDomain}`, basePath: '' }
  return {
    origin: `https://${rootDomain}`,
    basePath: campaignBasePath(campaign.slug)
  }
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
 * The address a campaign page is served at in one language: the bare
 * canonical for the campaign default (and for a language with no bcp47 tag
 * to name), else `<canonical>?lang=<bcp47>`. Each language has exactly one
 * address, so a page's canonical and the `hreflang` alternate naming its
 * language are the same URL.
 */
function campaignLanguageUrl(
  canonical: string,
  defaultLanguageId: string,
  { languageId, bcp47 }: { languageId: string; bcp47: string | null }
): string {
  if (bcp47 == null || languageId === defaultLanguageId) return canonical
  return `${canonical}?${CAMPAIGN_LANGUAGE_PARAM}=${bcp47}`
}

/**
 * One `hreflang` alternate per campaign language at its own address, then
 * `x-default` at the bare canonical. None for a single-language campaign,
 * where there is nothing to alternate between.
 */
function campaignLanguageAlternates(
  campaign: Pick<CampaignPublic, 'languages' | 'defaultLanguageId'>,
  canonical: string
): NonNullable<NextSeoProps['languageAlternates']> {
  if (campaign.languages.length < 2) return []
  const alternates = campaign.languages.flatMap(({ languageId, language }) =>
    language.bcp47 == null
      ? []
      : [
          {
            hrefLang: language.bcp47,
            href: campaignLanguageUrl(canonical, campaign.defaultLanguageId, {
              languageId,
              bcp47: language.bcp47
            })
          }
        ]
  )
  return [...alternates, { hrefLang: 'x-default', href: canonical }]
}

/**
 * The `NextSeo` props for a public campaign page (PRD §11): title from the
 * translated campaign title ("<region> · <title>" on a Region Page);
 * description from the page's hero lede, else its title, else none;
 * canonical in the preferred form, with `?lang=<bcp47>` when the page is
 * served in a language other than the campaign default; never `noindex`.
 * Open Graph and Twitter as a `website` with the social image chain and `site_name` = the campaign
 * title.
 *
 * `hreflang` alternates (PRD §2): one per language at the address that
 * language canonicalises to, plus `x-default` at the bare canonical, so no
 * alternate points at a URL whose canonical names another. None when the
 * campaign has fewer than two languages.
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
  const bareCanonical = `${origin}${campaignPagePath(basePath, region)}`
  const canonical = campaignLanguageUrl(
    bareCanonical,
    campaign.defaultLanguageId,
    { languageId: campaign.languageId, bcp47: campaign.language.bcp47 }
  )
  const image = campaignSocialImage(campaign, pageKind)

  return {
    title,
    description,
    canonical,
    languageAlternates: campaignLanguageAlternates(campaign, bareCanonical),
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
