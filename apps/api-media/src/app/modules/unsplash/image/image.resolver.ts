import { Resolver, Query } from '@nestjs/graphql'
import {
  UnsplashColor,
  UnsplashContentFilter,
  UnsplashOrderBy,
  UnsplashPhoto,
  UnsplashPhotoOrientation
} from '../../../__generated__/graphql'
import { UnsplashImageService } from './image.service'

@Resolver('UnsplashImage')
export class UnsplashImageResolver {
  constructor(private readonly unsplashImageService: UnsplashImageService) {}

  @Query()
  async searchUnsplashPhotos(
    query: string,
    page?: number,
    perPage?: number,
    orderBy?: UnsplashOrderBy,
    collections?: string[],
    contentFilter?: UnsplashContentFilter,
    color?: UnsplashColor,
    orientation?: UnsplashPhotoOrientation
  ): Promise<UnsplashPhoto[]> {
    return await this.unsplashImageService.searchUnsplashImages(
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
}
