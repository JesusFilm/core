import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ToolSet } from 'ai'

import { askUserToSelectImage } from './askUserToSelectImage'
import { askUserToSelectVideo } from './askUserToSelectVideo'
import { getJourney } from './getJourney'
import { updateButtonBlocks } from './updateButtonBlocks'
import { updateImageBlock } from './updateImageBlock'
import { updateJourneys } from './updateJourneys'
import { updateRadioOptionBlocks } from './updateRadioOptionBlocks'
import { updateTypographyBlocks } from './updateTypographyBlocks'
import { updateVideoBlocks } from './updateVideoBlocks'

export function tools(client: ApolloClient<NormalizedCacheObject>): ToolSet {
  return {
    getJourney: getJourney(client),
    updateJourneys: updateJourneys(client),
    updateTypographyBlocks: updateTypographyBlocks(client),
    updateButtonBlocks: updateButtonBlocks(client),
    updateImageBlock: updateImageBlock(client),
    updateVideoBlocks: updateVideoBlocks(client),
    askUserToSelectImage: askUserToSelectImage(),
    askUserToSelectVideo: askUserToSelectVideo(),
    updateRadioOptionBlocks: updateRadioOptionBlocks(client)
  }
}
