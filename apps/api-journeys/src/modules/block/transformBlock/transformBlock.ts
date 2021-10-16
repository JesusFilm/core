import { Block } from '.prisma/api-journeys-client'

type TranformedBlock = Block & {
  __typename: string
}

export const transformBlock = (block: Block): TranformedBlock => {
  return {
    ...block,
    ...(typeof block.extraAttrs === 'object' ? block.extraAttrs : {}),
    __typename: block.blockType
  }
}
