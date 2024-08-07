import { HttpResponse, http } from 'msw'

import { algoliaVideos } from '../../libs/algolia/useAlgoliaVideos/data'

export const getAlgoliaVideosHandlers = [
  http.post('https://algolia-dsn.algolia.net/1/indexes/*', () => {
    return HttpResponse.json({
      results: [{ hits: algoliaVideos, nbHits: 184557 }]
    })
  })
]

export const emptyResultsHandler = [
  http.post('https://algolia-dsn.algolia.net/1/indexes/*', () => {
    return HttpResponse.json({
      results: [{ hits: [], nbHits: 0 }]
    })
  })
]
