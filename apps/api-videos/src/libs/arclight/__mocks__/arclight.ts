const mediaComponent = {
  mediaComponentId: 'JFM1',
  componentType: 'container',
  subType: 'collection',
  contentType: 'none',
  imageUrls: {
    thumbnail:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/JFM-Collection-tn.jpg',
    videoStill:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/JFM-Collection-vs.jpg',
    mobileCinematicHigh:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/JFM_collection_cine_lrg_wordmark.jpg',
    mobileCinematicLow:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/JFM_collection_cine_sm_wordmark.jpg',
    mobileCinematicVeryLow: ''
  },
  lengthInMilliseconds: 0,
  containsCount: 25,
  isDownloadable: false,
  downloadSizes: {},
  bibleCitations: [],
  primaryLanguageId: 529,
  title: 'JFM Collection',
  shortDescription:
    'Jesus Film Media, the digital expression of The JESUS Film Project, is an extension of the overall vision to reach everyone, everywhere by equipping people to use our tools and resources in new ways!',
  longDescription:
    'Jesus Film Media, the digital expression of The JESUS Film Project, is an extension of the overall vision to reach everyone, everywhere by equipping people to use our tools and resources in new ways! Finding just the right resource or tool has never been easier. We are excited to share the entire JESUS Film Project library, stories of use, and strategy ideas with you online and on your smart phone. Through the robust search feature users have the ability to find our resources by country, language name, theme, and title of the film. Our hope is that every Christian would have access to the complete library of The JESUS Film Project wherever they are, whenever they need it, so they can be more completely equipped for the ministry that the Lord has given them.',
  studyQuestions: [],
  metadataLanguageTag: 'en',
  _links: {
    sampleMediaComponentLanguage: {
      href: 'http://api.arclight.org/v2/media-components/JFM1/languages/529?platform=web&apiKey=616db012e9a951.51499299'
    },
    osisBibleBooks: {
      href: 'http://api.arclight.org/v2/taxonomies/osisBibleBooks?apiKey=616db012e9a951.51499299'
    },
    self: {
      href: 'http://api.arclight.org/v2/media-components/JFM1?apiKey=616db012e9a951.51499299'
    },
    mediaComponentLinks: {
      href: 'http://api.arclight.org/v2/media-component-links/JFM1?apiKey=616db012e9a951.51499299'
    }
  }
}

export const fetchMediaLanguagesAndTransformToLanguages = jest
  .fn()
  .mockResolvedValue([
    {
      languageId: '529',
      bcp47: 'en',
      name: 'English',
      slug: 'english'
    }
  ])

export const getArclightMediaComponents = jest
  .fn()
  .mockResolvedValue([mediaComponent])

export const getArclightMediaComponent = jest
  .fn()
  .mockResolvedValue({ mediaComponentId: '123' })

export const transformMediaComponentToVideo = jest.fn().mockResolvedValue({})

export const handleArclightMediaComponent = jest
  .fn()
  .mockResolvedValue({ resumed: false, errors: {} })
