import { v4 as uuidv4 } from 'uuid'

import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { VideoBlockSource as VideoBlockSourceEnum } from '../../enums'
import { EventInterface } from '../event'
import { validateBlockEvent } from '../utils'

// Video Event Types
export const VideoStartEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'VideoStartEvent',
  isTypeOf: (obj: any) => obj.typename === 'VideoStartEvent',
  fields: (t) => ({
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSourceEnum, nullable: true })
  })
})

export const VideoPlayEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'VideoPlayEvent',
  isTypeOf: (obj: any) => obj.typename === 'VideoPlayEvent',
  fields: (t) => ({
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSourceEnum, nullable: true })
  })
})

export const VideoPauseEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'VideoPauseEvent',
  isTypeOf: (obj: any) => obj.typename === 'VideoPauseEvent',
  fields: (t) => ({
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSourceEnum, nullable: true })
  })
})

export const VideoCompleteEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'VideoCompleteEvent',
  isTypeOf: (obj: any) => obj.typename === 'VideoCompleteEvent',
  fields: (t) => ({
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSourceEnum, nullable: true })
  })
})

export const VideoExpandEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'VideoExpandEvent',
  isTypeOf: (obj: any) => obj.typename === 'VideoExpandEvent',
  fields: (t) => ({
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSourceEnum, nullable: true })
  })
})

export const VideoCollapseEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'VideoCollapseEvent',
  isTypeOf: (obj: any) => obj.typename === 'VideoCollapseEvent',
  fields: (t) => ({
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSourceEnum, nullable: true })
  })
})

export const VideoProgressEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'VideoProgressEvent',
  isTypeOf: (obj: any) => obj.typename === 'VideoProgressEvent',
  fields: (t) => ({
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSourceEnum, nullable: true }),
    progress: t.exposeInt('progress', { nullable: true })
  })
})

// Input types
const VideoStartEventCreateInput = builder.inputType(
  'VideoStartEventCreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      stepId: t.string({ required: false }),
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
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      stepId: t.string({ required: false }),
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
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      stepId: t.string({ required: false }),
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
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      stepId: t.string({ required: false }),
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
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      stepId: t.string({ required: false }),
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
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      stepId: t.string({ required: false }),
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
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      stepId: t.string({ required: false }),
      position: t.float({ required: false }),
      label: t.string({ required: false }),
      value: t.field({ type: VideoBlockSourceEnum, required: false }),
      progress: t.int({ required: false })
    })
  }
)

// Mutations
builder.mutationField('videoStartEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: VideoStartEventRef,
    args: {
      input: t.arg({ type: VideoStartEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { visitor, journeyId } = await validateBlockEvent(
        userId,
        input.blockId,
        input.stepId
      )

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'VideoStartEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          position: input.position,
          label: input.label,
          source: input.value,
          visitorId: visitor.id
        }
      })
    }
  })
)

builder.mutationField('videoPlayEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: VideoPlayEventRef,
    args: {
      input: t.arg({ type: VideoPlayEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { visitor, journeyId } = await validateBlockEvent(
        userId,
        input.blockId,
        input.stepId
      )

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'VideoPlayEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          position: input.position,
          label: input.label,
          source: input.value,
          visitorId: visitor.id
        }
      })
    }
  })
)

builder.mutationField('videoPauseEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: VideoPauseEventRef,
    args: {
      input: t.arg({ type: VideoPauseEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { visitor, journeyId } = await validateBlockEvent(
        userId,
        input.blockId,
        input.stepId
      )

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'VideoPauseEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          position: input.position,
          label: input.label,
          source: input.value,
          visitorId: visitor.id
        }
      })
    }
  })
)

builder.mutationField('videoCompleteEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: VideoCompleteEventRef,
    args: {
      input: t.arg({ type: VideoCompleteEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { visitor, journeyId } = await validateBlockEvent(
        userId,
        input.blockId,
        input.stepId
      )

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'VideoCompleteEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          position: input.position,
          label: input.label,
          source: input.value,
          visitorId: visitor.id
        }
      })
    }
  })
)

builder.mutationField('videoExpandEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: VideoExpandEventRef,
    args: {
      input: t.arg({ type: VideoExpandEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { visitor, journeyId } = await validateBlockEvent(
        userId,
        input.blockId,
        input.stepId
      )

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'VideoExpandEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          position: input.position,
          label: input.label,
          source: input.value,
          visitorId: visitor.id
        }
      })
    }
  })
)

builder.mutationField('videoCollapseEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: VideoCollapseEventRef,
    args: {
      input: t.arg({ type: VideoCollapseEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { visitor, journeyId } = await validateBlockEvent(
        userId,
        input.blockId,
        input.stepId
      )

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'VideoCollapseEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          position: input.position,
          label: input.label,
          source: input.value,
          visitorId: visitor.id
        }
      })
    }
  })
)

builder.mutationField('videoProgressEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: VideoProgressEventRef,
    args: {
      input: t.arg({ type: VideoProgressEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { visitor, journeyId } = await validateBlockEvent(
        userId,
        input.blockId,
        input.stepId
      )

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'VideoProgressEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          position: input.position,
          label: input.label,
          source: input.value,
          progress: input.progress,
          visitorId: visitor.id
        }
      })
    }
  })
)
