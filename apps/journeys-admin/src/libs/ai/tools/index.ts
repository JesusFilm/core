import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ToolSet } from 'ai'

import { askUserToSelectImage } from './askUserToSelectImage'
import { getJourney } from './getJourney'
import { updateButtonBlock } from './updateButtonBlock'
import { updateImageBlock } from './updateImageBlock'
import { updateJourney } from './updateJourney'
import { updateTypographyBlock } from './updateTypographyBlock'

export function tools(client: ApolloClient<NormalizedCacheObject>): ToolSet {
  return {
    getJourney: getJourney(client),
    updateJourney: updateJourney(client),
    updateTypographyBlock: updateTypographyBlock(client),
    updateButtonBlock: updateButtonBlock(client),
    updateImageBlock: updateImageBlock(client),
    askUserToSelectImage: askUserToSelectImage()
  }
}
