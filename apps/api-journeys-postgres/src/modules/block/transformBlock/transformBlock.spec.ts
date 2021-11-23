import { transformBlock } from '.'
import { v4 as uuidv4 } from 'uuid'
import { Block } from '.prisma/api-journeys-client'

describe('transformBlock', () => {
  it('returns transformed database block', () => {
    const block: Block = {
      id: uuidv4(),
      blockType: 'TypographyBlock',
      journeyId: uuidv4(),
      parentBlockId: uuidv4(),
      parentOrder: 0,
      extraAttrs: {
        hello: 'world'
      }
    }
    const transformedBlock = {
      ...block,
      hello: 'world',
      __typename: 'TypographyBlock'
    }
    expect(transformBlock(block)).toEqual(transformedBlock)
  })

  it('handles extraAttrs not being an object', () => {
    const block: Block = {
      id: uuidv4(),
      blockType: 'TypographyBlock',
      journeyId: uuidv4(),
      parentBlockId: uuidv4(),
      parentOrder: 0,
      extraAttrs: 'hello'
    }
    const transformedBlock = {
      ...block,
      __typename: 'TypographyBlock'
    }
    expect(transformBlock(block)).toEqual(transformedBlock)
  })
})
