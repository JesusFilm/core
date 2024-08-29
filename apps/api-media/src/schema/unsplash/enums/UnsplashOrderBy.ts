import { builder } from '../../builder'

export enum UnsplashOrderByEnum {
  latest = 'latest',
  relevant = 'relevant'
}

export const UnsplashOrderBy = builder.enumType('UnsplashOrderBy', {
  values: Object.values(UnsplashOrderByEnum)
})
