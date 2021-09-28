import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import module from '.'
import { pick } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import dbMock from '../../../tests/dbMock'
import { Journey, ThemeName, ThemeMode } from '.prisma/api-journeys-client'

it('returns published journeys', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const publishedJourney: Journey = {
    id: uuidv4(),
    title: 'published',
    published: true,
    locale: 'id-ID',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light
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
          themeName
          themeMode
        }
      }
    `,
    contextValue: {
      db: dbMock
    }
  })

  expect(data?.journeys).toEqual([
    pick(publishedJourney, [
      'id',
      'title',
      'published',
      'locale',
      'themeName',
      'themeMode'
    ])
  ])
})

it('returns journey', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const journey = {
    id: uuidv4(),
    title: 'published',
    published: true,
    locale: 'hi-IN',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light
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
          themeName
          themeMode
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
    pick(journey, [
      'id',
      'title',
      'published',
      'locale',
      'themeName',
      'themeMode'
    ])
  )
})

it('creates journey', async () => {
  const app = testkit.testModule(module, { schemaBuilder })

  const journey: Journey = {
    id: uuidv4(),
    title: 'my journey',
    published: false,
    locale: 'hi-IN',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light
  }
  dbMock.journey.create.mockResolvedValue(journey)

  const { data } = await testkit.execute(app, {
    document: gql`
      mutation ($input: JourneyCreateInput!) {
        journeyCreate(input: $input) {
          id
          title
          published
          locale
          themeName
          themeMode
        }
      }
    `,
    variableValues: {
      input: {
        title: 'my journey',
        locale: 'hi-IN',
        themeName: ThemeName.base,
        themeMode: ThemeMode.light
      }
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
    title: 'my journey',
    published: false,
    locale: 'en-US',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light
  }
  dbMock.journey.create.mockResolvedValue(journey)

  const { data } = await testkit.execute(app, {
    document: gql`
      mutation ($input: JourneyCreateInput!) {
        journeyCreate(input: $input) {
          id
          title
          published
          locale
          themeName
          themeMode
        }
      }
    `,
    variableValues: {
      input: {
        title: 'my journey'
      }
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
    themeName: ThemeName.base,
    themeMode: ThemeMode.light
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
          themeName
          themeMode
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
