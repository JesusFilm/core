import { Injectable } from '@nestjs/common'
import { isArray, isNumber, isString } from 'lodash'
import fetch from 'node-fetch'
import {
  UnsplashColor,
  UnsplashContentFilter,
  UnsplashOrderBy,
  UnsplashPhoto,
  UnsplashPhotoOrientation
} from '../../../__generated__/graphql'

@Injectable()
export class UnsplashImageService {
  async searchUnsplashImages(
    query: string,
    page?: number,
    perPage?: number,
    orderBy?: UnsplashOrderBy,
    collections?: string[],
    contentFilter?: UnsplashContentFilter,
    color?: UnsplashColor,
    orientation?: UnsplashPhotoOrientation
  ): Promise<UnsplashPhoto[]> {
    const querystring = [
      `client_id=${process.env.UNSPLASH_ACCESS_KEY ?? ''}`,
      `query=${query}`
    ]
    // must typecheck these because apollo will send empty object instead of undefined
    if (isNumber(page)) {
      querystring.push(`page=${page}`)
    }
    if (isNumber(perPage)) {
      querystring.push(`per_page=${perPage}`)
    }
    if (isString(orderBy)) {
      querystring.push(`order_by=${orderBy}`)
    }
    if (isArray(collections)) {
      querystring.push(`collections=${collections.join(',')}`)
    }
    if (isString(contentFilter)) {
      querystring.push(`content_filter=${contentFilter}`)
    }
    if (isString(color)) {
      querystring.push(`color=${color}`)
    }
    if (isString(orientation)) {
      querystring.push(`orientation=${orientation}`)
    }
    const url = `https://api.unsplash.com/search/photos?${querystring.join(
      '&'
    )}`
    const response = await fetch(url)
    const result = await response.json()
    return result.results
  }
}
