import { Basic } from 'unsplash-js/src/methods/users/types'

import { builder } from '../../builder'

export const UnsplashUserImage =
  builder.objectRef<Basic['profile_image']>('UnsplashUserImage')

UnsplashUserImage.implement({
  fields: (t) => ({
    small: t.exposeString('small', { nullable: false }),
    medium: t.exposeString('medium', { nullable: false }),
    large: t.exposeString('large', { nullable: false })
  })
})
