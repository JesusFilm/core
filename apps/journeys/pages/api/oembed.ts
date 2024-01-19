import { NextApiRequest, NextApiResponse } from 'next'

import { GetJourney } from '../../__generated__/GetJourney'
import { createApolloClient } from '../../src/libs/apolloClient'
import { GET_JOURNEY } from '../[journeySlug]'

const apolloClient = createApolloClient()

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const journeySlug = req.query.url?.toString().split('/').pop()
    const { data } = await apolloClient.query<GetJourney>({
      query: GET_JOURNEY,
      variables: {
        id: journeySlug
      }
    })

    // this should match apps/journeys-admin/src/components/Editor/Properties/JourneyLink/EmbedJourneyDialog/EmbedJourneyDialog.tsx
    const providerUrl = `https://${
      process.env.NEXT_PUBLIC_VERCEL_URL ?? 'your.nextstep.is'
    }`
    const embedUrl = `${providerUrl}/embed/${data.journey.slug}`

    const oembed = {
      // oembed required fields
      type: 'rich',
      version: '1.0',
      // oembed rich type required fields
      // Self-closing iframe tag breaks embed on WordPress
      html: `<iframe src="${embedUrl}" style="border: 0" allow="fullscreen; autoplay" allowfullscreen></iframe>`,
      width: 375,
      height: 500,
      // oembed optional fields
      title: data.journey.seoTitle ?? undefined,
      provider_name: 'NextSteps',
      provider_url: providerUrl,
      thumbnail_url: data.journey.primaryImageBlock?.src,
      thumbnail_height: data.journey.primaryImageBlock?.height,
      thumbnail_width: data.journey.primaryImageBlock?.width
    }

    res.status(200).send(oembed)
  } catch (error) {
    if (error.message === 'journey not found') {
      res.status(404).send('journey not found')
    } else {
      res.status(500).send('server error')
    }
  }
}
