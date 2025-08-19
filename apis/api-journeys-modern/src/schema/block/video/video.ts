import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { builder } from '../../builder'
import { VideoBlockSource } from '../../enums'
import { MediaVideo } from '../../mediaVideo/mediaVideo'
import { Block } from '../block'

import { VideoBlockObjectFit } from './enums/videoObjectFit'
import { VideoBlockCreateInput, VideoBlockUpdateInput } from './inputs'

function isMediaVideoSource(
  source: string
): source is 'internal' | 'mux' | 'youTube' {
  return source === 'internal' || source === 'mux' || source === 'youTube'
}

export const VideoBlock = builder.prismaObject('Block', {
  shareable: true,
  interfaces: [Block],
  variant: 'VideoBlock',
  isTypeOf: (obj: any) => obj.typename === 'VideoBlock',
  fields: (t) => ({
    autoplay: t.boolean({
      nullable: true,
      resolve: (block) => block.autoplay ?? false
    }),
    startAt: t.exposeInt('startAt', {
      nullable: true
    }),
    endAt: t.exposeInt('endAt', {
      nullable: true
    }),
    muted: t.boolean({
      nullable: true,
      resolve: (block) => block.muted ?? false
    }),
    videoId: t.exposeID('videoId', {
      nullable: true
    }),
    videoVariantLanguageId: t.exposeID('videoVariantLanguageId', {
      nullable: true
    }),
    source: t.field({
      type: VideoBlockSource,
      nullable: false,
      description: `internal source: videoId, videoVariantLanguageId, and video present
youTube source: videoId, title, description, and duration present`,
      resolve: (block) => block.source ?? 'internal'
    }),
    title: t.exposeString('title', {
      nullable: true
    }),
    description: t.exposeString('description', {
      nullable: true
    }),
    image: t.exposeString('image', {
      nullable: true
    }),
    duration: t.exposeInt('duration', {
      nullable: true
    }),
    objectFit: t.expose('objectFit', {
      type: VideoBlockObjectFit,
      nullable: true
    }),
    posterBlockId: t.exposeID('posterBlockId', {
      nullable: true
    }),
    fullsize: t.boolean({
      nullable: true,
      resolve: (block) => block.fullsize ?? false
    }),
    action: t.relation('action'),
    mediaVideo: t.field({
      type: MediaVideo,
      nullable: true,
      select: {
        source: true,
        videoId: true,
        videoVariantLanguageId: true
      },
      resolve: (block) => {
        if (
          !block.source ||
          !isMediaVideoSource(block.source) ||
          !block.videoId
        ) {
          return null
        }

        // Return a reference to the external video entity with correct typing
        return {
          id: block.videoId,
          primaryLanguageId: block.videoVariantLanguageId,
          source: block.source
        } as any
      }
    })
  })
})

// Helper function to fetch journey with ACL includes
async function fetchJourneyWithAclIncludes(journeyId: string) {
  return await prisma.journey.findUnique({
    where: { id: journeyId },
    include: {
      userJourneys: true,
      team: {
        include: { userTeams: true }
      }
    }
  })
}

// Helper function to fetch block with journey ACL includes
async function fetchBlockWithJourneyAcl(blockId: string) {
  return await prisma.block.findUnique({
    where: { id: blockId, deletedAt: null },
    include: {
      action: true,
      journey: {
        include: {
          userJourneys: true,
          team: {
            include: { userTeams: true }
          }
        }
      }
    }
  })
}

// Helper function to get next parent order
async function getNextParentOrder(journeyId: string, parentBlockId: string) {
  const siblings = await prisma.block.findMany({
    where: {
      journeyId,
      parentBlockId,
      deletedAt: null,
      parentOrder: { not: null }
    },
    orderBy: { parentOrder: 'desc' },
    take: 1
  })

  return (siblings[0]?.parentOrder ?? -1) + 1
}

// VideoBlock Mutations
builder.mutationField('videoBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: VideoBlock,
    nullable: false,
    args: {
      input: t.arg({ type: VideoBlockCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args

      const journey = await fetchJourneyWithAclIncludes(input.journeyId)
      if (!journey) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check permissions using ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to create video block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const parentOrder = await getNextParentOrder(
          input.journeyId,
          input.parentBlockId
        )

        const blockData = {
          id: input.id ?? uuidv4(),
          journeyId: input.journeyId,
          typename: 'VideoBlock',
          parentBlockId: input.parentBlockId,
          parentOrder,
          videoId: input.videoId,
          videoVariantLanguageId: input.videoVariantLanguageId,
          source: input.source ?? 'internal',
          title: input.title,
          description: input.description,
          image: input.image,
          duration: input.duration,
          objectFit: input.objectFit,
          startAt: input.startAt,
          endAt: input.endAt,
          muted: input.muted ?? false,
          autoplay: input.autoplay ?? false,
          fullsize: input.fullsize ?? false,
          posterBlockId: input.posterBlockId
        }

        const videoBlock = await tx.block.create({
          data: blockData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: input.journeyId },
          data: { updatedAt: new Date() }
        })

        return videoBlock
      })
    }
  })
)

builder.mutationField('videoBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: VideoBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: VideoBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args

      const blockWithJourney = await fetchBlockWithJourneyAcl(id)
      if (!blockWithJourney) {
        throw new GraphQLError('video block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check permissions using ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', blockWithJourney.journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to update video block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (input.parentBlockId !== undefined)
          updateData.parentBlockId = input.parentBlockId
        if (input.videoId !== undefined) updateData.videoId = input.videoId
        if (input.videoVariantLanguageId !== undefined)
          updateData.videoVariantLanguageId = input.videoVariantLanguageId
        if (input.posterBlockId !== undefined)
          updateData.posterBlockId = input.posterBlockId
        if (input.title !== undefined) updateData.title = input.title
        if (input.description !== undefined)
          updateData.description = input.description
        if (input.image !== undefined) updateData.image = input.image
        if (input.duration !== undefined) updateData.duration = input.duration
        if (input.objectFit !== undefined)
          updateData.objectFit = input.objectFit
        if (input.startAt !== undefined) updateData.startAt = input.startAt
        if (input.endAt !== undefined) updateData.endAt = input.endAt
        if (input.muted !== undefined) updateData.muted = input.muted
        if (input.autoplay !== undefined) updateData.autoplay = input.autoplay
        if (input.fullsize !== undefined) updateData.fullsize = input.fullsize

        const updatedBlock = await tx.block.update({
          where: { id },
          data: updateData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: blockWithJourney.journeyId },
          data: { updatedAt: new Date() }
        })

        return updatedBlock
      })
    }
  })
)

builder.asEntity(VideoBlock, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async (ref) => {
    return await prisma.block.findUnique({ where: { id: ref.id } })
  }
})
