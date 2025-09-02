import nodeFetch from 'node-fetch'
import { createApi } from 'unsplash-js'

import { UnsplashColorEnum } from './enums/UnsplashColor'
import { UnsplashContentFilterEnum } from './enums/UnsplashContentFilter'
import { UnsplashOrderByEnum } from './enums/UnsplashOrderBy'
import { UnsplashPhotoOrientationEnum } from './enums/UnsplashPhotoOrientation'
import { UnsplashPhoto } from './objects/UnsplashPhoto'
import { UnsplashQueryResponse } from './objects/UnsplashQueryResponse'

function getClient(): ReturnType<typeof createApi> {
  return createApi({
    accessKey: process.env.UNSPLASH_ACCESS_KEY ?? '',
    fetch: nodeFetch as unknown as typeof fetch
  })
}

export async function listUnsplashCollectionPhotos(
  collectionId: string,
  page?: number,
  perPage?: number,
  orientation?: UnsplashPhotoOrientationEnum
): Promise<Array<typeof UnsplashPhoto.$inferType>> {
  const { response } = await getClient().collections.getPhotos({
    collectionId,
    page,
    perPage,
    orientation
  })
  return response?.results ?? []
}

export async function searchUnsplashPhotos(
  query: string,
  page?: number,
  perPage?: number,
  orderBy?: UnsplashOrderByEnum,
  collections?: string[],
  contentFilter?: UnsplashContentFilterEnum,
  color?: UnsplashColorEnum,
  orientation?: UnsplashPhotoOrientationEnum
): Promise<typeof UnsplashQueryResponse.$inferType> {
  const response = await getClient().search.getPhotos({
    query,
    page,
    perPage,
    orderBy,
    collectionIds: collections,
    contentFilter,
    color,
    orientation
  })

  if (response.response == null) throw new Error('Failed to fetch photos')

  return response.response
}

export async function triggerUnsplashDownload(url: string): Promise<boolean> {
  const response = await getClient().photos.trackDownload({
    downloadLocation: url
  })
  return response.status === 200
}
