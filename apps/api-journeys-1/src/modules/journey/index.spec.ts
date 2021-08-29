import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import module from '.'
import db from '../../lib/db'
import { pick } from 'lodash'

it('returns published journeys', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const journey = await db.journey.create({
    data: {
      title: 'published',
      published: true
    }
  })

  await db.journey.create({
    data: {
      title: 'unpublished',
      published: false
    }
  })

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
      db
    }
  })

  expect(data?.journeys).toEqual([
    pick(journey, ['id', 'title', 'published'])
  ])
})

it('returns journey', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const journey = await db.journey.create({
    data: {
      title: 'published',
      published: true
    }
  })

  const { data } = await testkit.execute(app, {
    document: gql`
      query($id: ID!) {
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
      db
    }
  })

  expect(data?.journey).toEqual(
    pick(journey, ['id', 'title', 'published'])
  )
})

it('creates journey', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const { data } = await testkit.execute(app, {
    document: gql`
      mutation($title: String!) {
        journeyCreate(title: $title) {
          id
        }
      }
    `,
    variableValues: {
      title: 'my journey'
    },
    contextValue: {
      db
    }
  })
  const journey = await db.journey.findUnique({
    where: {
      id: data?.journeyCreate.id
    }
  })

  expect(journey).toEqual({
    id: data?.journeyCreate.id,
    published: false,
    title: 'my journey'
  })
})

it('publishes journey', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const journey = await db.journey.create({
    data: {
      title: 'my journey',
      published: false
    }
  })

  await testkit.execute(app, {
    document: gql`
      mutation($id: ID!) {
        journeyPublish(id: $id) {
          id
        }
      }
    `,
    variableValues: {
      id: journey.id
    },
    contextValue: {
      db
    }
  })

  const uodatedJourney = await db.journey.findUnique({
    where: {
      id: journey.id
    }
  })

  expect(uodatedJourney).toEqual({
    id: journey.id,
    published: true,
    title: 'my journey'
  })
})
