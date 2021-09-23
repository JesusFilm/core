import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import module from '.'
import { pick } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import dbMock from '../../../tests/dbMock'
import { Journey, ThemeName } from '.prisma/api-journeys-client'

it('returns published journeys', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const publishedJourney: Journey = {
    id: uuidv4(),
    title: 'published',
    published: true,
    locale: 'id-ID',
    theme: ThemeName.default
  }
  dbMock.journey.findMany.mockResolvedValue([publishedJourney])

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
      db: dbMock
    }
  })

  expect(data?.journeys).toEqual([
    pick(publishedJourney, ['id', 'title', 'published', 'locale', 'theme'])
  ])
})

it('returns journey', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const journey = {
    id: uuidv4(),
    title: 'published',
    published: true,
    locale: 'hi-IN',
    theme: ThemeName.default
  }
  dbMock.journey.findUnique.mockResolvedValue(journey)

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
      db: dbMock
    }
  })

  expect(data?.journey).toEqual(
    pick(journey, ['id', 'title', 'published', 'locale', 'theme'])
  )
})

it('creates journey', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const journey: Journey = {
    id: uuidv4(),
    title: 'published',
    published: true,
    locale: 'hi-IN',
    theme: ThemeName.default
  }
  dbMock.journey.create.mockResolvedValue(journey)

  const { data } = await testkit.execute(app, {
    document: gql`
      mutation ($title: String!, $locale: String, $theme: ThemeName) {
        journeyCreate(title: $title, locale: $locale, theme: $theme) {
          id
          title
          published
          locale
          theme
        }
      }
    `,
    variableValues: {
      title: 'my journey',
      locale: 'hi-IN',
      theme: 'default'
    },
    contextValue: {
      db: dbMock
    }
  })

  expect(data?.journeyCreate).toEqual(journey)
})

it('creates journey with default locale and theme', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const journey: Journey = {
    id: uuidv4(),
    title: 'published',
    published: true,
    locale: 'en-US',
    theme: ThemeName.default
  }
  dbMock.journey.create.mockResolvedValue(journey)

  const { data } = await testkit.execute(app, {
    document: gql`
      mutation ($title: String!, $locale: String, $theme: ThemeName) {
        journeyCreate(title: $title, locale: $locale, theme: $theme) {
          id
          title
          published
          locale
          theme
        }
      }
    `,
    variableValues: {
      title: 'my journey'
    },
    contextValue: {
      db: dbMock
    }
  })

  expect(data?.journeyCreate).toEqual(journey)
})

it('publishes journey', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const journey: Journey = {
    id: uuidv4(),
    title: 'my journey',
    published: true,
    locale: 'id-ID',
    theme: ThemeName.default
  }
  dbMock.journey.update.mockResolvedValue(journey)

  const { data } = await testkit.execute(app, {
    document: gql`
      mutation ($id: ID!) {
        journeyPublish(id: $id) {
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
      db: dbMock
    }
  })

  expect(data?.journeyPublish).toEqual(journey)
})
