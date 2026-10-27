import { gql } from '@apollo/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getApiRequestTokens } from 'next-firebase-auth-edge'

import { campaignPagePaths } from '@core/journeys/ui/Campaign'

import {
  GetCampaignPagePaths_campaign as Campaign,
  GetCampaignPagePaths,
  GetCampaignPagePathsVariables
} from '../../../__generated__/GetCampaignPagePaths'
import { CampaignStatus } from '../../../__generated__/globalTypes'
import { createApolloClient } from '../../../src/libs/apolloClient'
import { authConfig } from '../../../src/libs/auth/config'
import { campaignPublicAddress } from '../../../src/libs/campaignAddress'

/** What listing a campaign's pages and its public address reads off it, as the signed-in user. */
export const GET_CAMPAIGN_PAGE_PATHS = gql`
  query GetCampaignPagePaths($id: ID!) {
    campaign(id: $id) {
      id
      slug
      status
      customDomains {
        id
        name
      }
      languages {
        id
        language {
          id
          bcp47
        }
      }
      regions {
        id
        slug
      }
    }
  }
`

/**
 * The shape of a region slug: lowercase ASCII letters, digits and single
 * hyphens, as the API's slugify produces. A query value of any other shape is
 * ignored, so nothing but a slug is ever appended to a redirect.
 */
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

function slugParam(value: string | string[] | undefined): string | undefined {
  const slug = value?.toString()
  return slug != null && SLUG_RE.test(slug) ? slug : undefined
}

/**
 * Rebuilds in flight at once. Each one regenerates a page on the journeys
 * app, so a campaign with many regions and languages is spread out rather
 * than fired all at once.
 */
const REVALIDATE_CONCURRENCY = 8

async function sleep(ms: number): Promise<void> {
  return await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Ask the journeys app to rebuild one page. A failure is logged, never
 * thrown: the page keeps its last build, and the button still opens it.
 */
async function revalidatePath(
  journeysUrl: string,
  accessToken: string,
  path: string
): Promise<void> {
  const params = new URLSearchParams({ accessToken, path })
  try {
    const response = await fetch(
      `${journeysUrl}/api/revalidate?${params.toString()}`
    )
    if (!response.ok)
      console.error('[campaign/open] revalidate failed', {
        path,
        status: response.status
      })
  } catch (error) {
    console.error('[campaign/open] revalidate failed', { path, error })
  }
}

async function revalidatePaths(
  journeysUrl: string,
  accessToken: string,
  paths: string[]
): Promise<void> {
  for (let start = 0; start < paths.length; start += REVALIDATE_CONCURRENCY) {
    await Promise.all(
      paths
        .slice(start, start + REVALIDATE_CONCURRENCY)
        .map(
          async (path) => await revalidatePath(journeysUrl, accessToken, path)
        )
    )
  }
}

/** The `_lang/<tag>` tags of the campaign's Page Languages, lowercased as the proxy does. */
function languageTags(campaign: Campaign): string[] {
  const tags = campaign.languages
    .map(({ language }) => language.bcp47?.toLowerCase())
    .filter((tag): tag is string => tag != null)
  return [...new Set(tags)]
}

/**
 * Force refresh behind the campaign editor's "Refresh and open page", after
 * journey Preview (`pages/api/preview.ts`): as the signed-in user, read the
 * campaign, ask the journeys app at `JOURNEYS_URL` to rebuild every page it
 * is served from (`campaignPagePaths`), wait for the edge caches, then send
 * the browser to the public address — the Campaign Domain's root when the
 * campaign has one, else the root-domain `/campaign/<slug>`, with
 * `regionSlug` appended when it names one of the campaign's regions. A draft
 * serves nothing, so it is opened without a rebuild.
 *
 * A rebuild that fails is logged and the page still opens. When the campaign
 * cannot be read at all (gateway down, not found, not a team member — the
 * gateway throws for each of these, since `campaign` is non-null in the
 * schema) the tab shows a short message instead: without the campaign there
 * is no address to send the browser to.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Top-level navigation only (the editor's button → new tab). Anything else
  // is rejected so a hostile site cannot fire the rebuilds through `<img>`,
  // `<script>` or `fetch` with a stolen-cookie victim.
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  // `Sec-Fetch-Site` is set by browsers and cannot be spoofed from JavaScript:
  // `same-origin` is admin → admin, `none` is the address bar.
  const fetchSite = req.headers['sec-fetch-site']
  if (
    typeof fetchSite === 'string' &&
    fetchSite !== 'same-origin' &&
    fetchSite !== 'none'
  ) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const journeysUrl = process.env.JOURNEYS_URL
  const accessToken = process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN
  if (journeysUrl == null || accessToken == null) {
    return res.status(500).json({ error: 'Missing Environment Variables' })
  }

  const id = req.query.id?.toString()
  if (id == null || id === '') {
    return res.status(400).json({ error: 'Missing id' })
  }
  const regionSlug = slugParam(req.query.regionSlug)

  let token: string
  try {
    const tokens = await getApiRequestTokens(req, authConfig)
    if (tokens == null) {
      return res.status(403).json({ error: 'Not authorized' })
    }
    token = tokens.token
  } catch {
    return res.status(403).json({ error: 'Not authorized' })
  }

  let campaign: Campaign | null = null
  try {
    const { data } = await createApolloClient(token).query<
      GetCampaignPagePaths,
      GetCampaignPagePathsVariables
    >({
      query: GET_CAMPAIGN_PAGE_PATHS,
      variables: { id },
      fetchPolicy: 'network-only'
    })
    campaign = data?.campaign ?? null
  } catch (error) {
    console.error('[campaign/open] campaign read failed', { id, error })
  }
  if (campaign == null) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    return res
      .status(404)
      .send(
        'The campaign could not be read, so there is no page to open. Close this tab and try again from the editor.'
      )
  }

  if (campaign.status === CampaignStatus.published) {
    await revalidatePaths(
      journeysUrl,
      accessToken,
      campaignPagePaths({
        slug: campaign.slug,
        regions: campaign.regions,
        hostnames: campaign.customDomains.map(({ name }) => name),
        languageTags: languageTags(campaign)
      })
    )
    // 300ms required to invalidate edge caches
    await sleep(300)
  }

  const address = campaignPublicAddress(campaign)
  const region = campaign.regions.find(
    (candidate) => candidate.slug === regionSlug
  )
  res.redirect(307, region == null ? address : `${address}/${region.slug}`)
}
