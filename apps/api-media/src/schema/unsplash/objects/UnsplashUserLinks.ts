import { Basic } from 'unsplash-js/src/methods/users/types'

import { builder } from '../../builder'

export const UnsplashUserLinks =
  builder.objectRef<Basic['links']>('UnsplashUserLinks')

UnsplashUserLinks.implement({
  fields: (t) => ({
    followers: t.exposeString('followers'),
    following: t.exposeString('following'),
    html: t.exposeString('html'),
    likes: t.exposeString('likes'),
    photos: t.exposeString('photos'),
    portfolio: t.exposeString('portfolio'),
    self: t.exposeString('self')
  })
})
