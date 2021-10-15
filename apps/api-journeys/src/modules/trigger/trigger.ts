import { createModule, gql } from 'graphql-modules'

const typeDefs = gql`
  type TriggerBlock implements Block {
    id: ID!
    parentBlockId: ID
    triggerStart: Int!
    action: Action!
  }
`

export const triggerModule = createModule({
  id: 'trigger',
  dirname: __dirname,
  typeDefs: [typeDefs]
})
