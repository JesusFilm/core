import { Basic } from 'unsplash-js/src/methods/photos/types'

import { builder } from '../../builder'

export const UnsplashPhotoUrls =
  builder.objectRef<Basic['urls']>('UnsplashPhotoUrls')

UnsplashPhotoUrls.implement({
  fields: (t) => ({
    full: t.exposeString('full'),
    raw: t.exposeString('raw'),
    regular: t.exposeString('regular'),
    small: t.exposeString('small'),
    thumb: t.exposeString('thumb')
  })
})
