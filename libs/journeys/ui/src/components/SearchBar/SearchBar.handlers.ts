import { HttpResponse, http } from 'msw'

const languageFacets = {
  languageEnglishName: {
    English: 491,
    'Spanish, Latin American': 324,
    'Mandarin, China': 509,
    Cantonese: 167,
    'Spanish, Castilian': 145,
    'Chinese, Simplified': 45,
    Tula: 75,
    'Chinese, Traditional': 21
  }
}

export const getLanguageFacetHandlers = [
  http.post('https://algolia-dsn.algolia.net/1/indexes/*', () => {
    return HttpResponse.json({
      results: [{ facets: languageFacets }]
    })
  })
]

export const emptyLanguageFacetHandlers = [
  http.post('https://algolia-dsn.algolia.net/1/indexes/*', () => {
    return HttpResponse.json({
      results: [{ facets: [] }]
    })
  })
]

export const emptyResultsHandler = [
  http.post('https://algolia-dsn.algolia.net/1/indexes/*', () => {
    return HttpResponse.json({
      results: [{ hits: [] }]
    })
  })
]
