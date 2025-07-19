import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { Block } from '../block'

import { ImageBlockCreateInput, ImageBlockUpdateInput } from './inputs'

// Input types are now imported from ./inputs/

export const ImageBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'ImageBlock',
  isTypeOf: (obj: any) => obj.typename === 'ImageBlock',
  directives: { key: { fields: 'id' } },
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', {
      nullable: false,
      directives: { shareable: true }
    }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    src: t.exposeString('src', {
      nullable: true,
      directives: { shareable: true }
    }),
    alt: t.string({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.alt ?? ''
    }),
    width: t.int({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.width ?? 0
    }),
    height: t.int({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.height ?? 0
    }),
    blurhash: t.string({
      nullable: false,
      directives: { shareable: true },
      description: `blurhash is a compact representation of a placeholder for an image.
Find a frontend implementation at https://github.com/woltapp/blurhash
  `,
      resolve: (block) => block.blurhash ?? ''
    }),
    focalTop: t.exposeInt('focalTop', {
      nullable: true,
      directives: { shareable: true }
    }),
    focalLeft: t.exposeInt('focalLeft', {
      nullable: true,
      directives: { shareable: true }
    }),
    scale: t.exposeInt('scale', {
      nullable: true,
      directives: { shareable: true }
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
async function getNextParentOrder(
  journeyId: string,
  parentBlockId: string | null
) {
  if (!parentBlockId) return 0

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

// ImageBlock Mutations
builder.mutationField('imageBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: ImageBlock,
    nullable: false,
    args: {
      input: t.arg({ type: ImageBlockCreateInput, required: true })
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
        throw new GraphQLError('user is not allowed to create image block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const blockId = input.id ?? uuidv4()
        const parentOrder = await getNextParentOrder(
          input.journeyId,
          input.parentBlockId ?? null
        )

        const blockData = {
          id: blockId,
          journeyId: input.journeyId,
          typename: 'ImageBlock',
          parentBlockId: input.parentBlockId,
          parentOrder,
          src: input.src,
          alt: input.alt,
          width: input.width ?? 0,
          height: input.height ?? 0,
          blurhash: input.blurhash ?? '',
          scale: input.scale,
          focalTop: input.focalTop,
          focalLeft: input.focalLeft
        }

        const imageBlock = await tx.block.create({
          data: blockData
        })

        // If this is a cover image, update the parent block's coverBlockId
        if (input.isCover && input.parentBlockId) {
          await tx.block.update({
            where: { id: input.parentBlockId },
            data: { coverBlockId: blockId }
          })
        }

        // Update journey timestamp
        await tx.journey.update({
          where: { id: input.journeyId },
          data: { updatedAt: new Date() }
        })

        return imageBlock
      })
    }
  })
)

builder.mutationField('imageBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: ImageBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: ImageBlockUpdateInput, required: true }),
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
        throw new GraphQLError('image block not found', {
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
        throw new GraphQLError('user is not allowed to update image block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (input.parentBlockId !== undefined)
          updateData.parentBlockId = input.parentBlockId
        if (input.src !== undefined) updateData.src = input.src
        if (input.alt !== undefined) updateData.alt = input.alt
        if (input.blurhash !== undefined) updateData.blurhash = input.blurhash
        if (input.width !== undefined) updateData.width = input.width
        if (input.height !== undefined) updateData.height = input.height
        if (input.scale !== undefined) updateData.scale = input.scale
        if (input.focalTop !== undefined) updateData.focalTop = input.focalTop
        if (input.focalLeft !== undefined)
          updateData.focalLeft = input.focalLeft

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
