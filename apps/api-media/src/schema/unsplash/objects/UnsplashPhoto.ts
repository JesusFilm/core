import { Basic } from 'unsplash-js/src/methods/photos/types'

import { builder } from '../../builder'

import { UnsplashPhotoLinks } from './UnsplashPhotoLinks'
import { UnsplashPhotoUrls } from './UnsplashPhotoUrls'
import { UnsplashUser } from './UnsplashUser'

export const UnsplashPhoto = builder.objectRef<Basic>('UnsplashPhoto')

UnsplashPhoto.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    created_at: t.exposeString('created_at'),
    updated_at: t.exposeString('updated_at', { nullable: true }),
    blur_hash: t.exposeString('blur_hash', { nullable: true }),
    width: t.exposeInt('width'),
    height: t.exposeInt('height'),
    color: t.exposeString('color', { nullable: true }),
    description: t.exposeString('description', { nullable: true }),
    alt_description: t.exposeString('alt_description', { nullable: true }),
    promoted_at: t.exposeString('promoted_at', { nullable: true }),
    likes: t.exposeInt('likes'),
    urls: t.expose('urls', { type: UnsplashPhotoUrls }),
    links: t.expose('links', { type: UnsplashPhotoLinks }),
    user: t.expose('user', { type: UnsplashUser })
  })
})
