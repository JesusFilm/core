import {
  AudioPreview,
  Language,
  LanguageName,
  LanguageSlug
} from '@core/prisma/languages/client'

export const audioPreview: AudioPreview = {
  value: 'abc.mp3',
  size: 1024,
  duration: 10,
  languageId: '20615',
  bitrate: 128,
  codec: 'aac',
  updatedAt: new Date('2021-01-01T00:00:00.000Z')
}

export const language: Language = {
  id: '20615',
  bcp47: 'zh',
  iso3: 'zh',
  slug: 'mandarin-china',
  hasVideos: true,
  createdAt: new Date('2021-01-01T00:00:00.000Z'),
  updatedAt: new Date('2021-01-01T00:00:00.000Z')
}

export const languageSlug: LanguageSlug[] = [
  {
    id: 'languageSlug1',
    value: 'mandarin-china',
    canonical: true,
    languageId: '20615',
    createdAt: new Date('2021-01-01T00:00:00.000Z'),
    updatedAt: new Date('2021-01-01T00:00:00.000Z')
  },
  {
    id: 'languageSlug2',
    value: 'chinese-mandarin',
    canonical: false,
    languageId: '20615',
    createdAt: new Date('2021-01-01T00:00:00.000Z'),
    updatedAt: new Date('2021-01-01T00:00:00.000Z')
  }
]

export const languageName: LanguageName[] = [
  {
    id: '1',
    parentLanguageId: language.id,
    value: '普通話',
    primary: true,
    languageId: '20615'
  },
  {
    id: '2',
    parentLanguageId: language.id,
    value: 'Chinese, Mandarin',
    primary: false,
    languageId: '529'
  }
]
