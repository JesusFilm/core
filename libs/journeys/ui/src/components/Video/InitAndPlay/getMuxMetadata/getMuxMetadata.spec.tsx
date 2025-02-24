import {
  VideoFields_mediaVideo_Video as LibraryVideo,
  VideoFields_mediaVideo_MuxVideo as UserGeneratedVideo,
  VideoFields_mediaVideo_YouTube as YoutubeVideo
} from '../../__generated__/VideoFields'

import {
  GetMuxMetadataProps,
  getMuxMetadata,
  muxEnvKeys
} from './getMuxMetadata'

describe('getMuxMetadata', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
    jest.resetModules()
  })

  const defaultProps: GetMuxMetadataProps = {
    journeyId: 'journey.id',
    videoBlock: {
      id: 'blockId',
      title: 'video title',
      endAt: 100,
      videoVariantLanguageId: 'languageId',
      mediaVideo: null
    }
  }

  const defaultMediaVideo: LibraryVideo = {
    __typename: 'Video',
    id: 'videoId',
    title: [{ __typename: 'VideoTitle', value: 'library video title' }],
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh: null
      }
    ],
    variant: null,
    variantLanguages: [
      {
        __typename: 'Language',
        id: 'languageId',
        name: [{ __typename: 'LanguageName', value: 'language', primary: true }]
      }
    ]
  }
  const youtubeMediaVideo: YoutubeVideo = {
    __typename: 'YouTube',
    id: 'youtubeId'
  }
  const userGeneratedMediaVideo: UserGeneratedVideo = {
    __typename: 'MuxVideo',
    id: 'muxVideoId',
    assetId: 'muxAssetId',
    playbackId: 'muxPlaybackId'
  }

  const defaultResult = {
    video_duration: 100,
    custom_1: 'journey.id',
    custom_2: 'blockId',
    player_name: 'journeys'
  }

  const localDomain = 'localhost:4100'
  const stageDomain = 'your-stage.nextstep.is'
  const productionDomain = 'your.nextstep.is'

  it('should return meta data for local video', () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_ROOT_DOMAIN: localDomain
    }
    const props: GetMuxMetadataProps = {
      ...defaultProps,
      videoBlock: {
        ...defaultProps.videoBlock,
        mediaVideo: { ...defaultMediaVideo }
      }
    }

    expect(getMuxMetadata(props)).toEqual({
      ...defaultResult,
      env_key: muxEnvKeys[localDomain].default,
      video_id: 'videoId',
      video_title: 'library video title',
      video_language_code: 'languageId'
    })
  })

  it('should return meta data for local mux video', () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_ROOT_DOMAIN: localDomain
    }
    const props: GetMuxMetadataProps = {
      ...defaultProps,
      videoBlock: {
        ...defaultProps.videoBlock,
        mediaVideo: { ...userGeneratedMediaVideo }
      }
    }

    expect(getMuxMetadata(props)).toEqual({
      ...defaultResult,
      env_key: muxEnvKeys[localDomain].userGenerated,
      video_id: 'muxAssetId',
      video_title: 'video title'
    })
  })

  it('should return meta data for local youtube video', () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_ROOT_DOMAIN: localDomain
    }
    const props: GetMuxMetadataProps = {
      ...defaultProps,
      videoBlock: {
        ...defaultProps.videoBlock,
        mediaVideo: { ...youtubeMediaVideo }
      }
    }

    expect(getMuxMetadata(props)).toEqual({
      ...defaultResult,
      env_key: muxEnvKeys[localDomain].default,
      video_id: 'youtubeId',
      video_title: 'video title'
    })
  })

  it('should return meta data for stage video', () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_ROOT_DOMAIN: stageDomain
    }
    const props: GetMuxMetadataProps = {
      ...defaultProps,
      videoBlock: {
        ...defaultProps.videoBlock,
        mediaVideo: { ...defaultMediaVideo }
      }
    }

    expect(getMuxMetadata(props)).toEqual({
      ...defaultResult,
      env_key: muxEnvKeys[stageDomain].default,
      video_id: 'videoId',
      video_title: 'library video title',
      video_language_code: 'languageId'
    })
  })

  it('should return meta data for stage mux video', () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_ROOT_DOMAIN: stageDomain
    }
    const props: GetMuxMetadataProps = {
      ...defaultProps,
      videoBlock: {
        ...defaultProps.videoBlock,
        mediaVideo: { ...userGeneratedMediaVideo }
      }
    }

    expect(getMuxMetadata(props)).toEqual({
      ...defaultResult,
      env_key: muxEnvKeys[stageDomain].userGenerated,
      video_id: 'muxAssetId',
      video_title: 'video title'
    })
  })

  it('should return meta data for stage youtube video', () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_ROOT_DOMAIN: stageDomain
    }
    const props: GetMuxMetadataProps = {
      ...defaultProps,
      videoBlock: {
        ...defaultProps.videoBlock,
        mediaVideo: { ...youtubeMediaVideo }
      }
    }

    expect(getMuxMetadata(props)).toEqual({
      ...defaultResult,
      env_key: muxEnvKeys[stageDomain].default,
      video_id: 'youtubeId',
      video_title: 'video title'
    })
  })

  it('should return meta data for production video', () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_ROOT_DOMAIN: productionDomain
    }
    const props: GetMuxMetadataProps = {
      ...defaultProps,
      videoBlock: {
        ...defaultProps.videoBlock,
        mediaVideo: { ...defaultMediaVideo }
      }
    }

    expect(getMuxMetadata(props)).toEqual({
      ...defaultResult,
      env_key: muxEnvKeys[productionDomain].default,
      video_id: 'videoId',
      video_title: 'library video title',
      video_language_code: 'languageId'
    })
  })

  it('should return meta data for production mux video', () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_ROOT_DOMAIN: productionDomain
    }
    const props: GetMuxMetadataProps = {
      ...defaultProps,
      videoBlock: {
        ...defaultProps.videoBlock,
        mediaVideo: { ...userGeneratedMediaVideo }
      }
    }

    expect(getMuxMetadata(props)).toEqual({
      ...defaultResult,
      env_key: muxEnvKeys[productionDomain].userGenerated,
      video_id: 'muxAssetId',
      video_title: 'video title'
    })
  })

  it('should return meta data for production youtube video', () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_ROOT_DOMAIN: productionDomain
    }
    const props: GetMuxMetadataProps = {
      ...defaultProps,
      videoBlock: {
        ...defaultProps.videoBlock,
        mediaVideo: { ...youtubeMediaVideo }
      }
    }

    expect(getMuxMetadata(props)).toEqual({
      ...defaultResult,
      env_key: muxEnvKeys[productionDomain].default,
      video_id: 'youtubeId',
      video_title: 'video title'
    })
  })
})
