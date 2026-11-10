import { createRequire } from 'node:module'

import { GraphQLInterfaceType, parse } from 'graphql'
import { vi } from 'vitest'

import {
  Block,
  Event,
  Journey,
  Prisma,
  Visitor
} from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { schema } from '../../index'

import { createCaptureEvent } from './captureService'

vi.mock('@core/yoga/firebaseClient', async () => ({
  ...(await vi.importActual('@core/yoga/firebaseClient')),
  getUserFromPayload: vi.fn()
}))

const expectedCaptureEvents = {
  ChristDecisionCaptureEvent: {
    tag: 'decisionForChrist',
    identity: 'christDecisionCapture'
  },
  GospelStartCaptureEvent: {
    tag: 'gospelPresentationStart',
    identity: 'gospelStartCapture'
  },
  GospelCompleteCaptureEvent: {
    tag: 'gospelPresentationComplete',
    identity: 'gospelCompleteCapture'
  },
  PrayerRequestCaptureEvent: {
    tag: 'prayerRequest',
    identity: 'prayerRequestCapture'
  },
  RsvpCaptureEvent: { tag: 'rsvp', identity: 'rsvpCapture' },
  SpecialVideoStartCaptureEvent: {
    tag: 'specialVideoStart',
    identity: 'specialVideoStartCapture'
  },
  SpecialVideoCompleteCaptureEvent: {
    tag: 'specialVideoComplete',
    identity: 'specialVideoCompleteCapture'
  },
  Custom1CaptureEvent: { tag: 'custom1', identity: 'custom1Capture' },
  Custom2CaptureEvent: { tag: 'custom2', identity: 'custom2Capture' },
  Custom3CaptureEvent: { tag: 'custom3', identity: 'custom3Capture' }
} as const

const occurrenceId = '9ef9ef6c-fcd6-4232-a923-03309b58ae32'
const input = {
  id: occurrenceId,
  blockId: 'button',
  stepId: 'step',
  trigger: 'buttonClick' as const
}
const visitor = {
  id: 'visitor',
  userId: 'anonymous-user',
  teamId: 'team'
} as Visitor

function block(overrides: Partial<Block> = {}): Block {
  return {
    id: 'button',
    typename: 'ButtonBlock',
    journeyId: 'journey',
    parentBlockId: 'card',
    deletedAt: null,
    eventLabel: 'decisionForChrist',
    endEventLabel: null,
    ...overrides
  } as Block
}

function journey(overrides: Partial<Journey> = {}): Journey {
  return {
    id: 'journey',
    teamId: 'team',
    deletedAt: null,
    template: false,
    fromTemplateId: 'template',
    ...overrides
  } as Journey
}

function savedEvent(
  overrides: Partial<Event> = {}
): Event & { visitor: Visitor } {
  return {
    ...input,
    typename: 'ChristDecisionCaptureEvent',
    journeyId: 'journey',
    visitorId: 'visitor',
    createdAt: new Date('2026-11-10T00:00:00Z'),
    label: null,
    value: null,
    captureIdentity: 'christDecisionCapture',
    captureTag: 'decisionForChrist',
    captureTrigger: 'buttonClick',
    templateFamilyId: 'template',
    ...overrides,
    visitor
  } as Event & { visitor: Visitor }
}

function mockBlocks(blocks: Block[]) {
  prismaMock.block.findFirst.mockImplementation((args) => {
    const where = args?.where
    const found =
      blocks.find(
        (candidate) =>
          candidate.id === where?.id &&
          candidate.deletedAt === null &&
          (where?.journeyId == null ||
            candidate.journeyId === where.journeyId) &&
          (where?.typename == null || candidate.typename === where.typename)
      ) ?? null
    return Promise.resolve(found) as unknown as ReturnType<
      typeof prismaMock.block.findFirst
    >
  })
}

const card = block({ id: 'card', typename: 'CardBlock', parentBlockId: 'step' })
const step = block({ id: 'step', typename: 'StepBlock', parentBlockId: null })

describe('capture events', () => {
  beforeEach(() => {
    vi.mocked(getUserFromPayload).mockReturnValue({
      id: visitor.userId,
      firstName: 'Anonymous',
      lastName: 'Visitor',
      email: undefined,
      emailVerified: false,
      imageUrl: null
    })
    prismaMock.event.findUnique.mockResolvedValue(null)
    mockBlocks([block(), card, step])
    prismaMock.journey.findFirst.mockResolvedValue(journey())
    prismaMock.$queryRaw
      .mockResolvedValueOnce([visitor])
      .mockResolvedValueOnce([
        { id: 'journey-visitor', journeyId: 'journey', visitorId: visitor.id }
      ])
    prismaMock.event.create.mockResolvedValue(savedEvent())
    prismaMock.event.findMany.mockResolvedValue([savedEvent()])
    prismaMock.event.findUniqueOrThrow.mockResolvedValue(savedEvent())
  })

  describe('capture API contract', () => {
    const client = getClient()

    it.each(Object.entries(expectedCaptureEvents))(
      'exposes %s and persists its exact Plausible identity',
      async (typename, mapping) => {
        const operation = `${typename[0].toLowerCase()}${typename.slice(1)}Create`
        const event = savedEvent({
          typename,
          captureIdentity: mapping.identity,
          captureTag: mapping.tag
        })
        mockBlocks([block({ eventLabel: mapping.tag }), card, step])
        prismaMock.event.create.mockResolvedValue(event)
        prismaMock.event.findMany.mockResolvedValue([event])
        prismaMock.event.findUniqueOrThrow.mockResolvedValue(event)

        const result = await client({
          document: parse(`
          mutation Capture($input: ${typename}CreateInput!) {
            ${operation}(input: $input) {
              id __typename journeyId blockId stepId trigger
              captureIdentity captureTag templateFamilyId label value
            }
          }
        `),
          variables: { input }
        })

        expect(result).toEqual({
          data: {
            [operation]: {
              id: occurrenceId,
              __typename: typename,
              journeyId: 'journey',
              blockId: 'button',
              stepId: 'step',
              trigger: 'buttonClick',
              captureIdentity: mapping.identity,
              captureTag: mapping.tag,
              templateFamilyId: 'template',
              label: null,
              value: null
            }
          }
        })
        expect(prismaMock.event.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            id: occurrenceId,
            typename,
            blockId: 'button',
            stepId: 'step',
            journey: { connect: { id: 'journey' } },
            visitor: { connect: { id: visitor.id } },
            captureIdentity: mapping.identity,
            captureTag: mapping.tag,
            captureTrigger: 'buttonClick',
            templateFamilyId: 'template'
          })
        })
        const rawArguments = prismaMock.$queryRaw.mock.calls.flat()
        expect(rawArguments).toContain(visitor.userId)
        expect(rawArguments).toContain(visitor.teamId)
        expect(prismaMock.visitor.update).not.toHaveBeenCalled()
        expect(prismaMock.journeyVisitor.update).not.toHaveBeenCalled()
      }
    )

    it('rejects callers without an authenticated anonymous or registered identity', async () => {
      vi.mocked(getUserFromPayload).mockReturnValue(null)
      const result = await client({
        document: parse(`mutation {
        christDecisionCaptureEventCreate(input: {
          id: "${occurrenceId}", blockId: "button", stepId: "step", trigger: buttonClick
        }) { id }
      }`)
      })
      expect(result).toHaveProperty('errors')
      expect(prismaMock.event.create).not.toHaveBeenCalled()
    })

    it('resolves stored captures through the actual Event GraphQL interface', async () => {
      const events = Object.entries(expectedCaptureEvents).map(
        ([typename, mapping]) =>
          savedEvent({
            typename,
            captureIdentity: mapping.identity,
            captureTag: mapping.tag
          })
      )
      // Pothos loads GraphQL through CommonJS; use that instance for its types.
      const {
        GraphQLList,
        GraphQLObjectType,
        GraphQLSchema,
        graphql: executeGraphql
      } = createRequire(import.meta.url)('graphql') as typeof import('graphql')
      const eventInterface = schema.getType('Event') as GraphQLInterfaceType
      const readSchema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'CaptureReadQuery',
          fields: {
            events: {
              type: new GraphQLList(eventInterface),
              resolve: () => events
            }
          }
        }),
        types: schema.getPossibleTypes(eventInterface)
      })
      const result = await executeGraphql({
        schema: readSchema,
        source: '{ events { id __typename journeyId } }',
        contextValue: {}
      })
      expect(result.errors).toBeUndefined()
      expect(result.data?.events).toEqual(
        events.map(({ id, typename, journeyId }) => ({
          id,
          __typename: typename,
          journeyId
        }))
      )
    })
  })

  describe('capture context validation', () => {
    it.each([
      ['CardBlock', 'stepView', 'card'],
      ['RadioOptionBlock', 'radioQuestionSubmit', 'option'],
      ['VideoBlock', 'videoStart', 'video']
    ] as const)(
      'accepts the actual tagged %s for %s',
      async (typename, trigger, blockId) => {
        const target = block({
          id: blockId,
          typename,
          parentBlockId:
            typename === 'CardBlock'
              ? 'step'
              : typename === 'RadioOptionBlock'
                ? 'question'
                : 'card'
        })
        mockBlocks([
          target,
          block({ id: 'question', typename: 'RadioQuestionBlock' }),
          card,
          step
        ])
        await createCaptureEvent(visitor.userId, 'ChristDecisionCaptureEvent', {
          ...input,
          blockId,
          trigger
        })
        expect(prismaMock.event.create).toHaveBeenCalledWith({
          data: expect.objectContaining({ blockId, captureTrigger: trigger })
        })
      }
    )

    it('rejects a Card nested below another container instead of directly in its Step', async () => {
      mockBlocks([
        block({
          id: 'nested-card',
          typename: 'CardBlock',
          parentBlockId: 'card'
        }),
        card,
        step
      ])
      await expect(
        createCaptureEvent(visitor.userId, 'ChristDecisionCaptureEvent', {
          ...input,
          blockId: 'nested-card',
          trigger: 'stepView'
        })
      ).rejects.toThrow()
      expect(prismaMock.event.create).not.toHaveBeenCalled()
    })

    it('rejects a RadioOption whose immediate parent is not a RadioQuestion', async () => {
      mockBlocks([
        block({
          id: 'option',
          typename: 'RadioOptionBlock',
          parentBlockId: 'card'
        }),
        card,
        step
      ])
      await expect(
        createCaptureEvent(visitor.userId, 'ChristDecisionCaptureEvent', {
          ...input,
          blockId: 'option',
          trigger: 'radioQuestionSubmit'
        })
      ).rejects.toThrow()
      expect(prismaMock.event.create).not.toHaveBeenCalled()
    })

    it('uses the selected RadioOption tag rather than its RadioQuestion tag', async () => {
      mockBlocks([
        block({
          id: 'option',
          typename: 'RadioOptionBlock',
          parentBlockId: 'question',
          eventLabel: 'custom1'
        }),
        block({
          id: 'question',
          typename: 'RadioQuestionBlock',
          eventLabel: 'decisionForChrist'
        }),
        card,
        step
      ])
      await createCaptureEvent(visitor.userId, 'Custom1CaptureEvent', {
        ...input,
        blockId: 'option',
        trigger: 'radioQuestionSubmit'
      })
      expect(prismaMock.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          captureTag: 'custom1',
          blockId: 'option'
        })
      })
    })

    it('uses the completion tag separately from the video start tag', async () => {
      mockBlocks([
        block({
          typename: 'VideoBlock',
          eventLabel: 'specialVideoStart',
          endEventLabel: 'specialVideoComplete'
        }),
        card,
        step
      ])
      await createCaptureEvent(
        visitor.userId,
        'SpecialVideoCompleteCaptureEvent',
        {
          ...input,
          trigger: 'videoComplete'
        }
      )
      expect(prismaMock.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          captureTag: 'specialVideoComplete',
          captureTrigger: 'videoComplete'
        })
      })
      await expect(
        createCaptureEvent(visitor.userId, 'SpecialVideoStartCaptureEvent', {
          ...input,
          trigger: 'videoComplete'
        })
      ).rejects.toThrow()
    })

    it.each(['custom1', 'share', 'inviteFriend', null] as const)(
      'rejects a stale capture request when the played block tag is %s',
      async (eventLabel) => {
        mockBlocks([block({ eventLabel }), card, step])
        await expect(
          createCaptureEvent(
            visitor.userId,
            'ChristDecisionCaptureEvent',
            input
          )
        ).rejects.toThrow()
        expect(prismaMock.event.create).not.toHaveBeenCalled()
        expect(prismaMock.$queryRaw).not.toHaveBeenCalled()
      }
    )

    it.each([
      'StepBlock',
      'RadioQuestionBlock',
      'TextResponseBlock',
      'SignUpBlock',
      'ImageBlock'
    ])('rejects unsupported capture block %s', async (typename) => {
      mockBlocks([block({ typename }), card, step])
      await expect(
        createCaptureEvent(visitor.userId, 'ChristDecisionCaptureEvent', input)
      ).rejects.toThrow()
      expect(prismaMock.event.create).not.toHaveBeenCalled()
    })

    it('rejects a video trigger for a button', async () => {
      await expect(
        createCaptureEvent(visitor.userId, 'ChristDecisionCaptureEvent', {
          ...input,
          trigger: 'videoStart'
        })
      ).rejects.toThrow()
    })

    it.each([
      ['deleted tagged block', [block({ deletedAt: new Date() }), card, step]],
      ['deleted ancestor', [block(), { ...card, deletedAt: new Date() }, step]],
      ['deleted step', [block(), card, { ...step, deletedAt: new Date() }]],
      [
        'step in another journey',
        [block(), card, { ...step, journeyId: 'other' }]
      ],
      [
        'unrelated step',
        [block(), { ...card, parentBlockId: 'other-step' }, step]
      ],
      [
        'non-step as stepId',
        [block(), card, { ...step, typename: 'CardBlock' }]
      ],
      ['cyclic ancestry', [block(), { ...card, parentBlockId: 'button' }, step]]
    ] satisfies [string, Block[]][])(
      'rejects %s',
      async (_description, blocks) => {
        mockBlocks(blocks)
        await expect(
          createCaptureEvent(
            visitor.userId,
            'ChristDecisionCaptureEvent',
            input
          )
        ).rejects.toThrow()
        expect(prismaMock.event.create).not.toHaveBeenCalled()
      }
    )

    it('rejects deleted or missing journeys', async () => {
      prismaMock.journey.findFirst.mockResolvedValue(null)
      await expect(
        createCaptureEvent(visitor.userId, 'ChristDecisionCaptureEvent', input)
      ).rejects.toThrow()
      expect(prismaMock.journey.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null })
        })
      )
      expect(prismaMock.event.create).not.toHaveBeenCalled()
    })

    it('requires an occurrence UUID', async () => {
      await expect(
        createCaptureEvent(visitor.userId, 'ChristDecisionCaptureEvent', {
          ...input,
          id: 'not-a-uuid'
        })
      ).rejects.toThrow()
      expect(prismaMock.event.create).not.toHaveBeenCalled()
    })
  })

  describe('capture history and occurrence identity', () => {
    it.each([
      ['standalone', { template: false, fromTemplateId: null }, null],
      ['template', { template: true, fromTemplateId: null }, 'journey'],
      [
        'copy',
        { template: false, fromTemplateId: 'original-template' },
        'original-template'
      ],
      [
        'copy of a copy',
        { template: false, fromTemplateId: 'copied-template' },
        'copied-template'
      ],
      [
        'promoted template',
        { template: true, fromTemplateId: 'original-template' },
        'journey'
      ]
    ] as const)(
      'snapshots the viewer family rule for %s',
      async (_description, attributes, familyId) => {
        prismaMock.journey.findFirst.mockResolvedValue(journey(attributes))
        await createCaptureEvent(
          visitor.userId,
          'ChristDecisionCaptureEvent',
          input
        )
        expect(prismaMock.event.create).toHaveBeenCalledWith({
          data: expect.objectContaining({ templateFamilyId: familyId })
        })
        expect(prismaMock.journey.findFirst).toHaveBeenCalledTimes(1)
      }
    )

    it('returns a saved occurrence unchanged after family and played-tag edits', async () => {
      const existing = savedEvent()
      prismaMock.event.findUnique.mockResolvedValue(existing)
      prismaMock.journey.findFirst.mockResolvedValue(
        journey({ template: true })
      )
      mockBlocks([block({ eventLabel: 'custom2' }), card, step])
      expect(
        await createCaptureEvent(
          visitor.userId,
          'ChristDecisionCaptureEvent',
          input
        )
      ).toEqual(existing)
      expect(prismaMock.event.create).not.toHaveBeenCalled()
      expect(prismaMock.event.update).not.toHaveBeenCalled()
      expect(prismaMock.block.findFirst).not.toHaveBeenCalled()
      expect(prismaMock.journey.findFirst).not.toHaveBeenCalled()
    })

    it.each([
      ['different type', { typename: 'Custom1CaptureEvent' }],
      ['different block', { blockId: 'other' }],
      ['different step', { stepId: 'other' }],
      ['different trigger', { captureTrigger: 'videoStart' }]
    ] satisfies [string, Partial<Event>][])(
      'rejects an occurrence reused for a %s',
      async (_description, attributes) => {
        prismaMock.event.findUnique.mockResolvedValue(savedEvent(attributes))
        await expect(
          createCaptureEvent(
            visitor.userId,
            'ChristDecisionCaptureEvent',
            input
          )
        ).rejects.toThrow()
        expect(prismaMock.event.create).not.toHaveBeenCalled()
        expect(prismaMock.event.update).not.toHaveBeenCalled()
      }
    )

    it('rejects another visitor reusing an occurrence UUID', async () => {
      const existing = {
        ...savedEvent(),
        visitor: { ...visitor, userId: 'other-user' }
      }
      prismaMock.event.findUnique.mockResolvedValue(existing)
      await expect(
        createCaptureEvent(visitor.userId, 'ChristDecisionCaptureEvent', input)
      ).rejects.toThrow()
      expect(prismaMock.event.create).not.toHaveBeenCalled()
    })

    it('preserves the winning occurrence on concurrent duplicate delivery', async () => {
      prismaMock.event.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(savedEvent())
      prismaMock.event.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: 'test'
        })
      )
      expect(
        await createCaptureEvent(
          visitor.userId,
          'ChristDecisionCaptureEvent',
          input
        )
      ).toEqual(savedEvent())
      expect(prismaMock.event.update).not.toHaveBeenCalled()
    })

    it('keeps distinct occurrence UUIDs for the same visitor and tag', async () => {
      prismaMock.$queryRaw
        .mockResolvedValueOnce([visitor])
        .mockResolvedValueOnce([{ id: 'journey-visitor' }])
      await createCaptureEvent(
        visitor.userId,
        'ChristDecisionCaptureEvent',
        input
      )
      await createCaptureEvent(visitor.userId, 'ChristDecisionCaptureEvent', {
        ...input,
        id: '1d94cd32-3f87-47b1-927f-fd5dbd90a8bf'
      })
      expect(prismaMock.event.create).toHaveBeenCalledTimes(2)
      expect(prismaMock.event.update).not.toHaveBeenCalled()
    })
  })
})
