import { builder } from '../../builder'

export enum UnsplashContentFilterEnum {
  low = 'low',
  high = 'high'
}

export const UnsplashContentFilter = builder.enumType('UnsplashContentFilter', {
  values: Object.values(UnsplashContentFilterEnum)
})
