import type { CampaignBlockOf } from '../types'

import { campaignSubtitleTracks } from './campaignVideoDetails'

type CampaignVideoBlock = CampaignBlockOf<'CampaignVideoBlock'>

function watchBlock(
  subtitle: Array<{
    id: string
    vttSrc: string | null
    language: {
      id: string
      bcp47: string | null
      name: Array<{ value: string }>
    }
  }>
): CampaignVideoBlock {
  return {
    __typename: 'CampaignVideoBlock',
    id: 'videoId',
    source: 'internal',
    mediaVideo: {
      __typename: 'Video',
      id: '1_jf-0-0',
      variant: { __typename: 'VideoVariant', id: '1_jf-0-0-21028', subtitle }
    }
  } as unknown as CampaignVideoBlock
}

describe('campaignSubtitleTracks', () => {
  it('turns the variant’s subtitle files into tracks named in the Page Language', () => {
    expect(
      campaignSubtitleTracks(
        watchBlock([
          {
            id: 'es',
            vttSrc: 'https://files.example.org/jesus-es.vtt',
            language: { id: '21028', bcp47: 'es', name: [{ value: 'Spanish' }] }
          },
          {
            id: 'none',
            vttSrc: null,
            language: { id: '529', bcp47: 'en', name: [{ value: 'English' }] }
          },
          {
            id: 'unnamed',
            vttSrc: 'https://files.example.org/jesus-fr.vtt',
            language: { id: '496', bcp47: null, name: [] }
          }
        ])
      )
    ).toEqual([
      {
        id: 'es',
        src: 'https://files.example.org/jesus-es.vtt',
        language: 'es',
        label: 'Spanish'
      },
      {
        id: 'unnamed',
        src: 'https://files.example.org/jesus-fr.vtt',
        language: '496',
        label: '496'
      }
    ])
  })

  it('is empty for a YouTube or Mux video', () => {
    expect(
      campaignSubtitleTracks({
        __typename: 'CampaignVideoBlock',
        id: 'videoId',
        source: 'youTube',
        mediaVideo: { __typename: 'YouTube', id: 'abc' }
      } as unknown as CampaignVideoBlock)
    ).toEqual([])
  })
})
