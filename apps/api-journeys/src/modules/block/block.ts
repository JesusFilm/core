import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { BlockModule } from './__generated__/types'
import { transformBlock } from '.'

const typeDefs = gql`
  interface Block {
    id: ID!
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
