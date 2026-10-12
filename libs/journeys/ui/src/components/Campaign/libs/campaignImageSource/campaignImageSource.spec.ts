import { campaignImageSource } from './campaignImageSource'

describe('campaignImageSource', () => {
  it('returns null for an empty slot', () => {
    expect(campaignImageSource(null)).toBeNull()
    expect(campaignImageSource(undefined)).toBeNull()
  })

  it('reads an image block src with its alt and size', () => {
    expect(
      campaignImageSource({
        __typename: 'CampaignImageBlock',
        src: 'https://images.example.org/logo.png',
        alt: 'Logo',
        width: 320,
        height: 80
      })
    ).toEqual({
      src: 'https://images.example.org/logo.png',
      alt: 'Logo',
      width: 320,
      height: 80
    })
  })

  it('reads a video block poster image', () => {
    expect(
      campaignImageSource({
        __typename: 'CampaignVideoBlock',
        image: 'https://images.example.org/poster.jpg'
      })
    ).toEqual({
      src: 'https://images.example.org/poster.jpg',
      alt: null,
      width: null,
      height: null
    })
  })

  it('reads a Watch video banner when the video has no captured poster', () => {
    expect(
      campaignImageSource({
        __typename: 'CampaignVideoBlock',
        image: null,
        mediaVideo: {
          __typename: 'Video',
          images: [
            { mobileCinematicHigh: 'https://images.example.org/banner.jpg' }
          ]
        }
      })
    ).toEqual({
      src: 'https://images.example.org/banner.jpg',
      alt: null,
      width: null,
      height: null
    })
  })

  it('returns null for a block with no image', () => {
    expect(
      campaignImageSource({ __typename: 'CampaignImageBlock', src: ' ' })
    ).toBeNull()
    expect(
      campaignImageSource({ __typename: 'CampaignVideoBlock', image: null })
    ).toBeNull()
    expect(campaignImageSource({ __typename: 'CampaignHeroBlock' })).toBeNull()
  })
})
