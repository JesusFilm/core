// import { PrismaVideo } from '../postgresql'

// const video: PrismaVideo = {
//   id: 'JFM1',
//   slug: 'video-slug',
//   label: 'featureFilm',
//   primaryLanguageId: '529',
//   seoTitle: [],
//   snippet: [],
//   description: [],
//   studyQuestions: [],
//   image: '',
//   imageAlt: [],
//   noIndex: false
//   // childIds: ['20615', '20615']
// }

export const getVideoIdsAndSlugs = jest
  .fn()
  .mockResolvedValue({ slugs: {}, ids: [] })
export const handleVideo = jest.fn().mockResolvedValue({})
