import { Basic } from 'unsplash-js/src/methods/photos/types'

import { builder } from '../../builder'

import { UnsplashPhotoLinks } from './UnsplashPhotoLinks'
import { UnsplashPhotoUrls } from './UnsplashPhotoUrls'
import { UnsplashUser } from './UnsplashUser'

export const UnsplashPhoto = builder.objectRef<Basic>('UnsplashPhoto')

UnsplashPhoto.implement({
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    created_at: t.exposeString('created_at', { nullable: false }),
    updated_at: t.exposeString('updated_at'),
    blur_hash: t.exposeString('blur_hash'),
    width: t.exposeInt('width', { nullable: false }),
    height: t.exposeInt('height', { nullable: false }),
    color: t.exposeString('color'),
    description: t.exposeString('description'),
    alt_description: t.exposeString('alt_description'),
    promoted_at: t.exposeString('promoted_at'),
    likes: t.exposeInt('likes', { nullable: false }),
    urls: t.expose('urls', { type: UnsplashPhotoUrls, nullable: false }),
    links: t.expose('links', { type: UnsplashPhotoLinks, nullable: false }),
    user: t.expose('user', { type: UnsplashUser, nullable: false })
  })
})
