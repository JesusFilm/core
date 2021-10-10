import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { BlockModule } from './__generated__/types'
import { transformBlock } from '.'

const typeDefs = gql`
  interface Block {
    id: ID!
    parentBlockId: ID
  }

  type CardBlock implements Block {
    id: ID!
    parentBlockId: ID
    """
    backgroundColor should be a HEX color value e.g #FFFFFF for white.
    """
    backgroundColor: String
    """
    coverBlockId is present if a child block should be used as a cover.
    This child block should not be rendered normally, instead it should be used
    as a background. Blocks are often of type ImageBlock or VideoBlock.
    """
    coverBlockId: ID
    """
    themeMode can override journey themeMode. If nothing is set then use
    themeMode from journey
    """
    themeMode: ThemeMode
    """
    themeName can override journey themeName. If nothing is set then use
    themeName from journey
    """
    themeName: ThemeName
  }

  type ImageBlock implements Block {
    id: ID!
    parentBlockId: ID
    src: String!
    width: Int!
    height: Int!
    alt: String!
  }

  type StepBlock implements Block {
    id: ID!
    """
    nextBlockId contains the preferred block to navigate to when a
    NavigateAction occurs or if the user manually tries to advance to the next
    step. If no nextBlockId is set it can be assumed that this step represents
    the end of the current journey.
    """
    nextBlockId: ID
    """
    locked will be set to true if the user should not be able to manually
    advance to the next step.
    """
    locked: Boolean!
    parentBlockId: ID
  }

  extend type Journey {
    blocks: [Block!]
  }
`

const resolvers: BlockModule.Resolvers = {
  Journey: {
    async blocks(journey, __, { db }) {
      const blocks = await db.block.findMany({
        where: { journeyId: journey.id },
        orderBy: [{ parentOrder: 'asc' }]
      })
      return blocks.map(transformBlock)
    }
  }
}

export const blockModule = createModule({
  id: 'block',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
