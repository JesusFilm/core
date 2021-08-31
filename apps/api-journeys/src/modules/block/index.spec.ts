import { testkit, gql } from 'graphql-modules'
import module from '.'
import db from '../../lib/db'
import { Prisma } from '.prisma/api-journeys-client'

it('returns blocks', async () => {
  const app = testkit.testModule(module)

  const journey = await db.journey.create({
    data: {
      title: 'published',
      published: true
    }
  })
  const block1 = await db.block.create({
    data: { journeyId: journey.id, blockType: 'StepBlock' }
  })
  const block2 = await db.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioQuestionBlock',
      parentBlockId: block1.id
    }
  })

  const otherJourney = await db.journey.create({
    data: {
      title: 'not "that" journey',
      published: true
    }
  })
  await db.block.create({ data: { journeyId: otherJourney.id, blockType: 'StepBlock' } })

  const { data } = await testkit.execute(app, {
    document: gql`
      query {
        journey(id: $id) {
          blocks {
            id
            __typename
            parentBlockId
            ... on VideoBlock {
              src
              title
              provider
            }
            ... on RadioQuestionBlock {
              label
              description
              variant
            }
            ... on RadioOptionBlock {
              label
              image
            }
          }
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

  console.log(data)
  expect(data?.journey.blocks).toEqual([
    { id: block1.id, __typename: 'StepBlock' },
    {
      id: block2.id,
      __typename: 'RadioQuestionBlock',
      ...(block2.extraAttrs as Prisma.JsonObject)
    }
  ])
})
