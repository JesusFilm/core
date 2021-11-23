import { Response } from '.prisma/api-journeys-client'

type TranformedResponse = Response & {
  __typename: string
}

export const transformResponse = (response: Response): TranformedResponse => {
  return {
    ...response,
    ...(typeof response.extraAttrs === 'object' ? response.extraAttrs : {}),
    __typename: response.type
  }
}
