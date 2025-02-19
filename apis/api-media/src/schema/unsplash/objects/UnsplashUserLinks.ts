import { Basic } from 'unsplash-js/src/methods/users/types'

import { builder } from '../../builder'

export const UnsplashUserLinks =
  builder.objectRef<Basic['links']>('UnsplashUserLinks')

UnsplashUserLinks.implement({
  fields: (t) => ({
    followers: t.exposeString('followers', { nullable: false }),
    following: t.exposeString('following', { nullable: false }),
    html: t.exposeString('html', { nullable: false }),
    likes: t.exposeString('likes', { nullable: false }),
    photos: t.exposeString('photos', { nullable: false }),
    portfolio: t.exposeString('portfolio', { nullable: false }),
    self: t.exposeString('self', { nullable: false })
  })
})
