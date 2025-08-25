import { Tool, tool } from 'ai'
import { z } from 'zod'

export function clientRedirectUserToEditor(): Tool {
  return tool({
    description: 'Redirect the user to the editor.',
    parameters: z.object({
      message: z
        .string()
        .describe(
          'The message to let the user know they can see their journey by clicking the button below and inform them it takes them to the editor.'
        ),
      journeyId: z.string().describe('The id of the journey to redirect to.')
    })
  })
}
