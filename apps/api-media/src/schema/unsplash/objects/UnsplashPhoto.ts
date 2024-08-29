import { builder } from '../../builder'

interface UnsplashPhotoShape {
  id: string
  created_at: string
  updated_at?: string
  blur_hash?: string | null
  width: number
  height: number
  color?: string | null
  description?: string | null
  alt_description?: string | null
  categories?: string[]
  likes: number
  // urls: UnsplashPhotoUrls
  // links: UnsplashPhotoLinks
  // user: UnsplashUser
}

export const UnsplashPhoto =
  builder.objectRef<UnsplashPhotoShape>('UnsplashPhoto')

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
    categories: t.exposeStringList('categories', { nullable: true }),
    likes: t.exposeInt('likes')
  })
})
