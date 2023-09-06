import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import {
  UnsplashColor,
  UnsplashContentFilter,
  UnsplashOrderBy,
  UnsplashPhoto,
  UnsplashPhotoOrientation,
  UnsplashQueryResponse
} from '../../../__generated__/graphql'

import { UnsplashImageService } from './image.service'

@Resolver('UnsplashImage')
export class UnsplashImageResolver {
  constructor(private readonly unsplashImageService: UnsplashImageService) {}

  @Query()
  async listUnsplashCollectionPhotos(
    @Args('collectionId') collectionId: string,
    @Args('page') page?: number,
    @Args('perPage') perPage?: number,
    @Args('orientation') orientation?: UnsplashPhotoOrientation
  ): Promise<UnsplashPhoto[]> {
    return await this.unsplashImageService.listUnsplashCollectionPhotos(
      collectionId,
      page,
      perPage,
      orientation
    )
  }

  @Query()
  async searchUnsplashPhotos(
    @Args('query') query: string,
    @Args('page') page?: number,
    @Args('perPage') perPage?: number,
    @Args('orderBy') orderBy?: UnsplashOrderBy,
    @Args('collections') collections?: string[],
    @Args('contentFilter') contentFilter?: UnsplashContentFilter,
    @Args('color') color?: UnsplashColor,
    @Args('orientation') orientation?: UnsplashPhotoOrientation
  ): Promise<UnsplashQueryResponse> {
    return await this.unsplashImageService.searchUnsplashPhotos(
      query,
      page,
      perPage,
      orderBy,
      collections,
      contentFilter,
      color,
      orientation
    )
  }

  @Mutation()
  async triggerUnsplashDownload(@Args('url') url: string): Promise<boolean> {
    return await this.unsplashImageService.triggerUnsplashDownload(url)
  }
}
