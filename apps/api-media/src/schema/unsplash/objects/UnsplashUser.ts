import { Basic } from 'unsplash-js/src/methods/users/types'

import { builder } from '../../builder'

import { UnsplashUserImage } from './UnsplashUserImage'
import { UnsplashUserLinks } from './UnsplashUserLinks'

export const UnsplashUser = builder.objectRef<Basic>('UnsplashUser')

UnsplashUser.implement({
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    updated_at: t.exposeString('updated_at', { nullable: false }),
    username: t.exposeString('username', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    first_name: t.exposeString('first_name', { nullable: false }),
    last_name: t.exposeString('last_name'),
    twitter_username: t.exposeString('twitter_username'),
    portfolio_url: t.exposeString('portfolio_url'),
    bio: t.exposeString('bio'),
    location: t.exposeString('location'),
    instagram_username: t.exposeString('instagram_username'),
    total_collections: t.exposeInt('total_collections', { nullable: false }),
    total_likes: t.exposeInt('total_likes', { nullable: false }),
    total_photos: t.exposeInt('total_photos', { nullable: false }),
    links: t.expose('links', { type: UnsplashUserLinks, nullable: false }),
    profile_image: t.expose('profile_image', {
      type: UnsplashUserImage,
      nullable: false
    })
  })
})
