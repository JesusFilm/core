import { builder } from '../../builder'

export enum UnsplashColorEnum {
  black_and_white = 'black_and_white',
  black = 'black',
  white = 'white',
  yellow = 'yellow',
  orange = 'orange',
  red = 'red',
  purple = 'purple',
  magenta = 'magenta',
  green = 'green',
  teal = 'teal',
  blue = 'blue'
}

export const UnsplashColor = builder.enumType('UnsplashColor', {
  values: Object.values(UnsplashColorEnum)
})
