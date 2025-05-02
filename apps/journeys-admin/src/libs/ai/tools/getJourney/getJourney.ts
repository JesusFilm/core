import { z } from 'zod'

interface ExecuteParams {
  journeyId: string
}

export const getJourney = {
  getJourney: {
    description: 'Get the journey.',
    parameters: z.object({
      journeyId: z.string().describe('The id of the journey.')
    }),
    execute: async ({ journeyId }: ExecuteParams) => {
      throw new Error('Not implemented')
    }
  }
}
