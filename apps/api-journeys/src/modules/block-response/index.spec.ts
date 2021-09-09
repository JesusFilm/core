import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import module from '.'
import db from '../../lib/db'

it('creates a journey session', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const journey = await db.journey.create({
    data: {
      title: 'my journey',
      published: true
    }
  })

  const { data } = await testkit.execute(app, {
    document: gql`
      mutation($journeyId: ID!) {
        journeySessionCreate(journeyid: $journeyId) {
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
      id: data?.id
    }
  })

  expect(journeySession).toEqual({
    id: journeySession.id,
    journeyId: journey.id
  })
})
