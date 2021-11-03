import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { journeyModule } from '.'
import { pick } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import dbMock from '../../../tests/dbMock'
import {
  Journey,
  ThemeName,
  ThemeMode,
  Prisma
} from '.prisma/api-journeys-client'

it('returns published journeys', async () => {
  const app = testkit.testModule(journeyModule, { schemaBuilder })

  const publishedJourney: Journey = {
    id: uuidv4(),
    title: 'published',
    published: true,
    locale: 'id-ID',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    description: null,
    primaryImageBlockId: null,
    slug: 'published-slug'
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
          slug
        }
      }
    `,
    contextValue: {
      db: dbMock,
      userId: 'userId'
    }
  })
  expect(data?.journeys).toEqual([
    pick(publishedJourney, [
      'id',
      'title',
      'published',
      'locale',
      'themeName',
      'themeMode',
      'slug'
    ])
  ])
})

it('returns journey', async () => {
  const app = testkit.testModule(journeyModule, { schemaBuilder })

  const journey = {
    id: uuidv4(),
    title: 'published',
    published: true,
    locale: 'hi-IN',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    description: null,
    primaryImageBlockId: null,
    slug: 'published-slug'
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
          slug
        }
      }
    `,
    variableValues: {
      id: journey.id
    },
    contextValue: {
      db: dbMock,
      userId: 'userId'
    }
  })

  expect(data?.journey).toEqual(
    pick(journey, [
      'id',
      'title',
      'published',
      'locale',
      'themeName',
      'themeMode',
      'slug'
    ])
  )
})

it('creates journey', async () => {
  const app = testkit.testModule(journeyModule, { schemaBuilder })

  const journey: Journey = {
    id: uuidv4(),
    title: 'my journey',
    published: false,
    locale: 'hi-IN',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    description: 'test description',
    primaryImageBlockId: null,
    slug: 'my-journey'
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
          description
          slug
        }
      }
    `,
    variableValues: {
      input: {
        title: 'my journey',
        locale: 'hi-IN',
        themeName: ThemeName.base,
        themeMode: ThemeMode.light,
        description: 'test description',
        slug: 'my-journey'
      }
    },
    contextValue: {
      db: dbMock,
      userId: 'userId'
    }
  })

  expect(data?.journeyCreate).toEqual({
    id: journey.id,
    title: 'my journey',
    published: false,
    locale: 'hi-IN',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    description: 'test description',
    slug: 'my-journey'
  })
})

it('creates journey with default locale and theme', async () => {
  const app = testkit.testModule(journeyModule, { schemaBuilder })

  const journey: Journey = {
    id: uuidv4(),
    title: 'my journey',
    published: false,
    locale: 'en-US',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    description: null,
    primaryImageBlockId: null,
    slug: 'my-journey'
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
          description
          slug
        }
      }
    `,
    variableValues: {
      input: {
        title: 'my journey',
        slug: 'my-journey'
      }
    },
    contextValue: {
      db: dbMock,
      userId: 'userId'
    }
  })

  expect(data?.journeyCreate).toEqual({
    id: journey.id,
    title: 'my journey',
    published: false,
    locale: 'en-US',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    description: null,
    slug: 'my-journey'
  })
})

it('updates journey', async () => {
  const app = testkit.testModule(journeyModule, { schemaBuilder })

  const journey: Journey = {
    id: uuidv4(),
    title: 'my journey',
    published: false,
    locale: 'en-US',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    description: null,
    primaryImageBlockId: null,
    slug: 'my-journey'
  }
  dbMock.journey.update.mockResolvedValue(journey)

  const { data } = await testkit.execute(app, {
    document: gql`
      mutation ($input: JourneyUpdateInput!) {
        journeyUpdate(input: $input) {
          id
          title
          published
          locale
          themeName
          themeMode
          description
          primaryImageBlockId
          slug
        }
      }
    `,
    variableValues: {
      input: {
        id: journey.id,
        title: 'my journey',
        primaryImageBlockId: '1',
        slug: 'my-journey'
      }
    },
    contextValue: {
      db: dbMock,
      userId: 'userId'
    }
  })

  expect(data?.journeyUpdate).toEqual({
    id: journey.id,
    title: 'my journey',
    published: false,
    locale: 'en-US',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    description: null,
    slug: 'my-journey'
    // primaryImageBlockId: '1'
  })
})

it('publishes journey', async () => {
  const app = testkit.testModule(journeyModule, { schemaBuilder })

  const journey: Journey = {
    id: uuidv4(),
    title: 'my journey',
    published: true,
    locale: 'id-ID',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    description: null,
    primaryImageBlockId: null,
    slug: 'my-journey'
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
          description
          primaryImageBlockId
          slug
        }
      }
    `,
    variableValues: {
      id: journey.id
    },
    contextValue: {
      db: dbMock,
      userId: 'userId'
    }
  })

  expect(data?.journeyPublish).toEqual({
    id: journey.id,
    title: 'my journey',
    published: true,
    locale: 'id-ID',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    description: null,
    slug: 'my-journey'
  })
})

it('throws an error on create without authentication', async () => {
  const app = testkit.testModule(journeyModule, { schemaBuilder })

  const { errors } = await testkit.execute(app, {
    document: gql`
      mutation ($input: JourneyCreateInput!) {
        journeyCreate(input: $input) {
          id
        }
      }
    `,
    variableValues: {
      input: {
        title: 'my journey',
        slug: 'my-journey'
      }
    },
    contextValue: {
      db: dbMock
    }
  })

  expect(errors?.[0].extensions?.code).toEqual('UNAUTHENTICATED')
})

it('throws an error on update without authentication', async () => {
  const app = testkit.testModule(journeyModule, { schemaBuilder })

  const { errors } = await testkit.execute(app, {
    document: gql`
      mutation ($input: JourneyUpdateInput!) {
        journeyUpdate(input: $input) {
          id
        }
      }
    `,
    variableValues: {
      input: {
        title: 'my journey',
        id: journeyModule.id
      }
    },
    contextValue: {
      db: dbMock
    }
  })
  console.log(errors)
  expect(errors?.[0].extensions?.code).toEqual('UNAUTHENTICATED')
})

it('throws an error on publish without authentication', async () => {
  const app = testkit.testModule(journeyModule, { schemaBuilder })

  const { errors } = await testkit.execute(app, {
    document: gql`
      mutation ($id: ID!) {
        journeyPublish(id: $id) {
          id
        }
      }
    `,
    variableValues: {
      id: journeyModule.id
    },
    contextValue: {
      db: dbMock
    }
  })

  expect(errors?.[0].extensions?.code).toEqual('UNAUTHENTICATED')
})

it('throws an error if attempting to create a slug that already exists', async () => {
  const app = testkit.testModule(journeyModule, { schemaBuilder })

  dbMock.journey.create.mockImplementation(() => {
    throw new Prisma.PrismaClientKnownRequestError(
      'slug already exists',
      'P2002',
      '1.0',
      { target: ['slug'] }
    )
  })

  const { errors } = await testkit.execute(app, {
    document: gql`
      mutation ($input: JourneyCreateInput!) {
        journeyCreate(input: $input) {
          id
          slug
        }
      }
    `,
    variableValues: {
      input: {
        title: 'my journey',
        slug: 'my-journey'
      }
    },
    contextValue: {
      db: dbMock,
      userId: 'userId'
    }
  })
  expect(errors?.[0].message).toEqual('slug already exists')
})
it('throws an error if attempting to update a slug that already exists', async () => {
  const app = testkit.testModule(journeyModule, { schemaBuilder })

  dbMock.journey.update.mockImplementation(() => {
    throw new Prisma.PrismaClientKnownRequestError(
      'slug already exists',
      'P2002',
      '1.0',
      { target: ['slug'] }
    )
  })

  const { errors } = await testkit.execute(app, {
    document: gql`
      mutation ($input: JourneyUpdateInput!) {
        journeyUpdate(input: $input) {
          id
          slug
        }
      }
    `,
    variableValues: {
      input: {
        title: 'my journey',
        slug: 'my-journey',
        id: journeyModule.id
      }
    },
    contextValue: {
      db: dbMock,
      userId: 'userId'
    }
  })
  expect(errors?.[0].message).toEqual('slug already exists')
})
