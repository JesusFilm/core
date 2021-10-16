import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'

const typeDefs = gql`
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
`

export const stepModule = createModule({
  id: 'step',
  dirname: __dirname,
  typeDefs: [typeDefs]
})
