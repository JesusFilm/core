import { testkit, gql } from 'graphql-modules'
import module from '.'
import { PrismaClient } from '.prisma/api-journeys-client'
import { pick } from 'lodash'

const db = new PrismaClient()

it('returns journeys', async () => {
  const app = testkit.testModule(module)

  const journey = await db.journey.create({
    data: {
      title: 'published',
      published: true
    }
  })

  await db.journey.create({
    data: {
      title: 'unpublished',
      published: true
    }
  })

  const result = await testkit.execute(app, {
    document: gql`
      {
        journeys {
          id
          title
        }
      }
    `,
    contextValue: {
      db
    }
  })

  expect(result.data?.journeys).toEqual([
    pick(journey, ['id', 'title'])
  ])
})
