import { gql } from '@apollo/client'
import { NextApiRequest, NextApiResponse } from 'next'

import {
  GetVideoVariantLanguages,
  GetVideoVariantLanguagesVariables
} from '../../__generated__/GetVideoVariantLanguages'
import { createApolloClient } from '../../src/libs/apolloClient'

const GET_VIDEO_VARIANT_LANGUAGES = gql`
  query GetVideoVariantLanguages($slug: ID!) {
    video(id: $slug, idType: slug) {
      id
      variantLanguagesWithSlug {
        slug
        language {
          id
        }
      }
    }
  }
`

interface ApiResponse {
  success: boolean
  data?: {
    variantLanguages: { [languageId: string]: string }
  }
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ success: false, error: 'Method not allowed' })
    return
  }

  const { slug } = req.query

  if (!slug || typeof slug !== 'string') {
    res.status(400).json({ success: false, error: 'Video slug is required' })
    return
  }

  // Validate slug format: should be "id/lng" (e.g., "jesus/english")
  const slugParts = slug.split('/')
  if (slugParts.length !== 2 || !slugParts[0] || !slugParts[1]) {
    res.status(400).json({
      success: false,
      error:
        'Invalid slug format. Expected format: "videoId/language" (e.g., "jesus/english")'
    })
    return
  }

  try {
    // Fetch from GraphQL using the full slug (e.g., "jesus/english")
    const apolloClient = createApolloClient()
    const { data } = await apolloClient.query<
      GetVideoVariantLanguages,
      GetVideoVariantLanguagesVariables
    >({
      query: GET_VIDEO_VARIANT_LANGUAGES,
      variables: { slug },
      fetchPolicy: 'network-only'
    })

    if (!data?.video?.variantLanguagesWithSlug) {
      res.status(404).json({ success: false, error: 'Video not found' })
      return
    }

    const variantLanguages = data.video.variantLanguagesWithSlug

    // Transform array to object with language ID as key and slug as value
    const variantLanguagesMap = variantLanguages.reduce<Record<string, string>>(
      (acc, item) => {
        if (item.language?.id && item.slug) {
          acc[item.language.id] = item.slug.split('/').at(-1) ?? ''
        }
        return acc
      },
      {}
    )

    res.setHeader(
      'Cache-Control',
      'public, max-age=3600, stale-while-revalidate=86400'
    )
    res.status(200).json({
      success: true,
      data: { variantLanguages: variantLanguagesMap }
    })
  } catch (error) {
    console.error('Error fetching variant languages:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch variant languages'
    })
  }
}
