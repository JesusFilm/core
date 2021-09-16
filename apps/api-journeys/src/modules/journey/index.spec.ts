import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import module from '.'
import prismaMock from '../../lib/mockDb'
import { pick } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

it('returns published journeys', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const publishedJourney = {
    id: uuidv4(),
    title: 'published',
    published: true
  }
  prismaMock.journey.findMany.mockResolvedValue([publishedJourney])

  const { data } = await testkit.execute(app, {
    document: gql`
      query {
        journeys {
          id
          title
          published
        }
      }
    `,
    contextValue: {
      db: prismaMock
    }
  })

  expect(data?.journeys).toEqual([
    pick(publishedJourney, ['id', 'title', 'published'])
  ])
})

it('returns journey', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const journey = {
    id: uuidv4(),
    title: 'published',
    published: true
  }
  prismaMock.journey.findUnique.mockResolvedValue(journey)

  const { data } = await testkit.execute(app, {
    document: gql`
      query ($id: ID!) {
        journey(id: $id) {
          id
          title
          published
        }
      }
    `,
    variableValues: {
      id: journey.id
    },
    contextValue: {
      db: prismaMock
    }
  })

  expect(data?.journey).toEqual(pick(journey, ['id', 'title', 'published']))
})

it('creates journey', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const journey = {
    id: uuidv4(),
    title: 'published',
    published: true
  }
  prismaMock.journey.create.mockResolvedValue(journey)

  const { data } = await testkit.execute(app, {
    document: gql`
      mutation ($title: String!) {
        journeyCreate(title: $title) {
          id
          title
          published
        }
      }
    `,
    variableValues: {
      title: 'my journey'
    },
    contextValue: {
      db: prismaMock
    }
  })

  expect(data?.journeyCreate).toEqual(journey)
})

it('publishes journey', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const journey = { id: uuidv4() }
  prismaMock.journey.update.mockResolvedValue(journey)

  const { data } = await testkit.execute(app, {
    document: gql`
      mutation ($id: ID!) {
        journeyPublish(id: $id) {
          id
        }
      }
    `,
    variableValues: {
      id: journey.id
    },
    contextValue: {
      db: prismaMock
    }
  })

  expect(data?.journeyPublish).toEqual(journey)
})
