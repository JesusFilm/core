import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import module from '.'
import { v4 as uuidv4 } from 'uuid'
import prismaMock from '../../lib/mockDb'
import Journey from '../journey'
import Block from '../block'

it('creates a journey session', async () => {
  const app = testkit.testModule(module, {
    schemaBuilder,
    modules: [Journey, Block]
  })
  const sessionId = uuidv4()
  const journeyId = uuidv4()
  prismaMock.userSession.create.mockResolvedValue({ id: sessionId })

  const query = gql`
    mutation ($journeyId: ID!) {
      userSessionCreate(journeyId: $journeyId) {
        id
      }
    }
  `

  const { data } = await testkit.execute(app, {
    document: query,
    variableValues: { journeyId: journeyId },
    contextValue: { db: prismaMock }
  })
  expect(data?.userSessionCreate).toEqual(sessionId)
})
