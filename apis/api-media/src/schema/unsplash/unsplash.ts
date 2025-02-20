import { builder } from '../builder'

import { UnsplashColor } from './enums/UnsplashColor'
import { UnsplashContentFilter } from './enums/UnsplashContentFilter'
import { UnsplashOrderBy } from './enums/UnsplashOrderBy'
import { UnsplashPhotoOrientation } from './enums/UnsplashPhotoOrientation'
import { UnsplashPhoto } from './objects/UnsplashPhoto'
import { UnsplashQueryResponse } from './objects/UnsplashQueryResponse'
import {
  listUnsplashCollectionPhotos,
  searchUnsplashPhotos,
  triggerUnsplashDownload
} from './service'

builder.queryFields((t) => ({
  listUnsplashCollectionPhotos: t.field({
    type: [UnsplashPhoto],
    nullable: false,
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
  }),
  searchUnsplashPhotos: t.field({
    type: UnsplashQueryResponse,
    nullable: false,
    args: {
      query: t.arg.string({ required: true }),
      page: t.arg.int(),
      perPage: t.arg.int(),
      orderBy: t.arg({ type: UnsplashOrderBy }),
      collections: t.arg.stringList(),
      contentFilter: t.arg({ type: UnsplashContentFilter }),
      color: t.arg({ type: UnsplashColor }),
      orientation: t.arg({ type: UnsplashPhotoOrientation })
    },
    resolve: async (
      _root,
      {
        query,
        page,
        perPage,
        orderBy,
        collections,
        contentFilter,
        color,
        orientation
      }
    ) => {
      return await searchUnsplashPhotos(
        query,
        page ?? undefined,
        perPage ?? undefined,
        orderBy ?? undefined,
        collections ?? undefined,
        contentFilter ?? undefined,
        color ?? undefined,
        orientation ?? undefined
      )
    }
  })
}))

builder.mutationFields((t) => ({
  triggerUnsplashDownload: t.field({
    type: 'Boolean',
    nullable: false,
    args: {
      url: t.arg.string({ required: true })
    },
    resolve: async (_root, { url }) => {
      return await triggerUnsplashDownload(url)
    }
  })
}))
