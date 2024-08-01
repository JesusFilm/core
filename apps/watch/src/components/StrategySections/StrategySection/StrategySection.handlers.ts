import { http, HttpResponse } from 'msw'

import { strategyItems } from './data'

export const getStrategyCardDataHandlers = [
  http.post('https://algolia-dsn.algolia.net/1/indexes/*', () => {
    return HttpResponse.json({
      results: [{ hits: [...strategyItems] }]
    })
  })
]
