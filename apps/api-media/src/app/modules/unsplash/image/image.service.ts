import { Injectable } from '@nestjs/common'
import isArray from 'lodash/isArray'
import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import fetch from 'node-fetch'

import {
  UnsplashColor,
  UnsplashContentFilter,
  UnsplashOrderBy,
  UnsplashPhoto,
  UnsplashPhotoOrientation,
  UnsplashQueryResponse
} from '../../../__generated__/graphql'

@Injectable()
export class UnsplashImageService {
  async listUnsplashCollectionPhotos(
    collectionId: string,
    page?: number,
    perPage?: number,
    orientation?: UnsplashPhotoOrientation
  ): Promise<UnsplashPhoto[]> {
    const querystring = [`client_id=${process.env.UNSPLASH_ACCESS_KEY ?? ''}`]
    // must typecheck these because apollo may send empty object instead of undefined
    if (isNumber(page)) {
      querystring.push(`page=${page}`)
    }
    if (isNumber(perPage)) {
      querystring.push(`per_page=${perPage}`)
    }
    if (isString(orientation)) {
      querystring.push(`orientation=${orientation}`)
    }
    const url = `https://api.unsplash.com/collections/${collectionId}/photos?${querystring.join(
      '&'
    )}`
    const response = await fetch(url)
    return await response.json()
  }

  async searchUnsplashPhotos(
    query: string,
    page?: number,
    perPage?: number,
    orderBy?: UnsplashOrderBy,
    collections?: string[],
    contentFilter?: UnsplashContentFilter,
    color?: UnsplashColor,
    orientation?: UnsplashPhotoOrientation
  ): Promise<UnsplashQueryResponse> {
    const querystring = [
      `client_id=${process.env.UNSPLASH_ACCESS_KEY ?? ''}`,
      `query=${query}`
    ]
    // must typecheck these because apollo may send empty object instead of undefined
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
    return await response.json()
  }

  async triggerUnsplashDownload(url: string): Promise<boolean> {
    await fetch(`${url}&client_id=${process.env.UNSPLASH_ACCESS_KEY ?? ''}`)
    return true
  }
}
