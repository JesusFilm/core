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

    const providerUrl = `https://${
      process.env.NEXT_PUBLIC_VERCEL_URL ?? 'your.nextstep.is'
    }`
    const embedUrl = `${providerUrl}/embed/${data.journey.slug}`

    const oembed = {
      // oembed required fields
      type: 'rich',
      version: '1.0',
      // oembed rich type required fields
      html: `<div style="position:relative;width:100%;overflow:hidden;padding-top:150%">
      <iframe id="ns-iframe" src="${embedUrl}" style="position:absolute;top:0;left:0;bottom:0;right:0;width:100%;height:100%;border:none" allow="fullscreen; autoplay" allowfullscreen="true"></iframe>
      </div>`,
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
