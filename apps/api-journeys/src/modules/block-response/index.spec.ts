import { testkit, gql, Application } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import module from '.'
import db from '../../lib/db'
import Journey from '../journey'
import Block from '../block'
import Prisma from '.prisma/api-journeys-client'

const setupApp = (): Application => {
  return testkit.testModule(module, {
    schemaBuilder,
    modules: [Journey, Block]
  })
}
const factoryJourney = async (): Promise<Prisma.Journey> => {
  return await db.journey.create({
    data: {
      title: 'factoried journey',
      published: true
    }
  })
}
const executeGQL = async (app, query, variables): Promise<{ data?, errors? }> => {
  return await testkit.execute(app, {
    document: query,
    variableValues: variables,
    contextValue: { db }
  })
}

it('creates a video block response', async () => {
  const app = setupApp()
  const journey = await factoryJourney()
  const userSession = await db.userSession.create({ data: { journeyId: journey.id } })
  const block = await db.block.create({ data: { journeyId: journey.id } })
  const query = gql`
    mutation($userSessionId: ID!, $blockId: ID!) {
      videoBlockResponseCreate(
        input: {
          userSessionId: $userSessionId,
          blockId: $blockId,
          position: 4.1,
          state: PAUSED
        }
      ) {
        id
      }
    }
  `

  const { data } = await executeGQL(app, query, { userSessionId: userSession.id, blockId: block.id })

  const blockResponse = await db.blockResponse.findUnique({
    where: {
      id: data?.videoBlockResponseCreate
    }
  })

  expect(blockResponse).toEqual({
    id: blockResponse?.id,
    userSessionId: userSession.id,
    blockId: block.id,
    responseData: {
      position: 4.1,
      state: 'PAUSED'
    }
  })
})
