import type { MockedResponse } from '@apollo/client/testing'

import { GET_VIDEOS } from '@/libs/queries/films'
import { mockVideosData } from './fixtures/videos'

export interface GetVideosMockOptions {
  variables?: {
    languageId?: string
    limit?: number
  }
  data?: typeof mockVideosData
  error?: Error
}

export function makeGetVideosMock(options: GetVideosMockOptions = {}): MockedResponse {
  const {
    variables = { languageId: '529', limit: 10 },
    data = mockVideosData,
    error
  } = options

  return {
    request: {
      query: GET_VIDEOS,
      variables
    },
    ...(error ? { error } : { result: { data } })
  }
}

export const defaultGetVideosMocks: MockedResponse[] = [
  makeGetVideosMock()
]

export const errorGetVideosMocks: MockedResponse[] = [
  makeGetVideosMock({
    error: new Error('Network error')
  })
] 