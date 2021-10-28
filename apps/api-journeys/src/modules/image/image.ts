import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { transformBlock } from '../block'
import { ImageModule } from './__generated__/types'

const typeDefs = gql`
  type ImageBlock implements Block {
    id: ID!
    parentBlockId: ID
    src: String!
    width: Int!
    height: Int!
    alt: String!
  }

  extend type Journey {
    primaryImageBlock: ImageBlock
  }  
`

const resolvers: ImageModule.Resolvers = {
  Journey: {
    async primaryImageBlock(journey, __, { db }) {
      if(journey.primaryImageBlockId == null) return null

      const block = await db.block.findUnique({
        where: { id: journey.primaryImageBlockId }
      })

      return block != null ? transformBlock(block): null
    }
  }
}

export const imageModule = createModule({
  id: 'image',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
