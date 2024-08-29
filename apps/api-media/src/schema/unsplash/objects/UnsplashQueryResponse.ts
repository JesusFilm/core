import { builder } from '../../builder'

import { UnsplashPhoto } from './UnsplashPhoto'

interface UnsplashQueryResponseShape {
  total: number
  total_pages: number
  results: Array<typeof UnsplashPhoto.$inferType>
}

export const UnsplashQueryResponse =
  builder.objectRef<UnsplashQueryResponseShape>('UnsplashQueryResponse')

UnsplashQueryResponse.implement({
  fields: (t) => ({
    total: t.exposeInt('total'),
    total_pages: t.exposeInt('total_pages'),
    results: t.expose('results', { type: [UnsplashPhoto] })
  })
})
