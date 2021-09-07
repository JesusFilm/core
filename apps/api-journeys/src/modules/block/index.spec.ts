import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import module from '.'
import db from '../../lib/db'
import Journey from '../journey'

beforeEach(async () => {
  await db.block.deleteMany()
  await db.journey.deleteMany()
})

afterEach(async () => {
  await db.block.deleteMany()
  await db.journey.deleteMany()
})

it('returns blocks', async () => {
  const app = testkit.testModule(module, {
    schemaBuilder,
    modules: [Journey]
  })

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
      parentBlockId: block1.id,
      extraAttrs: {
        label: 'label',
        description: 'description'
      }
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
      query($id: ID!) {
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

  expect(data?.journey.blocks).toEqual([
    {
      id: block1.id,
      __typename: 'StepBlock',
      parentBlockId: null
    },
    {
      id: block2.id,
      __typename: 'RadioQuestionBlock',
      description: 'description',
      label: 'label',
      parentBlockId: block1.id,
      variant: null
    }
  ])
})
