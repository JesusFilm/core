// VideoBlockSource until it is changed in journeys
import { builder } from '../builder'

export enum VideoSourceShape {
  cloudflare = 'cloudflare',
  internal = 'internal',
  youTube = 'youTube',
  mux = 'mux'
}

export const VideoSource = builder.enumType(VideoSourceShape, {
  name: 'VideoBlockSource'
})
