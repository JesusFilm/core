import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ToolSet } from 'ai'

import { askUserToSelectImage } from './askUserToSelectImage'
import { askUserToSelectVideo } from './askUserToSelectVideo'
import { getJourney } from './getJourney'
import { updateButtonBlocks } from './updateButtonBlocks'
import { updateImageBlock } from './updateImageBlock'
import { updateJourney } from './updateJourney'
import { updateTypographyBlocks } from './updateTypographyBlocks'
import { updateVideoBlocks } from './updateVideoBlocks'

export function tools(client: ApolloClient<NormalizedCacheObject>): ToolSet {
  return {
    getJourney: getJourney(client),
    updateJourney: updateJourney(client),
    updateTypographyBlocks: updateTypographyBlocks(client),
    updateButtonBlocks: updateButtonBlocks(client),
    updateImageBlock: updateImageBlock(client),
    updateVideoBlocks: updateVideoBlocks(client),
    askUserToSelectImage: askUserToSelectImage(),
    askUserToSelectVideo: askUserToSelectVideo()
  }
}
