import { Basic } from 'unsplash-js/src/methods/photos/types'

import { builder } from '../../builder'

export const UnsplashPhotoLinks =
  builder.objectRef<Basic['links']>('UnsplashPhotoLinks')

UnsplashPhotoLinks.implement({
  fields: (t) => ({
    self: t.exposeString('self', { nullable: false }),
    html: t.exposeString('html', { nullable: false }),
    download: t.exposeString('download', { nullable: false }),
    download_location: t.exposeString('download_location', { nullable: false })
  })
})
