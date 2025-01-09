interface TestData {
  apiKey: string
  mediaComponentId: string
  mediaComponentIds: string[]
  mediaComponentLinks: string[]
  languageId: string
  languageIds: string[]
  countryId: string
  countryIds: string[]
}

export const testData: TestData = {
  apiKey: '3a21a65d4gf98hZ7',
  mediaComponentId: '2_0-1Torch',
  mediaComponentIds: [
    'CS1',
    '1_jf-0-0',
    '1_wl-0-0',
    '1_cl-0-0',
    '1_mld-0-0',
    '1_fj_1-0-0',
    '2_0-ConsideringChristmas'
  ],
  mediaComponentLinks: ['2_0-WhatIsHome', '10_DarkroomFaith', '11_Advent0104'],
  languageId: '529',
  languageIds: ['529', '496', '21064'],
  countryId: 'IM',
  countryIds: ['IM', 'US', 'GB']
}
