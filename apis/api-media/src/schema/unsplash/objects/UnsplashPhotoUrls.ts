import { Basic } from 'unsplash-js/src/methods/photos/types'

import { builder } from '../../builder'

export const UnsplashPhotoUrls =
  builder.objectRef<Basic['urls']>('UnsplashPhotoUrls')

UnsplashPhotoUrls.implement({
  fields: (t) => ({
    full: t.exposeString('full', { nullable: false }),
    raw: t.exposeString('raw', { nullable: false }),
    regular: t.exposeString('regular', { nullable: false }),
    small: t.exposeString('small', { nullable: false }),
    thumb: t.exposeString('thumb', { nullable: false })
  })
})
