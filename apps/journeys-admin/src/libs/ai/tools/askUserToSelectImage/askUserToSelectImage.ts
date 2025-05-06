import { Tool, tool } from 'ai'
import { z } from 'zod'

export function askUserToSelectImage(): Tool {
  return tool({
    description: 'Ask the user for confirmation.',
    parameters: z.object({
      message: z.string().describe('The message to ask for confirmation.'),
      imageId: z.string().describe('The id of the image to select.')
    })
  })
}
