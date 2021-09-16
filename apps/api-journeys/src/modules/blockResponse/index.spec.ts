import { testkit, gql, Application } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import module from '.'
import prismaMock from '../../lib/mockDb'
import Journey from '../journey'
import Block from '../block'
import { v4 as uuidv4 } from 'uuid'

const setupApp = (): Application => {
  return testkit.testModule(module, {
    schemaBuilder,
    modules: [Journey, Block]
  })
}
const executeGQL = async (
  app,
  query,
  variables
): Promise<{ data?; errors? }> => {
  return await testkit.execute(app, {
    document: query,
    variableValues: variables,
    contextValue: { db: prismaMock }
  })
}

it('creates a video block response', async () => {
  const app = setupApp()

  const userSessionId = uuidv4()
  const blockId = uuidv4()
  const blockResponseId = uuidv4()
  prismaMock.blockResponse.create.mockResolvedValue({ id: blockResponseId })

  const query = gql`
    mutation ($userSessionId: ID!, $blockId: ID!) {
      videoBlockResponseCreate(
        input: {
          userSessionId: $userSessionId
          blockId: $blockId
          position: 4.1
          state: PAUSED
        }
      ) {
        id
      }
    }
  `

  const { data } = await executeGQL(app, query, {
    userSessionId: userSessionId,
    blockId: blockId
  })

  expect(data).toEqual({ videoBlockResponseCreate: blockResponseId })
})
