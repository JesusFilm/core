import { builder } from '../builder'

import { UnsplashPhotoOrientation } from './enums/UnsplashPhotoOrientation'
import { UnsplashPhoto } from './objects/UnsplashPhoto'
import { listUnsplashCollectionPhotos } from './service'

builder.queryType({
  fields: (t) => ({
    listUnsplashCollectionPhotos: t.field({
      type: [UnsplashPhoto],
      args: {
        collectionId: t.arg.string({ required: true }),
        page: t.arg.int(),
        perPage: t.arg.int(),
        orientation: t.arg({ type: UnsplashPhotoOrientation })
      },
      resolve: async (_root, { collectionId, page, perPage, orientation }) => {
        return await listUnsplashCollectionPhotos(
          collectionId,
          page ?? undefined,
          perPage ?? undefined,
          orientation ?? undefined
        )
      }
    })
  })
})
