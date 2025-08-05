export const country = {
  id: 'US',
  population: 500000000,
  latitude: 10,
  longitude: -20.1,
  flagPngSrc: 'flag.png',
  flagWebpSrc: 'flag.webp'
}

export const countryName = {
  id: '1',
  countryId: country.id,
  value: 'United States',
  languageId: '529',
  primary: true
}

export const continent = {
  id: 'North America'
}

export const continentName = {
  id: '1',
  continentId: country.id,
  value: continent.id,
  languageId: '529',
  primary: true
}

export const countryLanguage = {
  id: 'countryLanguageId',
  countryId: country.id,
  languageId: '529',
  speakers: 100,
  displaySpeakers: 100,
  primary: true,
  suggested: false,
  order: 1
}
