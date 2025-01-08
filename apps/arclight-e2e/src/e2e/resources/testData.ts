import { expect } from '@playwright/test'

export const expectedCountry = {
  countryId: 'US',
  name: 'United States',
  continentName: 'North America',
  metadataLanguageTag: 'en',
  longitude: -97,
  latitude: 38,
  _links: {
    self: {
      href: expect.stringMatching(
        /^http:\/\/.*\/v2\/media-countries\/US\?apiKey=.*$/
      )
    }
  }
}

export const expectedLanguage = {
  languageId: 529,
  iso3: 'eng',
  bcp47: 'en',
  primaryCountryId: 'GB',
  name: 'English',
  nameNative: 'English',
  metadataLanguageTag: 'en',
  _links: {
    self: {
      href: 'http://api.arclight.org/v2/media-languages/529?apiKey=3a21a65d4gf98hZ7'
    }
  }
}

export const expectedVideo = {
  mediaComponentId: '2_0-PaperHats',
  componentType: 'content',
  subType: 'shortFilm',
  contentType: 'video',
  imageUrls: {
    thumbnail:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-PaperHats.thumbnail.jpg',
    videoStill:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-PaperHats.videoStill.jpg',
    mobileCinematicHigh:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-PaperHats.mobileCinematicHigh.jpg',
    mobileCinematicLow:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-PaperHats.mobileCinematicLow.jpg',
    mobileCinematicVeryLow:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-PaperHats.mobileCinematicVeryLow.webp'
  },
  lengthInMilliseconds: 262479,
  containsCount: 0,
  isDownloadable: true,
  downloadSizes: {
    approximateSmallDownloadSizeInBytes: 7118576,
    approximateLargeDownloadSizeInBytes: 80779882
  },
  bibleCitations: [
    {
      osisBibleBook: '2Cor',
      chapterStart: 5,
      verseStart: 17,
      chapterEnd: null,
      verseEnd: null
    }
  ],
  primaryLanguageId: 529,
  title: 'Paper Hats',
  shortDescription: "A man's view on life is changed after a hard experience.",
  longDescription: "A man's view on life is changed after a hard experience.",
  studyQuestions: [
    'What did you think of the film?',
    'What do you think the bowler hat represented to the man?',
    'What do you think changed in the main character that caused his interactions with his wife to be different in the end than what they were in the beginning?',
    'Have you ever had something happen in your life that changed the way you viewed the world and the people in it? If so, what about it impacted you?',
    'What in your life may distract you from what is really important?',
    'Would you be open to sharing what those important things are to you?'
  ],
  metadataLanguageTag: 'en'
}
