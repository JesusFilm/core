import { Tool, tool } from 'ai'
import { z } from 'zod'

export function clientSelectImage(): Tool {
  return tool({
    description: 'Ask the user for confirmation on an image.',
    parameters: z.object({
      message: z.string().describe('The message to ask for confirmation.'),
      imageId: z.string().describe('The id of the image to select.')
    })
  })
}
