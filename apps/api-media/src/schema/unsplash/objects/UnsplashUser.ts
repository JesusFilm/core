import { Basic } from 'unsplash-js/src/methods/users/types'

import { builder } from '../../builder'

import { UnsplashUserImage } from './UnsplashUserImage'
import { UnsplashUserLinks } from './UnsplashUserLinks'

export const UnsplashUser = builder.objectRef<Basic>('UnsplashUser')

UnsplashUser.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    updated_at: t.exposeString('updated_at'),
    username: t.exposeString('username'),
    name: t.exposeString('name'),
    first_name: t.exposeString('first_name'),
    last_name: t.exposeString('last_name', { nullable: true }),
    twitter_username: t.exposeString('twitter_username', { nullable: true }),
    portfolio_url: t.exposeString('portfolio_url', { nullable: true }),
    bio: t.exposeString('bio', { nullable: true }),
    location: t.exposeString('location', { nullable: true }),
    instagram_username: t.exposeString('instagram_username', {
      nullable: true
    }),
    total_collections: t.exposeInt('total_collections'),
    total_likes: t.exposeInt('total_likes'),
    total_photos: t.exposeInt('total_photos'),
    links: t.expose('links', { type: UnsplashUserLinks }),
    profile_image: t.expose('profile_image', { type: UnsplashUserImage })
  })
})
