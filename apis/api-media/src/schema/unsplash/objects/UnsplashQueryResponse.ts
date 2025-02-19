import { Photos } from 'unsplash-js/src/methods/search/types/response'

import { builder } from '../../builder'

import { UnsplashPhoto } from './UnsplashPhoto'

export const UnsplashQueryResponse = builder.objectRef<Photos>(
  'UnsplashQueryResponse'
)

UnsplashQueryResponse.implement({
  fields: (t) => ({
    total: t.exposeInt('total', { nullable: false }),
    total_pages: t.exposeInt('total_pages', { nullable: false }),
    results: t.expose('results', { type: [UnsplashPhoto], nullable: false })
  })
})
