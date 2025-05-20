import { builder } from '../../builder'

// Create enum type for VideoBlockObjectFit
const objectFitValues = ['fill', 'fit', 'zoomed'] as const
export const VideoBlockObjectFit = builder.enumType('VideoBlockObjectFit', {
  values: objectFitValues
})
