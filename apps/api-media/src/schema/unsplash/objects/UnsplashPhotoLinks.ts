import { Basic } from 'unsplash-js/src/methods/photos/types'

import { builder } from '../../builder'

export const UnsplashPhotoLinks =
  builder.objectRef<Basic['links']>('UnsplashPhotoLinks')

UnsplashPhotoLinks.implement({
  fields: (t) => ({
    self: t.exposeString('self'),
    html: t.exposeString('html'),
    download: t.exposeString('download'),
    download_location: t.exposeString('download_location')
  })
})
