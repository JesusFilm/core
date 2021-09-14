import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import module from '.'
import db from '../../lib/db'
import Journey from '../journey'
import Block from '../block'

it('creates a journey session', async () => {
  const app = testkit.testModule(module, {
    schemaBuilder,
    modules: [Journey, Block]
  })
  const journey = await db.journey.create({
    data: {
      title: 'factoried journey',
      published: true
    }
  })
  const query = gql`
    mutation($journeyId: ID!) {
      userSessionCreate(journeyId: $journeyId) {
        id
      }
    }
  `

  const { data } = await testkit.execute(app, {
    document: query,
    variableValues: { journeyId: journey.id },
    contextValue: { db }
  })

  const journeySession = await db.userSession.findUnique({
    where: {
      id: data?.userSessionCreate
    }
  })

  expect(journeySession).toEqual({
    id: journeySession?.id,
    journeyId: journey.id
  })
})
