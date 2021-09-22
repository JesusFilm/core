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
      published: true,
      locale: 'id-ID',
      theme: 'default'
    }
  })

  await db.journey.create({
    data: {
      title: 'unpublished',
      published: false,
      locale: 'hi-IN',
      theme: 'default'
    }
  })

  const { data } = await testkit.execute(app, {
    document: gql`
      query {
        journeys {
          id
          title
          published
          locale
          theme
        }
      }
    `,
    contextValue: {
      db
    }
  })

  expect(data?.journeys).toEqual([
    pick(journey, ['id', 'title', 'published', 'locale', 'theme'])
  ])
})

it('returns journey', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const journey = await db.journey.create({
    data: {
      title: 'published',
      published: true,
      locale: 'id-ID',
      theme: 'default'
    }
  })

  const { data } = await testkit.execute(app, {
    document: gql`
      query ($id: ID!) {
        journey(id: $id) {
          id
          title
          published
          locale
          theme
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
    pick(journey, ['id', 'title', 'published', 'locale', 'theme'])
  )
})

it('creates journey', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const { data } = await testkit.execute(app, {
    document: gql`
      mutation ($title: String!, $locale: String, $theme: ThemeName) {
        journeyCreate(title: $title, locale: $locale, theme: $theme) {
          id
        }
      }
    `,
    variableValues: {
      title: 'my journey',
      locale: 'hi-IN',
      theme: 'default'
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
    title: 'my journey',
    locale: 'hi-IN',
    theme: 'default'
  })
})

it('creates journey with default locale and theme', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const { data } = await testkit.execute(app, {
    document: gql`
      mutation ($title: String!, $locale: String, $theme: ThemeName) {
        journeyCreate(title: $title, locale: $locale, theme: $theme) {
          id
        }
      }
    `,
    variableValues: {
      title: 'my default locale journey'
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
    title: 'my default locale journey',
    locale: 'en-US',
    theme: 'default'
  })
})

it('publishes journey', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const journey = await db.journey.create({
    data: {
      title: 'my journey',
      published: false,
      locale: 'id-ID',
      theme: 'default'
    }
  })

  await testkit.execute(app, {
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
      db
    }
  })

  const updatedJourney = await db.journey.findUnique({
    where: {
      id: journey.id
    }
  })

  expect(updatedJourney).toEqual({
    id: journey.id,
    published: true,
    title: 'my journey',
    locale: 'id-ID',
    theme: 'default'
  })
})
