import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import {
  ButtonAction,
  MessagePlatform,
  VideoBlockSource
} from '.prisma/api-journeys-modern-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

// Define Event interface
const EventInterface = builder.prismaInterface('Event', {
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true })
  })
})

// Define enums
const ButtonActionEnum = builder.enumType('ButtonAction', {
  values: Object.values(ButtonAction)
})

const MessagePlatformEnum = builder.enumType('MessagePlatform', {
  values: Object.values(MessagePlatform)
})

const VideoBlockSourceEnum = builder.enumType('VideoBlockSource', {
  values: Object.values(VideoBlockSource)
})

// Define Event with Pothos built-in union discrimination
// const EventRef = builder.prismaObject('Event', {
//   interfaces: [EventInterface],
//   fields: (t) => ({
//     id: t.exposeID('id'),
//     typename: t.exposeString('typename'),
//     journeyId: t.exposeString('journeyId', { nullable: true }),
//     blockId: t.exposeString('blockId', { nullable: true }),
//     stepId: t.exposeString('stepId', { nullable: true }),
//     createdAt: t.expose('createdAt', { type: 'DateTime' }),
//     label: t.exposeString('label', { nullable: true }),
//     value: t.exposeString('value', { nullable: true }),
//     visitorId: t.exposeString('visitorId'),
//     action: t.expose('action', { type: ButtonActionEnum, nullable: true }),
//     actionValue: t.exposeString('actionValue', { nullable: true }),
//     messagePlatform: t.expose('messagePlatform', {
//       type: MessagePlatformEnum,
//       nullable: true
//     }),
//     languageId: t.exposeString('languageId', { nullable: true }),
//     radioOptionBlockId: t.exposeString('radioOptionBlockId', {
//       nullable: true
//     }),
//     email: t.exposeString('email', { nullable: true }),
//     nextStepId: t.exposeString('nextStepId', { nullable: true }),
//     previousStepId: t.exposeString('previousStepId', { nullable: true }),
//     position: t.exposeFloat('position', { nullable: true }),
//     source: t.expose('source', { type: VideoBlockSourceEnum, nullable: true }),
//     progress: t.exposeInt('progress', { nullable: true }),
//     userId: t.exposeString('userId', { nullable: true }),
//     updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
//     // Relations
//     journey: t.relation('journey', { nullable: true }),
//     visitor: t.relation('visitor'),
//     // Language field for federation
//     language: t.field({
//       type: 'Json',
//       nullable: true,
//       resolve: async (event) => {
//         if (!event.languageId) return null
//         return { id: event.languageId }
//       }
//     })
//   })
// })

// Specific Event Types implementing the Event interface
const ButtonClickEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'ButtonClickEvent',
  isTypeOf: (obj: any) => obj.typename === 'ButtonClickEvent',
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true }),
    action: t.expose('action', { type: ButtonActionEnum, nullable: true }),
    actionValue: t.exposeString('actionValue', { nullable: true })
  })
})

const ChatOpenEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'ChatOpenEvent',
  isTypeOf: (obj: any) => obj.typename === 'ChatOpenEvent',
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true }),
    messagePlatform: t.expose('messagePlatform', {
      type: MessagePlatformEnum,
      nullable: true
    })
  })
})

const JourneyViewEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'JourneyViewEvent',
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true }),
    language: t.field({
      type: 'Json',
      nullable: true,
      resolve: async (event) => {
        if (!event.languageId) return null
        return { id: event.languageId }
      }
    })
  })
})

const RadioQuestionSubmissionEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'RadioQuestionSubmissionEvent',
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true })
  })
})

const SignUpSubmissionEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'SignUpSubmissionEvent',
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true }),
    email: t.exposeString('email', { nullable: true })
  })
})

const StepViewEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'StepViewEvent',
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true })
  })
})

const StepNextEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'StepNextEvent',
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true })
  })
})

const StepPreviousEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'StepPreviousEvent',
  isTypeOf: (obj: any) => obj.typename === 'StepPreviousEvent',
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true })
  })
})

const TextResponseSubmissionEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'TextResponseSubmissionEvent',
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true }),
    blockId: t.exposeString('blockId', { nullable: true })
  })
})

// Video Event Types
const VideoStartEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'VideoStartEvent',
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true }),
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSourceEnum, nullable: true })
  })
})

const VideoPlayEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'VideoPlayEvent',
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true }),
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSourceEnum, nullable: true })
  })
})

const VideoPauseEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'VideoPauseEvent',
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true }),
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSourceEnum, nullable: true })
  })
})

const VideoCompleteEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'VideoCompleteEvent',
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true }),
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSourceEnum, nullable: true })
  })
})

const VideoExpandEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'VideoExpandEvent',
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true }),
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSourceEnum, nullable: true })
  })
})

const VideoCollapseEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'VideoCollapseEvent',
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true }),
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSourceEnum, nullable: true })
  })
})

const VideoProgressEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'VideoProgressEvent',
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true }),
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSourceEnum, nullable: true }),
    progress: t.exposeInt('progress', { nullable: true })
  })
})

// Input Types
const ButtonClickEventCreateInput = builder.inputType(
  'ButtonClickEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      label: t.string({ required: false }),
      value: t.string({ required: false }),
      action: t.field({ type: ButtonActionEnum, required: false }),
      actionValue: t.string({ required: false })
    })
  }
)

const ChatOpenEventCreateInput = builder.inputType('ChatOpenEventCreateInput', {
  fields: (t) => ({
    id: t.id({ required: false }),
    blockId: t.id({ required: true }),
    stepId: t.id({ required: false }),
    value: t.field({ type: MessagePlatformEnum, required: false })
  })
})

const JourneyViewEventCreateInput = builder.inputType(
  'JourneyViewEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      label: t.string({ required: false }),
      value: t.id({ required: false })
    })
  }
)

const RadioQuestionSubmissionEventCreateInput = builder.inputType(
  'RadioQuestionSubmissionEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      radioOptionBlockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      label: t.string({ required: false }),
      value: t.string({ required: false })
    })
  }
)

const SignUpSubmissionEventCreateInput = builder.inputType(
  'SignUpSubmissionEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      name: t.string({ required: true }),
      email: t.string({ required: true })
    })
  }
)

const StepViewEventCreateInput = builder.inputType('StepViewEventCreateInput', {
  fields: (t) => ({
    id: t.id({ required: false }),
    blockId: t.id({ required: true }),
    value: t.string({ required: false })
  })
})

const StepNextEventCreateInput = builder.inputType('StepNextEventCreateInput', {
  fields: (t) => ({
    id: t.id({ required: false }),
    blockId: t.id({ required: true }),
    nextStepId: t.id({ required: true }),
    label: t.string({ required: false }),
    value: t.string({ required: false })
  })
})

const StepPreviousEventCreateInput = builder.inputType(
  'StepPreviousEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      previousStepId: t.id({ required: true }),
      label: t.string({ required: false }),
      value: t.string({ required: false })
    })
  }
)

const TextResponseSubmissionEventCreateInput = builder.inputType(
  'TextResponseSubmissionEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      label: t.string({ required: false }),
      value: t.string({ required: true })
    })
  }
)

const VideoStartEventCreateInput = builder.inputType(
  'VideoStartEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      position: t.float({ required: false }),
      label: t.string({ required: false }),
      value: t.field({ type: VideoBlockSourceEnum, required: false })
    })
  }
)

const VideoPlayEventCreateInput = builder.inputType(
  'VideoPlayEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      position: t.float({ required: false }),
      label: t.string({ required: false }),
      value: t.field({ type: VideoBlockSourceEnum, required: false })
    })
  }
)

const VideoPauseEventCreateInput = builder.inputType(
  'VideoPauseEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      position: t.float({ required: false }),
      label: t.string({ required: false }),
      value: t.field({ type: VideoBlockSourceEnum, required: false })
    })
  }
)

const VideoCompleteEventCreateInput = builder.inputType(
  'VideoCompleteEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      position: t.float({ required: false }),
      label: t.string({ required: false }),
      value: t.field({ type: VideoBlockSourceEnum, required: false })
    })
  }
)

const VideoExpandEventCreateInput = builder.inputType(
  'VideoExpandEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      position: t.float({ required: false }),
      label: t.string({ required: false }),
      value: t.field({ type: VideoBlockSourceEnum, required: false })
    })
  }
)

const VideoCollapseEventCreateInput = builder.inputType(
  'VideoCollapseEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      position: t.float({ required: false }),
      label: t.string({ required: false }),
      value: t.field({ type: VideoBlockSourceEnum, required: false })
    })
  }
)

const VideoProgressEventCreateInput = builder.inputType(
  'VideoProgressEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      position: t.float({ required: false }),
      progress: t.int({ required: true }),
      label: t.string({ required: false }),
      value: t.field({ type: VideoBlockSourceEnum, required: false })
    })
  }
)

// Helper function to get visitor and journey IDs
async function getEventContext(blockId: string, journeyId?: string) {
  const context = await prisma.block.findUnique({
    where: { id: blockId },
    select: {
      journey: {
        select: { id: true }
      }
    }
  })

  if (!context?.journey) {
    throw new GraphQLError('Block or Journey not found', {
      extensions: { code: 'NOT_FOUND' }
    })
  }

  return {
    journeyId: journeyId || context.journey.id
  }
}

// Helper function to get or create visitor
async function getOrCreateVisitor(context: any): Promise<string> {
  // For now, return a placeholder visitor ID
  // In a real implementation, this would handle visitor creation/lookup
  return 'visitor-placeholder-id'
}

// Mutation: Button Click Event
builder.mutationField('buttonClickEventCreate', (t) =>
  t.field({
    type: ButtonClickEventRef,
    args: {
      input: t.arg({ type: ButtonClickEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'ButtonClickEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          label: input.label,
          value: input.value,
          action: input.action,
          actionValue: input.actionValue,
          visitorId
        }
      })
    }
  })
)

// Mutation: Chat Open Event
builder.mutationField('chatOpenEventCreate', (t) =>
  t.field({
    type: ChatOpenEventRef,
    args: {
      input: t.arg({ type: ChatOpenEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'ChatOpenEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          value: input.value?.toString(),
          messagePlatform: input.value,
          visitorId
        }
      })
    }
  })
)

// Mutation: Journey View Event
builder.mutationField('journeyViewEventCreate', (t) =>
  t.field({
    type: JourneyViewEventRef,
    nullable: true,
    args: {
      input: t.arg({ type: JourneyViewEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const visitorId = await getOrCreateVisitor(context)

      // Check for existing journey view event within 24 hours
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const existingEvent = await prisma.event.findFirst({
        where: {
          typename: 'JourneyViewEvent',
          journeyId: input.journeyId,
          userId: (context as any).user?.id,
          createdAt: { gte: yesterday }
        }
      })

      if (existingEvent) {
        return null // Don't create duplicate within 24 hours
      }

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'JourneyViewEvent',
          journeyId: input.journeyId,
          label: input.label,
          value: input.value,
          languageId: input.value,
          userId: (context as any).user?.id,
          visitorId
        }
      })
    }
  })
)

// Mutation: Radio Question Submission Event
builder.mutationField('radioQuestionSubmissionEventCreate', (t) =>
  t.field({
    type: RadioQuestionSubmissionEventRef,
    args: {
      input: t.arg({
        type: RadioQuestionSubmissionEventCreateInput,
        required: true
      })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'RadioQuestionSubmissionEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          label: input.label,
          value: input.value,
          radioOptionBlockId: input.radioOptionBlockId,
          visitorId
        }
      })
    }
  })
)

// Mutation: Sign Up Submission Event
builder.mutationField('signUpSubmissionEventCreate', (t) =>
  t.field({
    type: SignUpSubmissionEventRef,
    args: {
      input: t.arg({ type: SignUpSubmissionEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'SignUpSubmissionEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          value: input.name,
          email: input.email,
          visitorId
        }
      })
    }
  })
)

// Mutation: Step View Event
builder.mutationField('stepViewEventCreate', (t) =>
  t.field({
    type: StepViewEventRef,
    args: {
      input: t.arg({ type: StepViewEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'StepViewEvent',
          journeyId,
          blockId: input.blockId,
          value: input.value,
          visitorId
        }
      })
    }
  })
)

// Mutation: Step Next Event
builder.mutationField('stepNextEventCreate', (t) =>
  t.field({
    type: StepNextEventRef,
    args: {
      input: t.arg({ type: StepNextEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'StepNextEvent',
          journeyId,
          blockId: input.blockId,
          label: input.label,
          value: input.value,
          nextStepId: input.nextStepId,
          visitorId
        }
      })
    }
  })
)

// Mutation: Step Previous Event
builder.mutationField('stepPreviousEventCreate', (t) =>
  t.field({
    type: StepPreviousEventRef,
    args: {
      input: t.arg({ type: StepPreviousEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'StepPreviousEvent',
          journeyId,
          blockId: input.blockId,
          label: input.label,
          value: input.value,
          previousStepId: input.previousStepId,
          visitorId
        }
      })
    }
  })
)

// Mutation: Text Response Submission Event
builder.mutationField('textResponseSubmissionEventCreate', (t) =>
  t.field({
    type: TextResponseSubmissionEventRef,
    args: {
      input: t.arg({
        type: TextResponseSubmissionEventCreateInput,
        required: true
      })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'TextResponseSubmissionEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          label: input.label,
          value: input.value,
          visitorId
        }
      })
    }
  })
)

// Video Event Mutations
builder.mutationField('videoStartEventCreate', (t) =>
  t.field({
    type: VideoStartEventRef,
    args: {
      input: t.arg({ type: VideoStartEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'VideoStartEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          position: input.position,
          label: input.label,
          value: input.value?.toString(),
          source: input.value,
          visitorId
        }
      })
    }
  })
)

builder.mutationField('videoPlayEventCreate', (t) =>
  t.field({
    type: VideoPlayEventRef,
    args: {
      input: t.arg({ type: VideoPlayEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'VideoPlayEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          position: input.position,
          label: input.label,
          value: input.value?.toString(),
          source: input.value,
          visitorId
        }
      })
    }
  })
)

builder.mutationField('videoPauseEventCreate', (t) =>
  t.field({
    type: VideoPauseEventRef,
    args: {
      input: t.arg({ type: VideoPauseEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'VideoPauseEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          position: input.position,
          label: input.label,
          value: input.value?.toString(),
          source: input.value,
          visitorId
        }
      })
    }
  })
)

builder.mutationField('videoCompleteEventCreate', (t) =>
  t.field({
    type: VideoCompleteEventRef,
    args: {
      input: t.arg({ type: VideoCompleteEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'VideoCompleteEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          position: input.position,
          label: input.label,
          value: input.value?.toString(),
          source: input.value,
          visitorId
        }
      })
    }
  })
)

builder.mutationField('videoExpandEventCreate', (t) =>
  t.field({
    type: VideoExpandEventRef,
    args: {
      input: t.arg({ type: VideoExpandEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'VideoExpandEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          position: input.position,
          label: input.label,
          value: input.value?.toString(),
          source: input.value,
          visitorId
        }
      })
    }
  })
)

builder.mutationField('videoCollapseEventCreate', (t) =>
  t.field({
    type: VideoCollapseEventRef,
    args: {
      input: t.arg({ type: VideoCollapseEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'VideoCollapseEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          position: input.position,
          label: input.label,
          value: input.value?.toString(),
          source: input.value,
          visitorId
        }
      })
    }
  })
)

builder.mutationField('videoProgressEventCreate', (t) =>
  t.field({
    type: VideoProgressEventRef,
    args: {
      input: t.arg({ type: VideoProgressEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'VideoProgressEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          position: input.position,
          progress: input.progress,
          label: input.label,
          value: input.value?.toString(),
          source: input.value,
          visitorId
        }
      })
    }
  })
)
