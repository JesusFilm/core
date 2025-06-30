import { Tool, tool } from 'ai'
import { z } from 'zod'

export function clientSelectVideo(): Tool {
  return tool({
    description: 'Ask the user for confirmation on a video.',
    parameters: z.object({
      message: z.string().describe('The message to ask for confirmation.'),
      videoId: z.string().describe('The id of the video to select.')
    })
  })
}
