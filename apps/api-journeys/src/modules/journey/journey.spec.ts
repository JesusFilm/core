import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { journeyModule } from '.'
import { omit } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import dbMock from '../../../tests/dbMock'
import {
  Journey,
  ThemeName,
  ThemeMode,
  Prisma,
  Block
} from '.prisma/api-journeys-client'
import { DocumentNode, ExecutionResult } from 'graphql'
import { actionModule, blockModule, buttonModule, iconModule } from '..'

describe('JourneyModule', () => {
  let app
  const publishedAt = new Date('2021-11-19T12:34:56.647Z')
  const createdAt = new Date('2021-11-19T12:34:56.647Z')

  beforeEach(() => {
    app = testkit.testModule(journeyModule, {
      schemaBuilder
    })
  })

  async function query(
    document: DocumentNode,
    variableValues?: { [key: string]: unknown },
    contextValue?: { [key: string]: unknown }
  ): Promise<ExecutionResult> {
    return await testkit.execute(app, {
      document,
      variableValues,
      contextValue: {
        ...contextValue,
        db: dbMock
      }
    })
  }

  const publishedJourney: Journey = {
    id: uuidv4(),
    title: 'published',
    locale: 'id-ID',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    description: null,
    primaryImageBlockId: null,
    slug: 'published-slug',
    publishedAt,
    createdAt
  }

  const draftJourney: Journey = {
    id: uuidv4(),
    title: 'draft',
    locale: 'id-ID',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    description: null,
    primaryImageBlockId: null,
    slug: 'draft-slug',
    publishedAt: null,
    createdAt
  }

  const omitProps = ['description', 'primaryImageBlockId']

  describe('Query', () => {
    describe('journeys', () => {
      it('returns all journeys', async () => {
        dbMock.journey.findMany.mockResolvedValue([
          draftJourney,
          publishedJourney
        ])
        const { data } = await query(gql`
          query {
            journeys {
              id
              title
              published
              locale
              themeName
              themeMode
              slug
              createdAt
              publishedAt
              status
            }
          }
        `)

        expect(data?.journeys).toEqual([
          {
            ...omit(draftJourney, omitProps),
            status: 'draft'
          },
          {
            ...omit(publishedJourney, omitProps),
            status: 'published'
          }
        ])
        expect(dbMock.journey.findMany).toBeCalledWith()
      })

      it('returns published journeys', async () => {
        dbMock.journey.findMany.mockResolvedValue([publishedJourney])
        const { data } = await query(
          gql`
            query {
              journeys(status: published) {
                id
                title
                locale
                themeName
                themeMode
                slug
                createdAt
                publishedAt
                status
              }
            }
          `
        )

        expect(data?.journeys).toEqual([
          {
            ...omit(publishedJourney, omitProps),
            status: 'published'
          }
        ])
        expect(dbMock.journey.findMany).toBeCalledWith({
          where: {
            publishedAt: { not: null }
          }
        })
      })

      it('returns draft journeys', async () => {
        dbMock.journey.findMany.mockResolvedValue([draftJourney])
        const { data } = await query(
          gql`
            query {
              journeys(status: draft) {
                id
                title
                locale
                themeName
                themeMode
                slug
                createdAt
                publishedAt
                status
              }
            }
          `
        )

        expect(data?.journeys).toEqual([
          {
            ...omit(draftJourney, omitProps),
            status: 'draft'
          }
        ])
        expect(dbMock.journey.findMany).toBeCalledWith({
          where: {
            publishedAt: null
          }
        })
      })
    })

    describe('journey', () => {
      // TODO test returns journey based on slug and based on id
      it('returns journey', async () => {
        dbMock.journey.findUnique.mockResolvedValue(publishedJourney)

        const { data } = await query(
          gql`
            query ($id: ID!) {
              journey(id: $id) {
                id
                title
                locale
                themeName
                themeMode
                slug
                publishedAt
                createdAt
              }
            }
          `,
          {
            id: publishedJourney.id
          }
        )

        expect(data?.journey).toEqual(omit(publishedJourney, omitProps))
      })
    })
  })

  describe('Mutation', () => {
    describe('journeyCreate', () => {
      it('creates journey', async () => {
        const newJourney: Journey = {
          ...draftJourney,
          title: 'my journey',
          locale: 'hi-IN',
          themeName: ThemeName.base,
          themeMode: ThemeMode.light,
          description: 'test description',
          slug: 'my-journey'
        }
        dbMock.journey.create.mockResolvedValue(newJourney)

        const { data } = await query(
          gql`
            mutation ($input: JourneyCreateInput!) {
              journeyCreate(input: $input) {
                id
                title
                locale
                themeName
                themeMode
                description
                slug
                publishedAt
                createdAt
                status
              }
            }
          `,
          {
            input: {
              title: 'my journey',
              locale: 'hi-IN',
              themeName: ThemeName.base,
              themeMode: ThemeMode.light,
              description: 'test description',
              slug: 'my-journey'
            }
          },
          {
            userId: 'userId'
          }
        )

        expect(data?.journeyCreate).toEqual({
          ...omit(newJourney, 'primaryImageBlockId'),
          status: 'draft'
        })
      })

      it('allocates an owner role to the user', async () => {
        dbMock.journey.create.mockResolvedValue(draftJourney)

        await query(
          gql`
            mutation ($input: JourneyCreateInput!) {
              journeyCreate(input: $input) {
                id
              }
            }
          `,
          {
            input: {
              title: 'my journey',
              slug: 'my-journey'
            }
          },
          {
            userId: 'userId'
          }
        )

        expect(dbMock.userJourney.create).toBeCalledWith({
          data: {
            userId: 'userId',
            journeyId: draftJourney.id,
            role: 'owner'
          }
        })
      })

      it('throws an error on create without authentication', async () => {
        const { errors } = await query(
          gql`
            mutation ($input: JourneyCreateInput!) {
              journeyCreate(input: $input) {
                id
              }
            }
          `,
          {
            input: {
              title: 'my journey',
              slug: 'my-journey'
            }
          }
        )

        expect(errors?.[0].extensions?.code).toEqual('UNAUTHENTICATED')
      })

      it('throws an error if attempting to create a slug that already exists', async () => {
        dbMock.journey.create.mockImplementation(() => {
          throw new Prisma.PrismaClientKnownRequestError(
            'slug already exists',
            'P2002',
            '1.0',
            { target: ['slug'] }
          )
        })

        const { errors } = await query(
          gql`
            mutation ($input: JourneyCreateInput!) {
              journeyCreate(input: $input) {
                id
                slug
              }
            }
          `,
          {
            input: {
              title: 'my journey',
              slug: 'my-journey'
            }
          },
          {
            userId: 'userId'
          }
        )
        expect(errors?.[0].extensions?.code).toEqual('BAD_USER_INPUT')
      })
    })

    describe('journeyUpdate', () => {
      it('updates journey', async () => {
        const updatedJourney: Journey = {
          ...publishedJourney,
          title: 'my journey',
          locale: 'en-US',
          primaryImageBlockId: null,
          slug: 'my-journey'
        }
        dbMock.journey.update.mockResolvedValue(updatedJourney)

        dbMock.userJourney.findUnique.mockResolvedValue({
          userId: 'userId',
          journeyId: updatedJourney.id,
          role: 'owner'
        })

        const { data } = await query(
          gql`
            mutation ($input: JourneyUpdateInput!) {
              journeyUpdate(input: $input) {
                id
                title
                locale
                themeName
                themeMode
                description
                slug
                publishedAt
                createdAt
              }
            }
          `,
          {
            input: {
              id: publishedJourney.id,
              title: 'my journey',
              primaryImageBlockId: 'primaryImageBlockId',
              slug: 'my-journey'
            }
          },
          {
            userId: 'userId'
          }
        )

        expect(data?.journeyUpdate).toEqual({
          id: publishedJourney.id,
          title: 'my journey',
          locale: 'en-US',
          themeName: ThemeName.base,
          themeMode: ThemeMode.light,
          description: null,
          slug: 'my-journey',
          publishedAt,
          createdAt
        })
      })

      it('throws an error on update without authentication', async () => {
        const { errors } = await query(
          gql`
            mutation ($input: JourneyUpdateInput!) {
              journeyUpdate(input: $input) {
                id
              }
            }
          `,
          {
            input: {
              title: 'my journey',
              id: journeyModule.id
            }
          }
        )
        expect(errors?.[0].extensions?.code).toEqual('UNAUTHENTICATED')
      })

      it('throws an error if attempting to update a slug that already exists', async () => {
        dbMock.journey.update.mockImplementation(() => {
          throw new Prisma.PrismaClientKnownRequestError(
            'slug already exists',
            'P2002',
            '1.0',
            { target: ['slug'] }
          )
        })

        dbMock.userJourney.findUnique.mockResolvedValue({
          userId: 'userId',
          journeyId: 'journeyId',
          role: 'owner'
        })

        const { errors } = await query(
          gql`
            mutation ($input: JourneyUpdateInput!) {
              journeyUpdate(input: $input) {
                id
                slug
              }
            }
          `,
          {
            input: {
              title: 'my journey',
              slug: 'my-journey',
              id: journeyModule.id
            }
          },
          {
            userId: 'userId'
          }
        )
        expect(errors?.[0].extensions?.code).toEqual('BAD_USER_INPUT')
      })
    })

    describe('journeyPublish', () => {
      beforeEach(() => {
        jest.useFakeTimers('modern')
        jest.setSystemTime(new Date('2021-11-19T12:34:56.647Z'))
      })

      afterEach(() => {
        jest.useRealTimers()
      })
      it('publishes journey', async () => {
        dbMock.journey.update.mockResolvedValue(publishedJourney)

        dbMock.userJourney.findUnique.mockResolvedValue({
          userId: 'userId',
          journeyId: 'journeyId',
          role: 'owner'
        })

        const { data } = await query(
          gql`
            mutation ($id: ID!) {
              journeyPublish(id: $id) {
                id
                title
                locale
                themeName
                themeMode
                slug
                publishedAt
                createdAt
                status
              }
            }
          `,
          {
            id: publishedJourney.id
          },
          {
            userId: 'userId'
          }
        )

        expect(data?.journeyPublish).toEqual({
          ...omit(publishedJourney, ['description', 'primaryImageBlockId']),
          status: 'published'
        })
        expect(dbMock.journey.update).toBeCalledWith({
          where: { id: publishedJourney.id },
          data: {
            publishedAt: new Date()
          }
        })
      })

      it('throws an error on publish without authentication', async () => {
        const { errors } = await query(
          gql`
            mutation ($id: ID!) {
              journeyPublish(id: $id) {
                id
              }
            }
          `,
          {
            id: journeyModule.id
          }
        )

        expect(errors?.[0].extensions?.code).toEqual('UNAUTHENTICATED')
      })
    })
  })

  describe('NavigateToJourneyAction', () => {
    beforeEach(() => {
      app = testkit.testModule(journeyModule, {
        schemaBuilder,
        modules: [blockModule, buttonModule, actionModule, iconModule]
      })
    })

    describe('journey', () => {
      it('returns journey on NavigateToJourneyAction', async () => {
        const journey = {
          id: uuidv4(),
          title: 'published',
          locale: 'hi-IN',
          themeName: ThemeName.base,
          themeMode: ThemeMode.light,
          description: null,
          primaryImageBlockId: null,
          slug: 'published-slug',
          publishedAt,
          createdAt
        }
        dbMock.journey.findUnique.mockResolvedValue(journey)

        const button: Block = {
          id: uuidv4(),
          journeyId: journey.id,
          blockType: 'ButtonBlock',
          parentBlockId: null,
          parentOrder: 0,
          extraAttrs: {
            label: 'label',
            variant: 'contained',
            color: 'primary',
            size: 'large',
            startIcon: {
              name: 'ArrowForward',
              color: 'secondary',
              size: 'lg'
            },
            endIcon: {
              name: 'LockOpen',
              color: 'action',
              size: 'xl'
            },
            action: {
              gtmEventName: 'gtmEventName',
              journeyId: journey.id
            }
          }
        }
        dbMock.block.findMany.mockResolvedValue([button])

        const { data } = await query(
          gql`
            query ($id: ID!) {
              journey(id: $id) {
                id
                blocks {
                  id
                  ... on ButtonBlock {
                    action {
                      ... on NavigateToJourneyAction {
                        journey {
                          id
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
          {
            id: journey.id
          }
        )

        expect(data?.journey).toEqual({
          id: journey.id,
          blocks: [
            {
              id: button.id,
              action: {
                journey: {
                  id: journey.id
                }
              }
            }
          ]
        })
      })
    })
  })
})
