import { Basic } from 'unsplash-js/src/methods/users/types'

import { builder } from '../../builder'

export const UnsplashUserImage =
  builder.objectRef<Basic['profile_image']>('UnsplashUserImage')

UnsplashUserImage.implement({
  fields: (t) => ({
    small: t.exposeString('small'),
    medium: t.exposeString('medium'),
    large: t.exposeString('large')
  })
})
