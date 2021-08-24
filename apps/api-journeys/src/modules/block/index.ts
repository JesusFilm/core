import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { BlockModule } from './__generated__/types'

const typeDefs = gql`
  extend type Journey {
    blocks: [Block!]!
  }

  union Block = StepBlock | VideoBlock | RadioQuestionBlock | RadioOptionBlock

  interface BaseBlock {
    id: ID!
    parent: Block
  }

  type StepBlock implements BaseBlock {
    id: ID!
    parent: Block
  }

  type VideoBlock implements BaseBlock {
    id: ID!
    parent: Block
    src: String!
    title: String!
    description: String
    provider: VideoProviderEnum
  }

  enum VideoProviderEnum {
    YOUTUBE
    VIMEO
    ARCLIGHT
  }

  type RadioQuestionBlock implements BaseBlock {
    id: ID!
    parent: Block
    label: String!
    description: String!
    variant: 'light' | 'dark'
  }

  type RadioOptionBlock implements BaseBlock {
    id: ID!
    parent: Block
    ## Field suggestions to be added
    label: String!
    image: String!
  }
`

const resolvers: BlockModule.Resolvers = {
  Journey: {
    async blocks(journey) {
      return []
    }
  }
}

export default createModule({
  id: 'block',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
