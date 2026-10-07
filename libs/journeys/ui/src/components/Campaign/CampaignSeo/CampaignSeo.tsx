import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { campaignBasePath } from '../CampaignProvider'
import type { CampaignPublic, CampaignRegion } from '../types'

interface CampaignPreferredUrlOptions {
  campaign: Pick<CampaignPublic, 'slug' | 'customDomainNames'>
  region?: Pick<CampaignRegion, 'slug'> | null
  rootDomain: string
}

/**
 * The preferred public address of a campaign page: the domain-root form when
 * a Custom Domain names the campaign as its Campaign Root, else the
 * root-domain `/campaign/<slug>` path. Both forms stay served; nothing
 * redirects between them and this is the one the canonical link names.
 */
export function campaignPreferredUrl({
  campaign,
  region = null,
  rootDomain
}: CampaignPreferredUrlOptions): string {
  const regionPath = region == null ? '' : `/${region.slug}`
  const customDomain = campaign.customDomainNames[0]
  if (customDomain != null) return `https://${customDomain}${regionPath}`
  return `https://${rootDomain}${campaignBasePath(campaign.slug)}${regionPath}`
}

interface CampaignSeoProps {
  campaign: CampaignPublic
  region?: CampaignRegion | null
  description?: string
  rootDomain: string
}

/**
 * SEO tags of a public campaign page: title, description, a canonical link
 * and one `hreflang` alternate per campaign language, both in the preferred
 * address form, plus `x-default` for the unparameterised address.
 */
export function CampaignSeo({
  campaign,
  region = null,
  description,
  rootDomain
}: CampaignSeoProps): ReactElement {
  const title =
    region == null ? campaign.title : `${region.name} · ${campaign.title}`
  const url = campaignPreferredUrl({ campaign, region, rootDomain })
  const languageAlternates = [
    ...campaign.languages.flatMap(({ language }) =>
      language.bcp47 == null
        ? []
        : [
            {
              hrefLang: language.bcp47,
              href: `${url}?lang=${encodeURIComponent(language.bcp47)}`
            }
          ]
    ),
    { hrefLang: 'x-default', href: url }
  ]

  return (
    <NextSeo
      title={title}
      description={description}
      canonical={url}
      languageAlternates={languageAlternates}
      openGraph={{
        type: 'website',
        title,
        description,
        url,
        site_name: campaign.title
      }}
      twitter={{ site: '@YourNextStepIs', cardType: 'summary_large_image' }}
    />
  )
}
