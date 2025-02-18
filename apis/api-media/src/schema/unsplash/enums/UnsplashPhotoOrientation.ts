import { builder } from '../../builder'

export enum UnsplashPhotoOrientationEnum {
  landscape = 'landscape',
  portrait = 'portrait',
  squarish = 'squarish'
}

export const UnsplashPhotoOrientation = builder.enumType(
  'UnsplashPhotoOrientation',
  {
    values: Object.values(UnsplashPhotoOrientationEnum)
  }
)
