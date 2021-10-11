import { transformResponse } from '.'
import { v4 as uuidv4 } from 'uuid'
import { Response } from '.prisma/api-journeys-client'

describe('transformResponse', () => {
  it('returns transformed database response', () => {
    const response: Response = {
      id: uuidv4(),
      type: 'SignUpResponse',
      userId: uuidv4(),
      blockId: uuidv4(),
      extraAttrs: {
        hello: 'world'
      }
    }
    const transformedResponse = {
      ...response,
      hello: 'world',
      __typename: 'SignUpResponse'
    }
    expect(transformResponse(response)).toEqual(transformedResponse)
  })

  it('handles extraAttrs not being an object', () => {
    const response: Response = {
      id: uuidv4(),
      type: 'SignUpResponse',
      userId: uuidv4(),
      blockId: uuidv4(),
      extraAttrs: 'hello'
    }
    const transformedResponse = {
      ...response,
      __typename: 'SignUpResponse'
    }
    expect(transformResponse(response)).toEqual(transformedResponse)
  })
})
