import { z } from 'zod'

interface ExecuteParams {
  journeyId: string
}

export const getJourney = {
  getJourney: {
    description: 'Get the journey.',
    parameters: z.object({
      journeyId: z.string().describe('The id of the journey.'),
      getJourneyById: z.function().args(z.string()).returns(z.any()),
      token: z
        .string()
        .describe(
          'The token of the user. this is used to authenticate the user and get the journey that the user has access to.'
        )
    }),
    execute: async ({ journeyId }: ExecuteParams) => {
      throw new Error('Not implemented')
    }
  }
}
