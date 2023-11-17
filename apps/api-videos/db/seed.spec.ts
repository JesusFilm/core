import {
  fetchMediaLanguagesAndTransformToLanguages,
  getArclightMediaComponent,
  getArclightMediaComponents
} from '../src/libs/arclight/arclight'
import { getVideoIdsAndSlugs } from '../src/libs/postgresql/postgresql'

import { handleArclightMediaComponent, main } from './seed'

// const mediaComponent = {
//   mediaComponentId: 'JFM1',
//   componentType: 'container',
//   subType: 'collection',
//   contentType: 'none',
//   imageUrls: {
//     thumbnail:
//       'https://d1wl257kev7hsz.cloudfront.net/cinematics/JFM-Collection-tn.jpg',
//     videoStill:
//       'https://d1wl257kev7hsz.cloudfront.net/cinematics/JFM-Collection-vs.jpg',
//     mobileCinematicHigh:
//       'https://d1wl257kev7hsz.cloudfront.net/cinematics/JFM_collection_cine_lrg_wordmark.jpg',
//     mobileCinematicLow:
//       'https://d1wl257kev7hsz.cloudfront.net/cinematics/JFM_collection_cine_sm_wordmark.jpg',
//     mobileCinematicVeryLow: ''
//   },
//   lengthInMilliseconds: 0,
//   containsCount: 25,
//   isDownloadable: false,
//   downloadSizes: {},
//   bibleCitations: [],
//   primaryLanguageId: 529,
//   title: 'JFM Collection',
//   shortDescription:
//     'Jesus Film Media, the digital expression of The JESUS Film Project, is an extension of the overall vision to reach everyone, everywhere by equipping people to use our tools and resources in new ways!',
//   longDescription:
//     'Jesus Film Media, the digital expression of The JESUS Film Project, is an extension of the overall vision to reach everyone, everywhere by equipping people to use our tools and resources in new ways! Finding just the right resource or tool has never been easier. We are excited to share the entire JESUS Film Project library, stories of use, and strategy ideas with you online and on your smart phone. Through the robust search feature users have the ability to find our resources by country, language name, theme, and title of the film. Our hope is that every Christian would have access to the complete library of The JESUS Film Project wherever they are, whenever they need it, so they can be more completely equipped for the ministry that the Lord has given them.',
//   studyQuestions: [],
//   metadataLanguageTag: 'en',
//   _links: {
//     sampleMediaComponentLanguage: {
//       href: 'http://api.arclight.org/v2/media-components/JFM1/languages/529?platform=web&apiKey=616db012e9a951.51499299'
//     },
//     osisBibleBooks: {
//       href: 'http://api.arclight.org/v2/taxonomies/osisBibleBooks?apiKey=616db012e9a951.51499299'
//     },
//     self: {
//       href: 'http://api.arclight.org/v2/media-components/JFM1?apiKey=616db012e9a951.51499299'
//     },
//     mediaComponentLinks: {
//       href: 'http://api.arclight.org/v2/media-component-links/JFM1?apiKey=616db012e9a951.51499299'
//     }
//   }
// }

// describe('handleArclightMediaComponent', () => {
//   it('should handle the arclight media component', async () => {
//     // Mock the necessary dependencies and inputs

//     const importedVideos = []
//     const resumed = false
//     const languages = []
//     const usedVideoSlugs = {}
//     const errors = {}
//     const replace = false
//     const existingVideoIds = []
//     const lastId = undefined

//     // Call the function
//     const result = await handleArclightMediaComponent(
//       mediaComponent,
//       importedVideos,
//       resumed,
//       languages,
//       usedVideoSlugs,
//       errors,
//       replace,
//       existingVideoIds,
//       lastId
//     )

//     // Assert the expected output
//     expect(result).toEqual({
//       resumed: false,
//       errors: {}
//     })
//   })
// })

// jest.mock('.prisma/api-videos-client', () => {
//   const originalModule = jest.requireActual('.prisma/api-videos-client')
//   return {
//     __esModule: true,
//     ...originalModule,
//     default: jest.fn()
//   }
// })

jest.mock('../src/libs/postgresql/postgresql')

jest.mock('../src/libs/arclight/arclight')

describe('main', () => {
  it('should import media components in complete mode', async () => {
    await main('complete')
    // Assert the expected function calls
    expect(getVideoIdsAndSlugs).toHaveBeenCalled()
    expect(fetchMediaLanguagesAndTransformToLanguages).toHaveBeenCalled()
    // expect(getArclightMediaComponents).toHaveBeenCalled()
    // expect(getArclightMediaComponent).not.toHaveBeenCalled()
    // expect(handleArclightMediaComponent).not.toHaveBeenCalled()
  })
  //   it('should import media components in missing mode', async () => {
  //     // Mock the necessary dependencies and inputs
  //     const mode = 'missing'
  //     // const getVideoIdsAndSlugs = jest.fn().mockResolvedValue({
  //     //   slugs: {},
  //     //   ids: []
  //     // })
  //     // const fetchMediaLanguagesAndTransformToLanguages = jest
  //     //   .fn()
  //     //   .mockResolvedValue([])
  //     // const getArclightMediaComponents = jest.fn().mockResolvedValue([])
  //     // const getArclightMediaComponent = jest.fn().mockResolvedValue(null)
  //     // Call the function
  //     await main(mode)
  //     // Assert the expected function calls
  //     expect(mockPostgresql.getVideoIdsAndSlugs).toHaveBeenCalled()
  //     expect(
  //       mockArclight.fetchMediaLanguagesAndTransformToLanguages
  //     ).toHaveBeenCalled()
  //     expect(mockArclight.getArclightMediaComponents).toHaveBeenCalled()
  //     expect(mockArclight.getArclightMediaComponent).not.toHaveBeenCalled()
  //     expect(handleArclightMediaComponent).not.toHaveBeenCalled()
  //   })
  //   it('should import media components in update mode', async () => {
  //     // Mock the necessary dependencies and inputs
  //     const mode = 'update'
  //     const target = '123'
  //     // const getVideoIdsAndSlugs = jest.fn().mockResolvedValue({
  //     //   slugs: {},
  //     //   ids: []
  //     // })
  //     // const fetchMediaLanguagesAndTransformToLanguages = jest
  //     //   .fn()
  //     //   .mockResolvedValue([])
  //     // const getArclightMediaComponents = jest.fn().mockResolvedValue([])
  //     // const getArclightMediaComponent = jest.fn().mockResolvedValue({
  //     //   mediaComponentId: '123'
  //     // })
  //     // Call the function
  //     await main(mode, target)
  //     // Assert the expected function calls
  //     expect(mockPostgresql.getVideoIdsAndSlugs).toHaveBeenCalled()
  //     expect(
  //       mockArclight.fetchMediaLanguagesAndTransformToLanguages
  //     ).toHaveBeenCalled()
  //     expect(mockArclight.getArclightMediaComponents).not.toHaveBeenCalled()
  //     expect(mockArclight.getArclightMediaComponent).toHaveBeenCalled()
  //     expect(handleArclightMediaComponent).toHaveBeenCalled()
  //   })
  //   it('should import media components in replace mode', async () => {
  //     // Mock the necessary dependencies and inputs
  //     const mode = 'replace'
  //     const target = '123'
  //     // const getVideoIdsAndSlugs = jest.fn().mockResolvedValue({
  //     //   slugs: {},
  //     //   ids: []
  //     // })
  //     // const fetchMediaLanguagesAndTransformToLanguages = jest
  //     //   .fn()
  //     //   .mockResolvedValue([])
  //     // const getArclightMediaComponents = jest.fn().mockResolvedValue([])
  //     // const getArclightMediaComponent = jest.fn().mockResolvedValue({
  //     //   mediaComponentId: '123'
  //     // })
  //     // Call the function
  //     await main(mode, target)
  //     // Assert the expected function calls
  //     expect(mockPostgresql.getVideoIdsAndSlugs).toHaveBeenCalled()
  //     expect(
  //       mockArclight.fetchMediaLanguagesAndTransformToLanguages
  //     ).toHaveBeenCalled()
  //     expect(mockArclight.getArclightMediaComponents).not.toHaveBeenCalled()
  //     expect(mockArclight.getArclightMediaComponent).toHaveBeenCalled()
  //     expect(handleArclightMediaComponent).toHaveBeenCalled()
  //   })
})
