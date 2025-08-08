import { ArclightFile } from './types'

export const queueName = 'api-media-crowdin'
export const jobName = `${queueName}-job`

const EVERY_DAY_AT_2_AM = '0 0 3 * * *'
export const repeat = EVERY_DAY_AT_2_AM

export const CROWDIN_CONFIG = {
  projectId: 47654,
  files: {
    collection_title: {
      id: 31,
      name: 'collection_title.csv',
      title: 'Collection Titles',
      path: '/Arclight/collection_title.csv'
    } as ArclightFile,
    collection_long_description: {
      id: 33,
      name: 'collection_long_description.csv',
      title: 'Collection Long Descriptions',
      path: '/Arclight/collection_long_description.csv'
    } as ArclightFile,
    media_metadata_tile: {
      id: 34,
      name: 'media_metadata_tile.csv',
      title: 'Video Titles',
      path: '/Arclight/media_metadata_tile.csv'
    } as ArclightFile,
    media_metadata_description: {
      id: 35,
      name: 'media_metadata_description.csv',
      title: 'Video Long Descriptions',
      path: '/Arclight/media_metadata_description.csv'
    } as ArclightFile,
    bible_books: {
      id: 36,
      name: 'Bible_books.csv',
      title: 'Bible Books',
      path: '/Arclight/Bible_books.csv'
    } as ArclightFile,
    study_questions: {
      id: 37,
      name: 'study_questions.csv',
      title: 'Study Questions',
      path: '/Arclight/study_questions.csv'
    } as ArclightFile
  }
}

export const LANGUAGE_CODES = {
  ko: '3804',
  ar: '22658',
  'es-MX': '21028',
  'pt-BR': '584',
  tr: '1942',
  'zh-CN': '21754',
  fa: '6788',
  'ur-PK': '407',
  he: '6930',
  hi: '6464',
  fr: '496',
  'zh-TW': '21753',
  ru: '3934',
  de: '1106',
  id: '16639',
  ja: '7083',
  vi: '3887',
  th: '13169',
  bn: '176243'
}
