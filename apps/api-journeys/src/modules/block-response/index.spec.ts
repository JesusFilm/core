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
      title: 'my journey',
      published: true
    }
  })

  const { data } = await testkit.execute(app, {
    document: gql`
      mutation($journeyId: ID!) {
        journeySessionCreate(journeyId: $journeyId) {
          id
        }
      }
    `,
    variableValues: {
      journeyId: journey.id
    },
    contextValue: {
      db
    }
  })

  const journeySession = await db.journeySession.findUnique({
    where: {
      id: data?.journeySessionCreate
    }
  })

  expect(journeySession).toEqual({
    id: journeySession?.id,
    journeyId: journey.id
  })
})
