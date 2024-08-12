import { HttpResponse, http } from 'msw'

import { strategyItems } from './data'

export const getStrategySectionHandlers = [
  http.post('https://algolia-dsn.algolia.net/1/indexes/*', () => {
    return HttpResponse.json({
      results: [{ hits: strategyItems }]
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
